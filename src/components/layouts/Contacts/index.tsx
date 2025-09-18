import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LinkedinToPhoneTabContent from './SingleContactExtraction/LinkedinToPhoneTabContent'
import LinkedinToEmailTabContent from './SingleContactExtraction/LinkedinToEmailTabContent'
import ContactFileHistoryList from './ContactFileHistory'
import MediaUpload from './MediaUpload'
import LinkedinToContactTabContent from './SingleContactExtraction/LinkedinToPhoneTabContent'

const Contact = () => {
  return (
    <div className='flex flex-col gap-3'>
      <Tabs defaultValue='single' className='w-full'>
        <TabsList defaultValue='linkedinToPhone' className='bg-background px-2 py-1'>
          <TabsTrigger
            value='single'
            className='px-4 data-[state=active]:bg-accent data-[state=inactive]:font-normal data-[state=inactive]:text-foreground'
          >
            Single
          </TabsTrigger>
          <TabsTrigger
            className='px-4 data-[state=active]:bg-accent data-[state=inactive]:font-normal data-[state=inactive]:text-foreground'
            value='bulk'
          >
            Bulk
          </TabsTrigger>
        </TabsList>

        <TabsContent value='single' className='p-4'>
          <LinkedinToContactTabContent />
        </TabsContent>
        <TabsContent value='bulk' className='p-4 flex flex-col gap-4'>
          <MediaUpload />
          <ContactFileHistoryList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Contact
