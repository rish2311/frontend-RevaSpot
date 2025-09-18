import { OutlineButton, PrimaryButton } from '@/components/custom/Buttons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox } from '../ui/checkbox'

const ShowHideColumnsButton = ({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: {
  columns: { id: string; label: string }[]
  columnVisibility: Record<string, boolean>
  onColumnVisibilityChange: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const form = useForm({
    defaultValues: columnVisibility,
  })

  const toggleAllColumns = () => {
    const allVisible = Object.values(form.getValues()).every((value) => value)
    const newVisibility = Object.fromEntries(
      Object.keys(form.getValues()).map((key) => [key, !allVisible])
    )
    form.reset(newVisibility)
  }

  const onSubmit = (data: Record<string, boolean>) => {
    onColumnVisibilityChange(data)
    setIsPopoverOpen(false)
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger
        className='flex items-center space-x-2 rounded-full border border-foreground px-4 py-2 text-sm'
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      >
        <span>Show/Hide Columns</span>
      </PopoverTrigger>
      <PopoverContent side='bottom' align='end' className='rounded-sm border border-secondary p-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col flex-wrap space-y-4 text-sm'
          >
            <div className='flex max-h-[60vh] flex-col space-y-4 overflow-y-auto'>
              {columns.map((column) => (
                <FormField
                  key={column.id}
                  control={form.control}
                  name={column.id}
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start gap-x-2 space-y-0'>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>{column.label}</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className='flex flex-row justify-end space-x-2'>
              <OutlineButton type='button' onClick={toggleAllColumns}>
                Toggle All
              </OutlineButton>
              <PrimaryButton type='submit'>Apply</PrimaryButton>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}

export default ShowHideColumnsButton
