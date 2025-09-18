import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FileIcon, MoreHorizontal, Download, FolderInputIcon } from 'lucide-react'
import { downloadContactExtractionFile, getContactFileHistory, triggerContactExtractionExport } from '@/services/contact'
import { useMutation, useQuery } from '@tanstack/react-query'
import { formatUTCToIST } from '@/lib/utils'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export type ContactFileHistory = {
  _id: { $oid: string }
  id: string
  input_s3_file_name: string
  manual_output_s3_file_name: string
  performance_output_s3_file_name: string
  lead_count: number
  file_name: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'active' | 'error'
  uploaded_by: string
  uploaded_date: string
  credits_consumed: number
  extraction_pct: number
  all_stages: any[]
}

type ExportType = 'manual' | 'performance'

const getSourceStatusColor = (status: string) => {
  return (
    {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      uploaded: 'bg-yellow-100 text-yellow-800',
      active: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
      error: 'bg-red-100 text-red-800',
    }[status] || 'bg-gray-100 text-gray-800'
  )
}

const ContactFileHistoryList = () => {
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null)
  const [selectedExportTypes, setSelectedExportTypes] = useState<Record<string, ExportType>>({})

  const {
    data: fileHistory,
    isLoading,
    error,
    refetch: refetchFileHistory,
  } = useQuery({
    queryKey: ['contact-file-history'],
    queryFn: () => getContactFileHistory(),
    refetchInterval: 20 * 1000,
  })

  const getStageProgress = (allStages: any[]) => {
    const completedStages: any[] = []
    allStages.forEach((stage) => {
      if (stage.stage_status === 'completed') {
        completedStages.push(stage)
      }
    })

    return `${completedStages.length}/${allStages.length}`
  }

  const exportMutation = useMutation({
    mutationFn: ({ contactFileId }: { contactFileId: string }) =>
      triggerContactExtractionExport(contactFileId, "manual"),
    onSuccess: () => {
      toast.success('Export Triggered Successfully')
      refetchFileHistory()
      setPopoverOpenId(null)
    },
    onError: () => {
      toast.error('Export Failed')
      setPopoverOpenId(null)
    },
  })

  const handleExportTypeChange = (contactFileId: string, exportType: ExportType) => {
    setSelectedExportTypes(prev => ({
      ...prev,
      [contactFileId]: exportType
    }))
  }

  const handleExport = (contactFile: ContactFileHistory) => {
    const exportType = selectedExportTypes[contactFile.id]
    if (!exportType) {
      toast.error('Please select an export type')
      return
    }
    exportMutation.mutate({ contactFileId: contactFile.id })
  }

  // Use mutation instead of query for downloads
  const downloadMutation = useMutation({
    mutationFn: ({ contactFileId }: { contactFileId: string}) =>
      downloadContactExtractionFile(contactFileId, "manual"),
    onSuccess: (data, { contactFileId }) => {
      if (data?.success && data?.data?.download_url) {
        const link = document.createElement('a')
        link.href = data.data.download_url
        console.log(data.data.download_url)
        link.download = `contact-file-${contactFileId}-manual-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('File Downloaded Successfully')
      } else {
        toast.error('Download Failed - Invalid response')
      }
      setPopoverOpenId(null)
    },
    onError: (error) => {
      console.error('Download error:', error)
      toast.error('Download Failed')
      setPopoverOpenId(null)
    },
  })

  const handleDownload = (contactFile: ContactFileHistory) => {
    downloadMutation.mutate({ contactFileId: contactFile.id})
  }

  if (isLoading) {
    return (
      <Card className='bg-white shadow-md'>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-800'>File History</h3>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='h-6 animate-pulse rounded bg-gray-200' />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='bg-white shadow-md'>
        <CardHeader>
          <h3 className='text-lg font-semibold text-gray-800'>File History</h3>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-red-500'>
            Error loading file history. Please try again.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bg-white shadow-md'>
      <CardHeader>
        <h3 className='text-lg font-semibold text-gray-800'>File History</h3>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead>Progress (%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-center'>Lead Count</TableHead>
              <TableHead className='text-center'>Credits Consumed</TableHead>
              <TableHead className='text-center'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fileHistory && fileHistory.data && fileHistory.data.length > 0 ? (
              fileHistory.data.map((contactFile: ContactFileHistory) => (
                <TableRow key={contactFile.id}>
                  <TableCell className='font-medium'>
                    <div className='flex max-w-xs items-center gap-2 truncate'>
                      <FileIcon className='h-4 w-4 text-gray-500' />
                      <span
                        className='cursor-pointer truncate text-blue-600 hover:text-blue-800'
                        title={contactFile.file_name}
                      >
                        {contactFile.input_s3_file_name.split('/').pop()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{contactFile.uploaded_by}</TableCell>
                  <TableCell>
                    <div className='text-sm text-muted-foreground'>
                      {formatUTCToIST(contactFile.uploaded_date)}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    {Math.round(contactFile.extraction_pct * 100)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getSourceStatusColor(contactFile.status)} capitalize`}>
                      {contactFile.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>{contactFile.lead_count}</TableCell>
                  <TableCell className='text-center'>{contactFile.credits_consumed}</TableCell>
                  <TableCell className='text-center'>
                    <Popover open={popoverOpenId === contactFile.id} onOpenChange={(open) => setPopoverOpenId(open ? contactFile.id : null)}>
                      <PopoverTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0 hover:bg-gray-100'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-64' align='end'>
                        <Button
                          variant='ghost'
                          size='sm'
                          disabled={
                            !contactFile.manual_output_s3_file_name ||
                            exportMutation.isPending ||
                            downloadMutation.isPending
                          }
                          className='h-auto justify-start px-2 py-1 font-normal'
                          onClick={() => handleDownload(contactFile)}
                        >
                          <Download className='mr-2 h-4 w-4' />
                          {downloadMutation.isPending ? 'Downloading...' : 'Download'}
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className='py-8 text-center text-gray-500'>
                  <div className='flex flex-col items-center gap-2'>
                    <FileIcon className='h-8 w-8 text-gray-400' />
                    <span>No files have been uploaded yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ContactFileHistoryList
