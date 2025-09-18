import { TabsList, TabsTrigger } from '@/components/ui/tabs'

const DisabledTabs = () => {
  const tabStyles =
    'rounded-full px-4 data-[state=inactive]:text-secondary-foreground data-[state=inactive]:font-normal data-[state=active]:bg-accent'
  return (
    <TabsList className='h-fit gap-x-4 rounded-full bg-secondary px-2 py-1'>
      <TabsTrigger value={'1'} className={tabStyles} disabled>
        Profile Card
      </TabsTrigger>
      <TabsTrigger value={'2'} className={tabStyles} disabled>
        JSON
      </TabsTrigger>
    </TabsList>
  )
}

export default DisabledTabs
