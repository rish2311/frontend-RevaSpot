interface IMetricCard {
  iconPath: string
  iconBgColor: string
  label: string
  value?: number | string
}

const MetricCard = ({ iconPath, iconBgColor, label, value }: IMetricCard) => {
  return (
    <div className='flex w-full items-center space-x-4 rounded-2xl border border-secondary p-4'>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor}`}>
        <img src={iconPath} alt={`${label} Icon`} className='h-8 w-8' />
      </div>
      <div className='flex flex-col'>
        <span className='text-sm text-secondary-foreground'>{label}</span>
        <span className='text-xl font-bold text-foreground'>
          {value ? value.toLocaleString() : '----'}
        </span>
      </div>
    </div>
  )
}

export default MetricCard
