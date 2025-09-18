import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ChartCard = ({
  cardName,
  children,
  totalLeads,
}: {
  cardName?: string
  children: React.ReactNode
  totalLeads?: number
}) => {
  return (
    <Card className='border border-secondary p-2 shadow-none'>
      <CardHeader className={`flex flex-row items-center justify-between p-4`}>
        <CardTitle>{cardName}</CardTitle>
        <div className='text-sm font-light'>
          Total Leads: <span className='text-lg font-medium'>{totalLeads}</span>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default ChartCard
