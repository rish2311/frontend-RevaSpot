import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronRight } from 'lucide-react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
const SelectInputField = <T extends FieldValues>({
  formControl,
  formField,
  selectValues,
}: {
  formControl: Control<T>
  formField: CustomFormField
  selectValues: string[] | null
}) => {
  return (
    <FormField
      disabled={selectValues === null}
      control={formControl}
      name={`mapping.${formField.id}` as FieldPath<T>}
      render={({ field }) => (
        <FormItem>
          <div className='flex w-full items-center justify-stretch space-x-6 font-semibold'>
            <FormLabel
              className={`flex w-2/5 font-medium ${formField.required ? 'after:ml-1 after:text-red-500 after:content-["*"]' : ''}`}
            >
              {formField.label}
            </FormLabel>
            <ChevronRight size={18} />
            <div className='flex w-3/5'>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={selectValues === null}
                // {...field}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className='rounded-2xl border-none bg-background text-secondary-foreground focus:ring-0'>
                    <SelectValue placeholder='Choose Column' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent ref={field.ref}>
                  {selectValues?.map((selectValue) => (
                    <SelectItem value={selectValue} key={selectValue}>
                      {selectValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default SelectInputField
