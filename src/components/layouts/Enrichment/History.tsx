import { ErrorState, InProgressState, OutlineButton } from '@/components/custom/Buttons'
import { DataTable } from '@/components/custom/DataTable'
import ErrorComponent from '@/components/custom/ErrorComponent'
import HUDLoader, { GlobalHUDLoader } from '@/components/custom/HUDLoader'
import { NoEnrichmentHistoryToShow } from '@/components/custom/NoData'
import { convertUTCToLocal } from '@/lib/utils'
import { downloadFile, getHistory } from '@/services'
import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'

interface HistoryData {
  list: string
  leads: number
  enriched: number
  //   processed: number
  //   time: string
  date: string
  // rate: string
  status: string
  file_id: string
}

import { useState } from 'react'

const DownloadFileButton = ({ file_id }: { file_id: string }) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const { refetch } = useQuery({
    queryKey: ['downloadFile', file_id],
    queryFn: () => downloadFile(file_id),
    enabled: false, // Disable automatic query execution
  })

  const handleDownload = async () => {
    setIsDownloading(true)
    const { data } = await refetch()
    const link = data?.download_url
    setIsDownloading(false)
    if (!link) return

    const anchor = document.createElement('a')
    anchor.href = link
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  return (
    <>
      {isDownloading && <GlobalHUDLoader />}
      <OutlineButton className='w-full' onClick={handleDownload}>
        Download
      </OutlineButton>
    </>
  )
}

let columns: ColumnDef<HistoryData>[] = [
  { accessorKey: 'list', header: 'List', size: 1, id: 'column1' },
  { accessorKey: 'for_client', header: 'Client', id: 'client' },
  { accessorKey: 'enrichment_type', header: 'Type', id: 'type' },
  { accessorKey: 'leads', header: 'No. of Leads' },
  //   { accessorKey: 'processed', header: 'No. of Leads Processed' },
  //   { accessorKey: 'time', header: 'Time Elapsed' },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (info) => {
      const value = info.getValue()
      if (!value) return ''
      return convertUTCToLocal(value as string)
    },
  },
  // { accessorKey: 'requested_by', header: 'Created By' },
  // { accessorKey: 'rate', header: 'Completion Rate' },
  {
    header: 'Action',
    cell: ({ row }) => {
      const status = row.original.status
      const leads = row.original.leads
      const enriched = row.original.enriched
      const file_id: string = row.original.file_id

      const rate = leads ? Math.floor(((enriched ?? 0) * 100) / leads) : 0

      return status === 'completed' ? (
        <DownloadFileButton file_id={file_id} />
      ) : status === 'failed' ? (
        <ErrorState />
      ) : (
        <InProgressState rate={rate} />
      )
    },
  },
]

const restructureData = (data: any[]) =>
  data.map((item) => ({
    for_client: item.for_client,
    enrichment_type: item.enrichment_type,
    // requested_by: item.created_by,
    list: item.file_name,
    leads: item.valid_count,
    enriched: item.enrichment_type.includes('enrichment')
      ? item.enriched_count
      : item.validated_count,
    date: item.created_at,
    status: item.status.toLowerCase(),
    file_id: item.id,
  }))

const hideColumns = ['client', 'type']

const History = ({ historyType }: { historyType: string }) => {
  const authState = useAuth0()
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['history', historyType],
    queryFn: () => getHistory(historyType),
    refetchInterval: (query): number | false =>
      query.state.data?.data?.length === 0 ? false : 5000,
    refetchIntervalInBackground: false,
  })
  if (isPending) return <div>loading</div>
  if (isError) return <ErrorComponent error={error} />

  if (authState!.user!.org_name != 'revspot') {
    columns = columns.filter((item) => !hideColumns.includes(item.id!))
  }

  return (
    <div className='flex flex-1 flex-col'>
      <h3 className='py-4 text-lg font-semibold'>{historyType} History</h3>
      {data.data.length > 0 ? (
        <DataTable columns={columns} data={restructureData(data.data)} />
      ) : (
        <NoEnrichmentHistoryToShow />
      )}
    </div>
  )
}

export default History
