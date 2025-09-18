import { useState, useEffect } from 'react'
import { getCampaignLeads, updateCampaignLeads } from '@/services/campaigns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import ErrorComponent from '@/components/custom/ErrorComponent'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Phone, Search, User, Filter, EditIcon, InfoIcon, VoicemailIcon } from 'lucide-react'
import { AccessorKeyColumnDef, PaginationState } from '@tanstack/react-table'
import { VirtualizedDataTable } from '@/components/custom/VirtualisedDataTable'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LeadData {
  _id: string
  campaign_id: number
  person_id: number
  status: string
  lead_status: string,
  remarks: string | null
  name: string
  phone: string | null
}

const CampaignLeads = ({ total_leads, status }: any) => {
  const { campaignId } = useParams({ from: '/campaigns/$campaignId/' })
  console.log(status)
  const statusOptions = [
    { value: '', label: 'All' },
    ...status.map((item: any) => ({
      value: item.status,
      label: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/_/g, ' ')
    }))
  ]

  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isError, error } = useQuery({
    queryKey: ['campaign-leads', campaignId, paginationState.pageIndex, paginationState.pageSize],
    queryFn: () =>
      getCampaignLeads(campaignId, paginationState.pageSize, paginationState.pageIndex + 1),
  })

  const queryClient = useQueryClient()
  const [columnVisibility, setColumnVisibility] = useState({})
  const [leads, setLeads] = useState<LeadData[]>([]);

  useEffect(() => {
    if (data?.data) {
      setLeads(data.data);
    }
  }, [data]);

  if (isError) return <ErrorComponent error={error} />;

  const filteredLeads = leads.filter((lead: LeadData) => {
    const matchesSearch =
      searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery));

    if (statusFilter === '') return matchesSearch;

    const formattedLeadStatus = lead.status.replace(/_/g, ' ');

    const matchesStatus = formattedLeadStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateMutation = useMutation({
    mutationKey: ['campaign-leads'],
    mutationFn: ({
      campaignId,
      personId,
      status,
      remark,
    }: {
      campaignId: string;
      personId: string;
      status?: string;
      remark?: string;
    }) => updateCampaignLeads(campaignId, personId, status, remark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-metrics'] })
    },
    onError: (error) => {
      console.error("Error updating status:", error);
    },
  });

  const toggleStatus = (currLead: any, status: string) => {
    console.log(currLead)
    const previousLeads = [...leads];

    setLeads((prevLeads) =>
      prevLeads.map((lead: any) =>
        lead._id === currLead._id ? { ...lead, status } : lead
      )
    );

    updateMutation.mutate(
      { campaignId: currLead.campaign_id, personId: currLead.person_id, status },
      {
        onError: () => setLeads(previousLeads),
      }
    );
  };

  const updateRemarks = (currLead: any, newRemark: string) => {
    if (!currLead) return;

    const previousLeads = [...leads];

    setLeads((prevLeads: any) =>
      prevLeads.map((lead: any) =>
        lead.id === currLead.id ? { ...lead, remarks: newRemark } : lead
      )
    );

    updateMutation.mutate(
      { campaignId: currLead.campaign_id, personId: currLead.person_id, remark: newRemark },
      {
        onError: () => setLeads(previousLeads),
      }
    );

  };

  const columns: AccessorKeyColumnDef<LeadData>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info: any) => (
        <div className='flex items-center gap-2'>
          <User size={16} className='text-muted-foreground' />
          <span>{info.getValue() || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: (info: any) => {
        const value = info.getValue();
        return value ? (
          <div className='flex items-center gap-2'>
            <Phone size={16} className='text-muted-foreground' />
            <span>{value}</span>
          </div>
        ) : (
          <span className='italic text-muted-foreground'>No phone</span>
        );
      },
    },
    {
      accessorKey: 'lead_status',
      header: 'Status',
      cell: (info) => {
        const currValue = info.getValue() as string;

        const statusColors: any = {
          "Disqualified": 'bg-red-100 text-red-800 border-red-300',
          "Qualified": 'bg-green-100 text-green-800 border-green-300',
          "Follow up": 'bg-amber-100 text-amber-800 border-amber-300',
          "RnR": 'bg-blue-100 text-blue-800 border-blue-300'
        };

        const colorClass = statusColors[currValue] || 'bg-gray-100 text-gray-800 border-gray-300';

        return (
          <Badge className={`${colorClass}`}>
            {currValue || 'N/A'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Action',
      cell: (info) => {
        const currValue = info.getValue() as string;
        return (
          <Badge className={`capitalize`}>
            {currValue?.replace(/_/g, ' ') || 'N/A'}
          </Badge>
        );
      },
    },
    {
      accessorKey: '',
      header: 'Call Logs',
      cell: (info) => {
        return (
          <Link to='/campaigns/$campaignId/$campaign_lead' params={{
            campaignId,
            campaign_lead: info.row.original._id
          }}>
            <div className='flex items-center justify-center border-2 border-gray-500 max-w-fit p-1 rounded-full text-gray-500'>
              <VoicemailIcon />
            </div>
          </Link>
        )
      }
    }
  ];

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-row items-center justify-between px-2'>
        <div className='flex items-center gap-x-2'>
          <h3 className='py-4 text-lg font-semibold'>Campaign Leads</h3>
        </div>
        <div className='flex gap-x-2'>
          <div className='relative w-64'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search leads...'
              className='bg-white pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Popover for filtering by status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='flex items-center gap-2'>
                <Filter size={16} />{' '}
                {statusOptions.find((opt) => opt.value === statusFilter)?.label ||
                  'Filter by Status'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-48 space-y-1 p-2'>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`block w-full rounded-md px-2 py-1 text-left text-sm ${statusFilter === option.value ? 'bg-gray-100 font-medium' : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <VirtualizedDataTable
        columns={columns}
        data={filteredLeads}
        pagination={paginationState}
        columnVisibility={columnVisibility}
        rowCount={total_leads}
        onColumnVisibilityChange={setColumnVisibility}
        onPaginationChange={(pagination) => {
          const newPagination =
            typeof pagination === 'function' ? pagination(paginationState) : pagination
          setPaginationState(newPagination)
        }}
      />
    </div>
  )
}

export default CampaignLeads
