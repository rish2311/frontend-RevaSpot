import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getSingleEnrichmentHistory } from '@/services'
import ErrorComponent from '@/components/custom/ErrorComponent'
import { NoEnrichmentHistoryToShow } from '@/components/custom/NoData'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { VerifiedIcon } from 'lucide-react'

type HistoryData = {
  linkedin: string
  name: string
  phone?: string
  email?: string
  phone_verified?: boolean
  email_verified?: boolean
  job_title: string
  company_name: string
  status: string
  contact_type: string // Added to track the type of contact request
  created_at?: string // For sorting by date
}

const statusTone = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const contactTypeTone = (type: string) => {
  switch (type) {
    case 'phone':
      return 'bg-purple-100 text-purple-800'
    case 'professional_email':
      return 'bg-blue-100 text-blue-800'
    case 'personal_email':
      return 'bg-cyan-100 text-cyan-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatContactType = (type: string) => {
  switch (type) {
    case 'professional_email':
      return 'Prof. Email'
    case 'personal_email':
      return 'Personal Email'
    case 'phone':
      return 'Phone'
    default:
      return type
  }
}

const extractLinkedInUsername = (val: string): string => {
  if (!val || val === 'N/A') return 'N/A'
  try {
    const urlObj = new URL(val)
    if (urlObj.hostname.includes('linkedin.com')) {
      const path = urlObj.pathname.replace(/\/$/, '')
      return path.split('/').pop() || val
    }
    return val
  } catch {
    return val
  }
}

const restructureData = (data: any[], historyType: string): HistoryData[] => {
  // If historyType includes multiple types (comma-separated), we need to handle each item
  const isMultiType = historyType.includes(',')
  
  return data.map((item) => ({
    linkedin: item?.linkedin ?? 'N/A',
    name: item?.name ?? 'Unknown',
    phone: item?.phone ?? undefined,
    email: item?.email ?? undefined,
    phone_verified: item?.phone_verified ?? false,
    email_verified: item?.email_verified ?? false,
    job_title: item?.title ?? 'No Title',
    company_name: item?.company ?? 'No Company',
    status: String(item?.status ?? 'unknown').toLowerCase(),
    contact_type: item?.contact_type ?? (isMultiType ? 'unknown' : historyType),
    created_at: item?.created_at ?? item?.timestamp,
  }))
}

export default function SingleEnrichmentHistory({ historyType }: { historyType: string }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')

  const offset = pageIndex * pageSize
  const limit = pageSize

  // Determine if we're showing combined history
  const isMultiType = historyType.includes(',')
  const showBothColumns = isMultiType

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['single-history', historyType, offset, limit],
    queryFn: () => getSingleEnrichmentHistory(historyType, offset, limit),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchInterval: (q) => ((q.state.data as any)?.data?.contacts?.length ? 20000 : false),
  })

  if (isError) return <ErrorComponent error={error} />

  const raw = data?.data?.contacts ?? []
  const totalCount = data?.data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const tableData = useMemo(() => {
    let rows = restructureData(raw, historyType)
    
    // Sort by created_at date (most recent first)
    rows = rows.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })

    if (!search.trim()) return rows
    const s = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.company_name.toLowerCase().includes(s) ||
        r.job_title.toLowerCase().includes(s) ||
        r.linkedin.toLowerCase().includes(s) ||
        (r.email ?? '').toLowerCase().includes(s) ||
        (r.phone ?? '').toLowerCase().includes(s) ||
        r.contact_type.toLowerCase().includes(s)
    )
  }, [raw, historyType, search])

  const onPrev = () => setPageIndex((p) => Math.max(0, p - 1))
  const onNext = () => setPageIndex((p) => Math.min(totalPages - 1, p + 1))

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <h3 className='py-2 text-lg font-semibold'>
          Contact History 
        </h3>
      </div>

      <div className='rounded-md border'>
        <Table className='rounded-md bg-white'>
          <TableHeader>
            <TableRow>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Name</TableHead>
              {showBothColumns ? (
                <>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </>
              ) : historyType === 'phone' ? (
                <TableHead>Phone</TableHead>
              ) : (
                <TableHead>Email</TableHead>
              )}
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              {isMultiType && <TableHead>Type</TableHead>}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className='animate-pulse duration-600'>
                  <TableCell 
                    className='h-10 animate-pulse bg-gray-200' 
                    colSpan={isMultiType ? 8 : 6} 
                  />
                </TableRow>
              ))
            ) : tableData.length ? (
              tableData.map((row, idx) => (

                <TableRow key={`${row.linkedin}-${idx}`}>
                  <TableCell>
                    {row.linkedin === 'N/A' ? (
                      'N/A'
                    ) : (
                      <a
                        href={row.linkedin}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline'
                      >
                        {extractLinkedInUsername(row.linkedin)}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  
                  {showBothColumns ? (
                    <>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          {row.email || '-'}
                          {row.email && row.email_verified && (
                            <VerifiedIcon size={16} className='text-green-500' />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          {row.phone || '-'}
                          {row.phone && row.phone_verified && (
                            <VerifiedIcon size={16} className='text-green-500' />
                          )}
                        </div>
                      </TableCell>
                    </>
                  ) : historyType === 'phone' ? (
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        {row.phone}
                        {row.phone_verified && (
                          <VerifiedIcon size={16} className='text-green-500' />
                        )}
                      </div>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        {row.email}
                        {row.email_verified && (
                          <VerifiedIcon size={16} className='text-green-500' />
                        )}
                      </div>
                    </TableCell>
                  )}
                  
                  <TableCell>{row.job_title}</TableCell>
                  <TableCell>{row.company_name}</TableCell>
                  
                  {isMultiType && (
                    <TableCell>
                      <Badge className={cn('capitalize text-xs', contactTypeTone(row.contact_type))}>
                        {formatContactType(row.contact_type)}
                      </Badge>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <Badge className={cn('capitalize', statusTone(row.status))}>
                      {row.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMultiType ? 8 : 6}>
                  <NoEnrichmentHistoryToShow />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className='flex items-center justify-between'>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={onPrev}
                className={pageIndex === 0 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
            <div className='px-3 py-2 text-sm'>
              Page {totalPages ? pageIndex + 1 : 0} of {totalPages}
            </div>
            <PaginationItem>
              <PaginationNext
                onClick={onNext}
                className={
                  pageIndex >= totalPages - 1 ? 'pointer-events-none opacity-50' : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
