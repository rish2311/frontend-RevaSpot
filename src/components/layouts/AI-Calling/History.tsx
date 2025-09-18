import { OutlineButton } from '@/components/custom/Buttons'
import { DataTable } from '@/components/custom/DataTable'
import ErrorComponent from '@/components/custom/ErrorComponent'
import { NoEnrichmentHistoryToShow } from '@/components/custom/NoData'
import { convertUTCToLocal } from '@/lib/utils'
import { getOrigaCampaignHistory } from '@/services'
import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

interface HistoryData {
  id: string
  client: string
  for_client: string
  type: string
  channel: string
  agent_identifier: string
  description?: string
  file_name: string
  input_file_path: string
  status?: string
  lead_count: number
  created_at: string
  updated_at?: string
  output_file_path?: string
  name?: string
  mapping?: Record<string, any>
}

const OpenButton = ({ id }: { id: string }) => {
  const navigate = useNavigate()

  const handleOpen = () => {
    navigate({ to: `${window.location.pathname}/${id}` })
  }

  return (
    <OutlineButton className='w-full' onClick={handleOpen}>
      <Eye className='mr-2 h-4 w-4' />
      Open
    </OutlineButton>
  )
}

let columns: ColumnDef<HistoryData>[] = [
  {
    accessorKey: 'name',
    header: 'File Name',
    size: 1,
    id: 'column1',
    cell: (info) => {
      const value = info.getValue() as string
      return <span>{value || info.row.original.file_name}</span>
    },
  },
  { accessorKey: 'agent_identifier', header: 'Agent', id: 'agent_identifier' },
  { accessorKey: 'for_client', header: 'Client', id: 'client' },
  { accessorKey: 'type', header: 'Type', id: 'type' },
  { accessorKey: 'channel', header: 'Channel' },
  { accessorKey: 'lead_count', header: 'No. of Leads' },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: (info) => {
      const value = info.getValue()
      if (!value) return ''
      return convertUTCToLocal(value as string)
    },
  },
  {
    header: 'Action',
    cell: ({ row }) => {
      return <OpenButton id={row.original.id} />
    },
  },
]

const restructureData = (data: any[]) =>
  data.map((item) => ({
    id: item.id,
    client: item.client,
    for_client: item.for_client,
    type: item.type,
    channel: item.channel,
    agent_identifier: item.agent_identifier,
    description: item.description,
    file_name: item.file_name,
    input_file_path: item.input_file_path,
    status: item.status,
    lead_count: item.lead_count,
    created_at: item.created_at,
    updated_at: item.updated_at,
    output_file_path: item.output_file_path,
    name: item.name,
    mapping: item.mapping,
  }))

const hideColumns = ['client', 'type']

const History = ({ historyType }: { historyType: string }) => {
  const authState = useAuth0()
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['history', historyType],
    queryFn: () => getOrigaCampaignHistory(),
    // refetchInterval: (query): number | false =>
    //   query.state.data?.data?.length === 0 ? false : 5000,
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
