import { ApiFetchState, Audience } from '@/types'
import { useAudience } from '@/store/discover/audience'
import { useEffect, useMemo, useState } from 'react'
import { convertUTCToLocal, formatNumber } from '@/lib/utils'
import { ChevronRightIcon, PlusIcon } from 'lucide-react'
import { OutlineButton } from '@/components/custom/Buttons'
import { useNavigate } from '@tanstack/react-router'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import { DataTable } from '@/components/custom/DataTable'
import { VirtualizedDataTable } from '@/components/custom/VirtualisedDataTable'
import HUDLoader from '@/components/custom/HUDLoader'

const Audiences = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  // TODO: Pre-Load in case of edit segment/audience
  const ua = useAudience()

  // ua.fetch(0, 20)
  useEffect(() => {
    ua.fetch(0, 10)
  }, [])

  // const audiences = useMemo(
  //   async () => {
  //     await ua.fetch(0, 20)
  //     if (ua.loading == ApiFetchState.Success) {
  //       return ua.audiences
  //     } else {
  //       return []
  //     }
  //   }, []);

  // const paginationState: PaginationState = {
  //   pageIndex: 0,
  //   pageSize: 10,
  // }

  const navigate = useNavigate()

  const handleOpen = (id: string) => {
    navigate({
      to: `/audiences/${id}`,
      // state: { data: data?.data.find((segment: any) => segment._id === segmentId) || {} },
    })
  }

  const columns: ColumnDef<Audience, any>[] = [
    { accessorKey: 'id', header: '# ID' },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'target_size',
      header: 'Target Size',
      cell: ({ getValue }) => {
        return formatNumber(getValue())
      },
    },
    {
      accessorKey: 'export_offset',
      header: 'Total Exported',
      cell: ({ getValue }) => {
        return formatNumber(getValue())
      },
    },
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
      cell: ({ getValue }) => (
        <OutlineButton className='w-full' onClick={() => handleOpen(getValue())}>
          Open
        </OutlineButton>
      ),
    },
  ]

  return (
    <div className='flex flex-col space-y-6'>
      <div className='flex justify-between px-2'>
        <h3 className='text-lg font-semibold'>Audience List</h3>
        <OutlineButton
          onClick={() => {
            navigate({ to: `/discover` })
          }}
        >
          <PlusIcon /> Create Audience
        </OutlineButton>
      </div>
      {ua.loading == ApiFetchState.Loading && <HUDLoader />}
      {ua.loading == ApiFetchState.Success && (
        // <DataTable columns={columns} data={ua.audiences} />
        <VirtualizedDataTable
          columns={columns}
          data={ua.audiences}
          pagination={{ pageSize: pageSize, pageIndex: page }}
          onPaginationChange={(updater) => {
            const newPage =
              typeof updater === 'function'
                ? updater({ pageSize: pageSize, pageIndex: page }).pageIndex
                : updater.pageIndex
            setPage(newPage)
            ua.fetch(newPage, pageSize)
          }}
          hasNext={() => ua.hasMore}
          hasPrev={() => page > 0}
        />
      )}
    </div>
  )
}

export default Audiences
