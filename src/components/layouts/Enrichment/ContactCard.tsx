import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, LinkedinIcon, VerifiedIcon } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export interface ContactData {
  name?: string
  phone?: string
  location?: string
  title?: string
  company?: string
  linkedin?: string
  email?: string
  email_status?: string
  phone_verified?: boolean
  phone_status?: string
  status?: string
}

const ContactCard = ({
  contactData,
  contact_type,
}: {
  contactData: ContactData
  contact_type: string
}) => {
  const ContactValueField = ({ data }: { data?: string | number }) => {
    return <p>{data}</p>
  }

  console.log('contact card info:', contactData)

  return (
    <div className='flex flex-col gap-6 rounded-lg bg-background p-6 text-sm shadow-md'>
      <div className='flex items-center justify-center gap-2'>
        <h2 className='text-lg'>
          {['professional_email', 'personal_email'].includes(contact_type) ? contactData.email : contactData.phone}
        </h2>
        <Copy
          size={16}
          className='ml-2 cursor-pointer text-primary'
          onClick={() => {
            navigator.clipboard.writeText(
              (['professional_email', 'personal_email'].includes(contact_type) ? contactData.email : contactData.phone) ?? ''
            )
            toast.success('Copied to clipboard!', { dismissible: true, duration: 2000 })
          }}
        />
        {(contactData.phone_verified  || contactData.email_status === 'valid') && (
          <VerifiedIcon className='text-green-500' />
        )}
      </div>
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Name</p>
          <ContactValueField data={contactData.name ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Location</p>
          <ContactValueField data={contactData.location ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Job Title</p>
          <ContactValueField data={contactData.title ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Company Name</p>
          <ContactValueField data={contactData.company ?? 'N/A'} />
        </div>
      </div>
      <div className='flex justify-center'>
        <button className='flex items-center gap-x-2 rounded-full bg-blue-600 px-4 py-2 text-white'>
          <LinkedinIcon size={16} />
          <a href={contactData.linkedin} target='_blank' rel='noopener noreferrer'>
            View contact on LinkedIn
          </a>
        </button>
      </div>
    </div>
  )
}

export default ContactCard
