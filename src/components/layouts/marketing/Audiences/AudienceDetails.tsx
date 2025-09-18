import { OutlineButton } from '@/components/custom/Buttons'
import DataCard from '@/components/custom/DataCard'
import { DataTable } from '@/components/custom/DataTable'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn, formatBytes, formatNumber } from '@/lib/utils'
import { downloadExport, exportAudience, fetchAudience } from '@/services/discover'
import { ApiFetchState, Audience, Export, SavedFilter } from '@/types'
import { useLocation, useNavigate, useParams, useRouter } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import { ArrowLeftIcon, Loader2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FilterView } from './FilterView'

type Props = {}

const NumberCard = ({ primary, secondary }: { primary: any; secondary: any }) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <dt className='mb-2 text-3xl font-extrabold'>{primary}</dt>
      <dd className='text-gray-500 dark:text-gray-400'>{secondary}</dd>
    </div>
  )
}

declare type fnExportAction = (size: number, force: boolean) => Promise<Export>

export const ExportAudienceButton = ({
  active,
  saveAction,
  children,
  createLabel = 'Create',
}: {
  createLabel?: string
  active: boolean
  saveAction?: fnExportAction
  children: React.ReactNode
}) => {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState(1000)
  const [force, setForce] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const save = async () => {
    setLoading(true)
    try {
      const exp = await saveAction!(size, force)
      toast(`Requested Audience export for size '${exp.id}'`)
    } finally {
      setOpen(false)
      setLoading(false)
    }
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={!active}
          // onClick={() => saveAction!()}
          className='inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
        >
          {children}
        </Button>
        {/* <button
            type='button'
            disabled={!ud.validResult()}
            onClick={() => ud.saveAudience()}
            className='inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
          >
            Save as Audience
          </button> */}
      </PopoverTrigger>
      <PopoverContent className='w-120 p-10' side='left' align='center'>
        <div className='grid gap-2 overflow-y-auto p-4'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Export audience</h4>
            <p className='text-sm text-muted-foreground'>
              You are requesting an export of the audience in CSV format. <br />
              This will incur credits. Contact Revspot in need of assistance.
            </p>
          </div>
          <div className='grid gap-2'>
            <div className='grid grid-cols-1 items-center gap-4'>
              <Label htmlFor='size'>
                Export size
                <p className='mt-1 text-xs text-slate-400'>Max export size is 10,000.</p>
              </Label>
              <Input
                id='size'
                defaultValue={size}
                onChange={(e) => setSize(+e.target.value)}
                placeholder='Enter size of the exports, -1 to export all'
                className='h-8'
                type='number'
              />

              <Label htmlFor='name' className='hidden'>
                Force
                <p className='mt-1 text-xs text-slate-400'>
                  By default, only one export is allowed, check this box, to force export
                </p>
              </Label>
              <Checkbox
                id='name'
                checked={force}
                onCheckedChange={(checked) => checked != 'indeterminate' && setForce(checked)}
                //   placeholder='Enter Audience Name(Min 5 chars.)'
                className='hidden h-8 w-8'
              />
              <span className='text-sm text-red-500'>*{size} will be deducted on completion of export</span>
              <Button
                variant='outline'
                disabled={loading || !active || loading || (size < 1 && size != -1) || size > 10000}
                onClick={() => save()}
                className='mt-4 inline-flex items-center rounded-md bg-primary px-3 py-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                {!loading && createLabel}
                {loading && <Loader2 className='animate-spin' />}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const DownloadExportButton = ({
  exports,
  onDownload,
}: {
  exports: Export
  onDownload?: (id: string) => Promise<void>
}) => {
  const [download, setDownload] = useState(false)
  const doDownload = async () => {
    setDownload(true)
    await onDownload!(exports.id)
    setDownload(false)
  }
  return (
    <OutlineButton
      disabled={exports.status != 'completed' || download}
      className={cn('w-full', exports.status == 'completed' ? 'bg-green-200' : '')}
      onClick={() => doDownload()}
    >
      {download && <Loader2 className='animate-spin' />}
      {exports.status == 'completed' && 'Download'}
      {exports.status != 'completed' && <Loader2 className='animate-spin' />}
      {exports.status != 'completed' && exports.status}
    </OutlineButton>
  )
}

const AudienceDetails = (props: Props) => {
  const router = useRouter()
  const navigate = useNavigate()
  let params = useParams({ from: '/audiences/$audienceId/' })
  const [audience, setAudience] = useState<Audience | undefined>(undefined)
  const [status, setStatus] = useState<ApiFetchState>(ApiFetchState.Loading)
  const [query, setQuery] = useState<SavedFilter[]>()
  const downloadFileRef = useRef<HTMLAnchorElement | null>(null)
  const [downloadFileUrl, setDownloadFileUrl] = useState<string>()
  const [downloadFileName, setDownloadFileName] = useState<string>()

  const handleDownload = async (id: string) => {
    const url = await downloadExport(id)
    setDownloadFileUrl(url)
    setDownloadFileName(`${id}.csv`)

    // navigate({
    //     // to: `/audiences/${id}`,
    //     // state: { data: data?.data.find((segment: any) => segment._id === segmentId) || {} },
    // })
  }

  const requestExport: fnExportAction = async (size: number, force: boolean) => {
    const expo = await exportAudience(+params.audienceId, force, size)
    await load()
    return expo
  }

  const load = async () => {
    try {
      setStatus(ApiFetchState.Loading)
      const data = await fetchAudience(+params.audienceId)
      const query = JSON.parse(data.query)
      setQuery(query['filters'])
      setAudience(data)
      setStatus(ApiFetchState.Success)
    } catch (e) {
      setStatus(ApiFetchState.Failed)
    }
  }

  const columns: ColumnDef<Export, any>[] = [
    { accessorKey: 'id', header: '# ID' },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ getValue }) => {
        return formatNumber(getValue())
      },
    },
    {
      accessorKey: 'file_size',
      header: 'File Size',
      cell: ({ getValue, row }) => {
        if (row.original.status == 'completed') {
          return formatBytes(getValue())
        } else {
          return '-'
        }
      },
    },
    // {
    //     accessorKey: 'status', header: 'Status', cell: ({ getValue }) => {
    //         if (getValue() == "completed") {
    //             return "ready"
    //         } else {
    //             return getValue()
    //         }
    //     }
    // },
    // { accessorKey: 'progress', header: 'Progress' },
    {
      accessorKey: 'created_at',
      header: 'Created On',
      cell: ({ getValue }) => {
        return new Date(getValue()).toDateString()
      },
    },
    {
      accessorKey: 'id',
      id: 'action_id',
      header: 'Action',
      cell: ({ getValue, row }) => (
        <DownloadExportButton
          exports={row.original}
          onDownload={handleDownload}
        ></DownloadExportButton>
        // <OutlineButton
        //     disabled={row.original.status != "completed"}
        //     className={cn('w-full', row.original.status == 'completed' ? "bg-green-200" : "")}
        //     onClick={() => handleDownload(getValue())}>
        //     {row.original.status == "completed" && "Download"}
        //     {row.original.status != "completed" && <Loader2 className="animate-spin" />}
        //     {row.original.status != "completed" && row.original.status}
        // </OutlineButton>
      ),
    },
  ]
  // console.log(params)
  // const stateData = useLocation({
  //     select: (location) => {
  //         console.log(location)
  //         return location.state || {}
  //     }
  // })

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (downloadFileName && downloadFileUrl) {
      downloadFileRef.current?.click()
    }
  }, [downloadFileName])

  return (
    <>
      <a
        href={downloadFileUrl}
        download={downloadFileName}
        className='hidden'
        ref={downloadFileRef}
      />
      {status == ApiFetchState.Loading && (
        <div className='grid h-full w-full place-items-center p-10 text-center text-sm'>
          <div className='grid place-items-center gap-2'>
            <Loader2 className='animate-spin' /> loading... please wait
          </div>
        </div>
      )}
      {status == ApiFetchState.Success && audience != undefined && (
        <div className='flex flex-col space-y-6'>
          <div className='flex justify-between'>
            <div className='flex items-center space-x-2'>
              <ArrowLeftIcon
                onClick={() => router.history.back()}
                className='hover:text-primary hover:underline'
              />
              <h3 className='text-lg font-semibold'>{audience?.name}</h3>
            </div>
          </div>
          <DataCard
            cardName='Basic Details'
            extraComponent={
              <div className='text-sm'>
                <span className='text-xs'>Created:</span>{' '}
                {new Date(audience.created_at).toDateString()}|{' '}
                <span className='text-xs'>Updated:</span>{' '}
                {new Date(audience.created_at).toDateString()}
              </div>
            }
          >
            <div
              className='rounded-lg bg-white px-8 dark:bg-gray-800'
              id='stats'
              role='tabpanel'
              aria-labelledby='stats-tab'
            >
              <dl className='mx-auto grid max-w-screen-xl grid-cols-2 gap-8 p-4 text-gray-900 dark:text-white sm:grid-cols-3 sm:p-8 xl:grid-cols-3'>
                <NumberCard
                  primary={formatNumber(audience.target_size)}
                  secondary='Target Size'
                ></NumberCard>
                <NumberCard
                  primary={formatNumber(audience.export_offset)}
                  secondary='Total Exports'
                ></NumberCard>
                <NumberCard
                  primary={audience.export_in_progress}
                  secondary='Exports In progress'
                ></NumberCard>
              </dl>
            </div>
          </DataCard>
          {query && (
            <DataCard cardName='Filters'>
              <div className='grid grid-cols-3 gap-4'>
                {query?.map((q) => <FilterView filter={q} key={q.name} />)}
              </div>
            </DataCard>
          )}
          <DataCard
            cardName='Exports'
            extraComponent={
              <ExportAudienceButton
                active={true}
                createLabel='Start Export'
                saveAction={requestExport}
              >
                Request Export
              </ExportAudienceButton>
            }
          >
            <DataTable columns={columns} data={audience?.exports}></DataTable>
          </DataCard>
        </div>
      )}
    </>
  )
}

export default AudienceDetails
