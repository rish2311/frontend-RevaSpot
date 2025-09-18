import { ClearButton, OutlineButton, PrimaryButton } from '@/components/custom/Buttons'
import { DataTable } from '@/components/custom/DataTable'
import ErrorComponent from '@/components/custom/ErrorComponent'
import HUDLoader, { Spinner } from '@/components/custom/HUDLoader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { convertUTCToLocal } from '@/lib/utils'
import { deleteSegment, getSegments } from '@/services/segment'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, PlusIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'

const Segments = () => {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (segmentId: string) => deleteSegment(segmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Segment Name' },
    { accessorKey: 'segment_leads', header: 'No. of Leads' },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: (info) => {
        const value = info.getValue()
        if (!value) return ''
        return convertUTCToLocal(value as string)
      },
    },
    {
      accessorKey: 'coverage',
      header: 'Coverage Rate',
      cell: ({ row }) => `${row.original.coverage}%`,
    },
    {
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <OutlineButton className='w-full' onClick={() => handleOpen(row.original._id)}>
            <Eye />
          </OutlineButton>
          <OutlineButton
            className='w-full text-destructive'
            onClick={() => {
              setSelectedSegmentId(row.original._id)
              setDialogOpen(true)
            }}
          >
            <Trash2 />
          </OutlineButton>
        </div>
      ),
    },
  ]

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['segments'],
    queryFn: getSegments,
  })

  console.log(data, isError)

  const navigate = useNavigate()

  const handleOpen = (segmentId: string) => {
    navigate({
      to: `/segments/${segmentId}`,
      state: { data: data?.data?.find((segment: any) => segment._id === segmentId) || {} },
    })
  }

  const handleDeleteConfirm = () => {
    if (selectedSegmentId) {
      mutation.mutate(selectedSegmentId)
      setDialogOpen(false)
    }
  }

  // if (isPending || mutation.isPending) return <HUDLoader />
  if (isError) return <ErrorComponent error={error} />
  if (mutation.isError) return <ErrorComponent error={mutation.error} />

  return (
    <div className='flex flex-col space-y-6'>
      <div className='flex justify-between px-2'>
        <h3 className='text-lg font-semibold'>Segment List</h3>
        <OutlineButton
          onClick={() => {
            navigate({ to: `/segments/update` })
          }}
        >
          <PlusIcon /> Add
        </OutlineButton>
      </div>
      {isPending || mutation.isPending ? (
        <div className='p-4 flex items-center justify-center bg-white'>
          <Spinner />
        </div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} />
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirmation Dialog</DialogTitle>
          <DialogDescription>Are you sure you want to delete this segment?</DialogDescription>
          <DialogFooter>
            <ClearButton onClick={() => setDialogOpen(false)}>No</ClearButton>
            <PrimaryButton onClick={handleDeleteConfirm}>Yes</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Segments
