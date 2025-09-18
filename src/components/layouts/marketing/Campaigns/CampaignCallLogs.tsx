import { getLeadCallLogs } from '@/services/campaigns'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import React from 'react'
import { format, parseISO } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Copy, Play, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatTranscript } from './FormatTranscript'
import { AudioPlayer } from './AudioPlayer'

interface CallLogResponse {
  success: boolean
  data: CallLogData[]
}

interface CallLogData {
  _id: string
  client: string
  lead_name: string
  lead_phone: string
  agent_identifier: string
  status: string
  call_id: string
  created_at: string
  updated_at: string
  billing_unit_type: string
  billing_unit_value: number
  call_cost: number
  call_recording: string
  report_data: {
    call_status: string
    lead_status: string
    interest_level: string
    name_confirmation: boolean
    went_to_voicemail: boolean
  }
  transcript: string
}

const CampaignCallLogs: React.FC = () => {
  const { campaign_lead } = useParams({
    from: '/campaigns/$campaignId/$campaign_lead/',
  })

  const { data, isLoading, isError, error } = useQuery<CallLogResponse>({
    queryKey: ['call-log', campaign_lead],
    queryFn: () => getLeadCallLogs(campaign_lead),
  })

  const handleCopyTranscript = (transcript: string) => {
    navigator.clipboard
      .writeText(transcript)
      .then(() => {
        toast.success('Transcript Copied')
      })
      .catch((err) => {
        toast.error('Copy Failed')
      })
  }

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-xl'>Loading call logs...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='text-center text-red-500'>
        <p className='text-xl'>
          Error loading call logs:
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <h1 className='mb-6 text-3xl font-bold'>Call Logs</h1>

      {data?.data && data.data.length > 0 ? (
        <div className='space-y-4'>
          {data.data.map((log) => (
            <Card key={log._id} className='w-full'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <CardTitle>{log.lead_name}</CardTitle>
                    <Badge variant='secondary'>{log.lead_phone}</Badge>
                  </div>
                </div>
              </CardHeader>
              {
                log.report_data !== null &&
                (
                  <CardContent>
                    <div className=''>
                      <div className='flex flex-row gap-4'>
                        <div className='flex items-center justify-center gap-1'>
                          <span className='text-md'>Call Status:</span>
                          <Badge variant='outline'>{log.report_data.call_status}</Badge>
                        </div>
                        <div className='flex items-center justify-center gap-1'>
                          <span className='text-md'>Lead Status:</span>
                          <Badge variant='outline'>{log.report_data.lead_status}</Badge>
                        </div>
                        <div className='flex items-center justify-center gap-1'>
                          <span className='text-md'>Interest Level:</span>{' '}
                          <Badge variant='outline'>{log.report_data.interest_level}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )
              }
              <CardFooter className='flex items-center justify-between'>
                <CardDescription className='mt-2 align-bottom'>
                  Called on {log.created_at}
                </CardDescription>
                <div className='mt-4 flex justify-end space-x-2'>
                  <AudioPlayer audioUrl={log.call_recording} />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant='outline' size='icon'>
                        <FileText className='h-4 w-4' />
                      </Button>
                    </DialogTrigger>
                    {
                      log.transcript !== null && (
                        <DialogContent className='sm:max-w-[625px]'>
                          <DialogHeader>
                            <DialogTitle>Call Transcript</DialogTitle>
                          </DialogHeader>
                          <div className='grid h-[70vh] gap-4 overflow-y-scroll p-6 py-4'>
                            {formatTranscript(log.transcript)}
                          </div>
                        </DialogContent>
                      )
                    }
                  </Dialog>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => handleCopyTranscript(log.transcript)}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Transcript</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className='text-center text-muted-foreground'>No call logs found for this lead</p>
      )}
    </div>
  )
}

export default CampaignCallLogs
