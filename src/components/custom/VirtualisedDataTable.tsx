import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface VirtualizedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination: PaginationState
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onPaginationChange?: OnChangeFn<PaginationState>
  rowCount?: number
  hasNext?: () => boolean
  hasPrev?: () => boolean
}

export function VirtualizedDataTable<TData, TValue>({
  columns,
  data,
  pagination,
  columnVisibility,
  rowCount,
  onPaginationChange,
  onColumnVisibilityChange,
  hasNext,
  hasPrev,
}: VirtualizedDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: { pagination, columnVisibility },
    onPaginationChange,
    onColumnVisibilityChange,
    rowCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!hasNext) {
    hasNext = table.getCanNextPage
  }
  if (!hasPrev) {
    hasPrev = table.getCanPreviousPage
  }

  return (
    <div>
      <Table className='rounded-lg bg-background'>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className='text-left'>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className='border-none'
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='py-4 text-left border-b'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className='border-none'>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className='flex items-center justify-center space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!hasPrev()}
        >
          <ChevronLeft />
        </Button>
        <p>{`${table.getState().pagination.pageIndex + 1} / ${table.getPageCount().toLocaleString()}`}</p>
        <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!hasNext()}>
          <ChevronRight/>
        </Button>
      </div>
    </div>
  )
}
