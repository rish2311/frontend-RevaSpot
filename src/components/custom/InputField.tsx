import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Control } from 'react-hook-form'

const InputField = ({
  formControl,
  formField,
}: {
  formControl: Control
  formField: CustomFormField
}) => {
  return (
    <FormField
      control={formControl}
      name={formField.id}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className={`font-medium text-secondary-foreground ${formField.required ? 'after:ml-1 after:text-red-500 after:content-["*"]' : ''}`}
          >
            Enter {formField.label}
          </FormLabel>
          <FormControl>
            <Input
              type={formField.type ?? 'text'}
              placeholder={formField.placeholder ?? 'Type Here'}
              {...field}
              className='border-none bg-background'
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default InputField
