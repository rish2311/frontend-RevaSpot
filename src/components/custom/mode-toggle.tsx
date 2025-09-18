import { useTheme } from '@/components/custom/theme-provider'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const handleCheckedChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className='flex items-center'>
      <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
      <Switch
        id='colorMode'
        checked={theme === 'dark'}
        onCheckedChange={handleCheckedChange}
        className='mx-2'
      />
      <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-primary' : 'text-gray-400'}`} />
    </div>
  )
}
