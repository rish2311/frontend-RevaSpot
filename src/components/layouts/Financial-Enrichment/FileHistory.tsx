import { DataTable } from '@/components/custom/DataTable'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { fetchAllFbFiles, getFbDownloadUrl, uploadEnrichedFileForFb } from '@/services'
import { Spinner } from '@/components/custom/HUDLoader'

const requiredColumns = [
  'RPT-ID',
  'applicant_name',
  'mobile',
  'Address-1',
  'Address-2',
  'Address-3',
  'DOB',
  'Credit_score',
  'Current_pincode',
  'State',
  'Current_city',
  'age',
  'Age Band',
  'Earning per month.',
  'Agg_sanc(CC)',
  'Agg_ostd(CC)',
  'Total Credit Cards',
  'Recent_CC(OriginationDate)',
  'Recent_CC(sanc)',
  'Agg_sanc(Home Loan)',
  'Agg_ostd(Home Loan)',
  'Total Home Loans',
  'Recent_hl_(OriginationDate)',
  'Recent_hl_(sanc)',
  'Home_EMI',
  'Total cars',
  'Agg_sanc(auto)',
  'Agg_ostd(auto)',
  'Recent_al_(OriginationDate)',
  'Recent_al_(sanc)',
  'Email_1',
  'Email_2',
  'Email_3'
]
const convertUTCtoIST = (utcDateString: string | null) => {
  if (!utcDateString) return '-';

  const utcDate = new Date(utcDateString);
  if (isNaN(utcDate.getTime())) return 'Invalid Date';

  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};



const FileHistory = ({ org }: { org: string }) => {
  const queryClient = useQueryClient()
  const uploadMutation = useMutation({
    mutationFn: ({ file, fb_id }: { file: File; fb_id: string }) =>
      uploadEnrichedFileForFb(file, fb_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fb-files-history'] })
      toast.success('File uploaded successfully!')
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`)
    },
  })

  const downloadMutation = useMutation({
    mutationFn: ({ fb_id, file_type }: { fb_id: string; file_type: string }) =>
      getFbDownloadUrl(fb_id, file_type),
    onSuccess: (data) => {
      if (data.data?.download_url) {
        window.open(data.data.download_url, '_blank')
        toast.success('Download started')
      } else {
        toast.error('Failed to get download URL')
      }
    },
    onError: () => {
      toast.error('Error downloading file')
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fb_id: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv') {
      toast.error('Only CSV files are allowed.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = text.split('\n')
      const headers = rows[0].split(',').map((h) => h.trim())

      const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
      if (missingColumns.length > 0) {
        toast.error(`Missing columns: ${missingColumns.join(', ')}`)
        return
      }

      uploadMutation.mutate({ file, fb_id })
    }

    reader.readAsText(file)
  }

  const handleDownloadFile = (fb_id: string, file_type: string) => {
    downloadMutation.mutate({ fb_id, file_type })
  }
  const columns: ColumnDef<any>[] =
    org === 'finance_buddha'
      ? [
        {
          accessorKey: '_id',
          header: '# ID',
          cell: ({ row }: any) => row.original._id.slice(0, 6),
        },
        {
          accessorKey: 'raw_filename',
          header: 'Filename',
          cell: ({ row }: any) => row.original.raw_filename.replace('raw-data/', ''),
        },
        {
          accessorKey: 'status',
          header: 'Status',
          cell: ({ row }: any) => (
            <Badge variant={(row.original.status === 'enriched' || row.original.status === 'processing') ? 'default' : 'destructive'}>
              {(row.original.status === 'unenriched' || row.original.status === 'downloaded') ? 'unenriched' : 'enriched'}
            </Badge>
          ),
        },
        {
          accessorKey: 'uploaded_date',
          header: 'Uploaded Date',
          cell: ({ row }: any) => convertUTCtoIST(row.original.uploaded_date),
        },
        {
          accessorKey: 'enriched_date',
          header: 'Enriched Date',
          cell: ({ row }: any) =>
            row.original.enriched_date ? convertUTCtoIST(row.original.enriched_date) : '-',
        },
        {
          accessorKey: 'id',
          id: 'actions',
          header: 'Actions',
          cell: ({ row }: any) => {
            const fileInputRef = React.createRef<HTMLInputElement>()

            return (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleDownloadFile(row.original._id, 'raw')}
                >
                  Download Raw Data
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv'
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, row.original._id)}
                />
                <Button
                  variant='outline'
                  disabled={row.original.status === 'enriched' || row.original.status === 'processing'}
                  onClick={() => fileInputRef.current?.click()}
                  size='sm'
                  style={{ marginLeft: '8px' }}
                >
                  Upload Enriched Data
                </Button>
              </>
            )
          },
        },
      ]
      : [
        {
          accessorKey: '_id',
          header: '# ID',
          cell: ({ row }: any) => row.original._id.slice(0, 6),
        },
        {
          accessorKey: 'row_count',
          header: 'Row Count',
          cell: ({ row }: any) => row.original.row_count,
        },

        {
          accessorKey: 'raw_filename',
          header: 'Filename',
          cell: ({ row }: any) => row.original.raw_filename.replace('raw-data/', ''),
        },
        {
          accessorKey: 'type',
          header: 'Type',
          cell: ({ row }: any) => row.original.type,
        },

        {
          accessorKey: 'uploaded_date',
          header: 'Uploaded Date',
          cell: ({ row }: any) => convertUTCtoIST(row.original.uploaded_date),
        },
        {
          accessorKey: 'enriched_date',
          header: 'Enriched Date',
          cell: ({ row }: any) =>
            row.original.enriched_date ? convertUTCtoIST(row.original.enriched_date) : '-',
        },
        {
          accessorKey: 'status',
          header: 'Status',
          cell: ({ row }: any) => (
            <Badge variant={row.original.status === 'enriched' ? 'default' : 'destructive'}>
              {row.original.status}
            </Badge>
          ),
        },
        {
          accessorKey: 'id',
          id: 'actions',
          header: 'Actions',
          cell: ({ row }: any) =>
            <div className='space-x-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleDownloadFile(row.original._id, 'raw')}
              >
                Download Raw data
              </Button>
              <Button
                onClick={() => handleDownloadFile(row.original._id, 'enriched')}
                disabled={row.original.status === 'unenriched' || row.original.status === 'downloaded'}
                variant='outline'
                size='sm'
              >
                Download Enriched Data
              </Button>
            </div>
        },
      ]

  const { data: fbFilesData, isFetching } = useQuery({
    queryKey: ['fb-files-history'],
    queryFn: () => fetchAllFbFiles(),
  })

  return (
    <Card className='mt-8'>
      {isFetching ? (
        <CardContent>
          <Spinner />
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Financial Enrichment History</CardTitle>
            <CardDescription>
              All your uploaded financial data will be available here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={fbFilesData?.data.fb_list} />
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default FileHistory
