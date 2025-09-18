import EnrichmentTabContent from './EnrichmentTabContent'
import VerifyEmailTabContent from './VerifyEmailTabContent'
import VerifyPhoneTabContent from './VerifyPhoneTabContent'

const tabItems = [
  { label: 'Enrichment', content: EnrichmentTabContent },
  { label: 'Verify Phone', content: VerifyPhoneTabContent },
  { label: 'Verify Email', content: VerifyEmailTabContent },
]

const Enrichment = () => {
  return (
    <EnrichmentTabContent />
    // TODO: Disabled for v0
    // <Tabs defaultValue={tabItems[0].label} className='w-full'>
    //   <TabsList className='h-fit bg-background p-0'>
    //     {tabItems.map((item) => (
    //       <TabsTrigger
    //         key={item.label}
    //         value={item.label}
    //         className='px-4 text-base tracking-tight underline-offset-2 hover:bg-accent data-[state=inactive]:font-normal data-[state=inactive]:text-foreground data-[state=active]:underline data-[state=active]:shadow-none'
    //       >
    //         {item.label}
    //       </TabsTrigger>
    //     ))}
    //   </TabsList>
    //   {tabItems.map((item) => (
    //     <TabsContent key={item.label} value={item.label}>
    //       <item.content />
    //     </TabsContent>
    //   ))}
    // </Tabs>
  )
}

export default Enrichment
