import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { pascalCase } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { useLocation } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { ModeToggle } from '../custom/mode-toggle'
import PlatformModeToggle from '../custom/PlatformModeToggle'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export default function Header() {
  const { logout: logoutFromStore, user } = useAuthStore()
  const posthog = usePostHog()
  const location = useLocation()
  const handleLogout = async () => {
    if (posthog && user)
      posthog.capture('user_logged_out', {
        email: user.email,
        client: user.org_name,
        path: location.pathname,
        time: new Date().toISOString(),
      })
    await logoutFromStore()
  }

  return (
    <header className='flex items-center justify-between rounded-2xl bg-background px-4 py-3'>
      <div className='flex flex-row items-center justify-center gap-x-8'>
        <img
          src='/full-logo-inverted.webp'
          alt='RevSpot Logo'
          className='hidden h-8 object-contain dark:block'
        />
        <img
          src='/full-logo.svg'
          alt='RevSpot Logo'
          className='block h-8 object-contain dark:hidden'
        />
        <PlatformModeToggle />
      </div>
      <div className='flex items-center space-x-4'>
        {/* TODO: Disabled for v0 */}
        {/* <PrimaryButton>Upgrade</PrimaryButton> */}
        {/* <div className='flex items-center space-x-2 rounded-full border border-secondary p-2 text-sm text-muted-foreground'>
          <span>Credits:</span>
          <Progress value={creditsLeft} className='w-24' />
          <span>{creditsLeft}</span>
        </div> */}
        {/* TODO: Disabled for v0 */}
        {/* <BellIcon className='text-secondary-foreground' size={18} /> */}
        <Popover>
          <PopoverTrigger className='h-8 w-8 overflow-clip rounded-full'>
            <Avatar>
              <AvatarImage src={user?.picture} />
              <AvatarFallback>{user?.nickname?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className='flex w-full flex-col items-start space-y-2 text-sm'>
            <p className='w-full text-left'>{pascalCase(user?.org_name)}</p>
            <p className='w-full text-left'>{user?.email}</p>
            <Separator className='w-full' />
            <Button
              variant='link'
              onClick={handleLogout}
              className='m-0 flex h-fit w-fit items-center justify-start gap-x-2 p-0 text-left text-foreground'
            >
              <LogOutIcon size={18} />
              <span className='text-md'>Log Out</span>
            </Button>
          </PopoverContent>
        </Popover>
        <ModeToggle />
      </div>
    </header>
  )
}
