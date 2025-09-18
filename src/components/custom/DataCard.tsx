import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DataCard = ({
  cardName,
  children,
  extraComponent,
}: {
  cardName?: string
  children: React.ReactNode
  extraComponent?: React.ReactNode
}) => {
  return (
    <Card className='rounded-xl border-none p-2 shadow-none'>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 p-2`}>
        <CardTitle className=''>{cardName}</CardTitle>
        <div>{extraComponent}</div>
      </CardHeader>
      <CardContent className='p-2'>{children}</CardContent>
    </Card>
  )
}

export default DataCard
