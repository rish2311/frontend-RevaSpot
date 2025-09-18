import { z } from 'zod'

declare global {
  type CustomFormField = {
    id: string // unique identifier for this field
    label: string // User-friendly label on input fields
    type?: React.HTMLInputTypeAttribute // field type email, number, etc
    required?: boolean // field marked with red asterisk
    validation: z.ZodTypeAny // validation logic for this field
    isMappable?: boolean // Field mapping required on bulk csv upload
    mapValidation?: z.ZodTypeAny // validation logic for this field
    placeholder?: string // placeholder for this field
    default: any // default value
  }
}

export {}
