import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, LinkedinIcon } from 'lucide-react'
import { toast } from 'sonner'

export interface ProfileData {
  photoUrl?: string
  persona?: string
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  location?: string
  age?: string
  jobTitle?: string
  companyName?: string
  professionalLevel?: string
  companyTier?: string
  salary?: string
  netWorth?: string
  linkedin?: string
  estimated_yearly_earnings?: string
  estimated_lifetime_earnings?: string
}

const ProfileCard = ({ profileData }: { profileData: ProfileData }) => {
  const ProfileValueField = ({ data }: { data?: string | number }) => {
    return <p>{data}</p>
  }

  // Helper function to get display name
  const getDisplayName = () => {
    if (profileData.name) {
      return profileData.name
    }
    if (profileData.first_name || profileData.last_name) {
      return `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
    }
    return 'Unknown User'
  }

  // Helper function to get avatar fallback
  const getAvatarFallback = () => {
    if (profileData.name) {
      return profileData.name.charAt(0).toUpperCase()
    }
    if (profileData.first_name) {
      return profileData.first_name.charAt(0).toUpperCase()
    }
    if (profileData.last_name) {
      return profileData.last_name.charAt(0).toUpperCase()
    }
    return 'U'
  }

  console.log('profile card info:', profileData)
  return (
    <div className='flex flex-col gap-8 rounded-lg bg-background p-8 text-sm shadow-md'>
      <div className='flex flex-col items-center'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={profileData.photoUrl} />
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
        <h2 className='my-2'>{getDisplayName()}</h2>
        <p className='mb-4 text-center text-gray-600'>{profileData.persona}</p>
      </div>
      <div className='grid grid-cols-2 gap-4 text-sm'>
        {profileData.email && (
          <>
            <div className='border-b border-b-secondary-foreground pb-2'>
              <p className='font-medium text-secondary-foreground'>Email</p>
              <div className='flex items-center justify-between'>
                <ProfileValueField data={profileData.email ?? 'N/A'} />
                <Copy
                  size={16}
                  className='ml-2 cursor-pointer text-primary'
                  onClick={() => {
                    navigator.clipboard.writeText(profileData.email || '')
                    toast.success('Copied to clipboard!', { dismissible: true, duration: 2000 })
                  }}
                />
              </div>
            </div>
          </>
        )}
        {profileData.phone && (
          <>
            <div className='border-b border-b-secondary-foreground pb-2'>
              <p className='font-medium text-secondary-foreground'>Phone</p>
              <div className='flex items-center justify-between'>
                <ProfileValueField data={profileData.phone ?? 'N/A'} />
                <Copy
                  size={16}
                  className='ml-2 cursor-pointer text-primary'
                  onClick={() => {
                    navigator.clipboard.writeText(profileData.phone || '')
                    toast.success('Copied to clipboard!', { dismissible: true, duration: 2000 })
                  }}
                />
              </div>
            </div>
          </>
        )}
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Location</p>
          <ProfileValueField data={profileData.location ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Age</p>
          <ProfileValueField data={profileData.age ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Job Title</p>
          <ProfileValueField data={profileData.jobTitle ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Company Name</p>
          <ProfileValueField data={profileData.companyName ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Professional Level</p>
          <ProfileValueField data={profileData.professionalLevel ?? 'N/A'} />
        </div>
        <div className='border-b border-b-secondary-foreground pb-2'>
          <p className='font-medium text-secondary-foreground'>Company Tier</p>
          <ProfileValueField data={profileData.companyTier ?? 'N/A'} />
        </div>
        {profileData.salary && (
          <div className='border-b border-b-secondary-foreground pb-2'>
            <p className='font-medium text-secondary-foreground'>Salary</p>
            <ProfileValueField data={profileData.salary ?? 'N/A'} />
          </div>
        )}
        {profileData.estimated_yearly_earnings && (
          <div className='border-b border-b-secondary-foreground pb-2'>
            <p className='font-medium text-secondary-foreground'>Estimated Yearly Earnings</p>
            <ProfileValueField data={profileData.estimated_yearly_earnings ?? 'N/A'} />
          </div>
        )}
        {profileData.netWorth && (
          <div className='border-b border-b-secondary-foreground pb-2'>
            <p className='font-medium text-secondary-foreground'>Net Worth</p>
            <ProfileValueField data={profileData.netWorth ?? 'N/A'} />
          </div>
        )}
        {profileData.estimated_lifetime_earnings && (
          <div className='border-b border-b-secondary-foreground pb-2'>
            <p className='font-medium text-secondary-foreground'>Estimated Lifetime Earnings</p>
            <ProfileValueField data={profileData.estimated_lifetime_earnings ?? 'N/A'} />
          </div>
        )}
      </div>
      <div className='my-4 flex justify-center'>
        <button className='flex items-center gap-x-2 rounded-full bg-blue-600 px-4 py-2 text-white'>
          <LinkedinIcon size={16} />
          <a href={profileData.linkedin} target='_blank' rel='noopener noreferrer'>
            View profile on LinkedIn
          </a>
        </button>
      </div>
    </div>
  )
}

export default ProfileCard

