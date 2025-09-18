import { getCredits } from '@/services/credits'
import useAuthStore from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  BlocksIcon,
  CircleDollarSignIcon,
  CoinsIcon,
  ContactIcon,
  FlagIcon,
  HomeIcon,
  LayoutIcon,
  PhoneIcon,
  Users2Icon,
  UsersIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Progress } from '../ui/progress'

const sidebarItemsDefault = [
  { label: 'Dashboard', icon: HomeIcon, to: '/', kind: 'sales' },
  { label: 'Enrichment', icon: CircleDollarSignIcon, to: '/enrichment', kind: 'sales' },
  { label: 'Contact', icon: ContactIcon, to: '/contact', kind: 'sales' },
  { label: 'Segments', icon: LayoutIcon, to: '/segments', kind: 'sales' },
  { label: 'Discover', icon: UsersIcon, to: '/discover', kind: 'marketing' },
  // { label: 'Audiences', icon: UsersIcon, to: '/audiences', kind: 'marketing' },
  { label: 'Campaigns', icon: FlagIcon, to: '/campaigns', kind: 'marketing' },
  { label: 'Leads', icon: Users2Icon, to: '/leads', kind: 'sales' },
  { label: 'Integrations', icon: BlocksIcon, to: '/integrations', kind: 'sales' },
]

export default function SideNavbar() {
  const { marketingMode, user } = useAuthStore()
  const [sidebarItems, setSidebarItems] = useState(sidebarItemsDefault)
  const accountType = marketingMode ? 'marketing' : 'sales'

  const {
    data: credits,
    isError,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['credits', accountType],
    queryFn: () => getCredits(accountType),
    refetchOnMount: true,
  })

  useEffect(() => {
    refetch()
  }, [accountType, refetch])

  useEffect(() => {
    let updatedItems = [...sidebarItemsDefault].filter(
      (item) =>
        !(
          user?.org_name?.toLowerCase() === 'brigade' &&
          ['Discover', 'Audiences'].includes(item.label)
        )
    )

    if (
      accountType === 'sales' &&
      user?.org_name &&
      ['revspot', 'finance_buddha'].includes(user.org_name.toLowerCase())
    ) {
      updatedItems.push({
        label: 'Financial Enrichment',
        icon: CoinsIcon,
        to: '/financial_enrichment',
        kind: 'sales',
      })
    }

    if (user?.org_name && user.org_name.toLowerCase() === 'revspot') {
      updatedItems.push({
        label: 'AI Calling',
        icon: PhoneIcon,
        to: '/ai_calling',
        kind: 'marketing',
      })
    }

    if (user?.org_name && user.org_name.toLowerCase() === 'masai_school') {
      updatedItems = updatedItems.filter(
        (item) => !['Enrichment'].includes(item.label)
      )
      }

    setSidebarItems(updatedItems)
  }, [accountType, user?.org_name])

  return (
    <div className='flex w-60 min-w-60 max-w-60 flex-col justify-between rounded-2xl bg-background p-6'>
      <div className='flex flex-col items-start space-y-4'>
        {sidebarItems
          .filter((item) => item.kind === accountType)
          .map((item) => (
            <Link
              to={item.to}
              key={item.label}
              className='flex w-full items-center gap-x-2 rounded-md px-2 py-1 hover:bg-accent [&.active]:bg-primary [&.active]:text-background'
            >
              <item.icon className='h-4 w-4 flex-shrink-0' />
              <span className='break-words'>{item.label}</span>
            </Link>
          ))}
      </div>

      {credits && !isError && !isPending && (
        <div className='flex w-full flex-col gap-4'>
          {credits.data.name && (
            <div className='border-b pb-1 text-sm font-semibold text-gray-800'>
              <span className='truncate'>{credits.data.name}</span>
            </div>
          )}

          <div className='text-sm'>
            {credits?.data?.consumption_type === 'postpaid' ? (
              <>
                <span>Consumed Credits: {credits?.data?.credits_consumed}</span>
              </>
            ) : (
              <>
                {credits?.data?.credits_consumed === credits?.data?.credits_allocated && (
                  <div className='text-red-400'>*credits exhausted</div>
                )}
                <span>
                  Consumed Credits: {credits?.data?.credits_consumed}/
                  {credits?.data?.credits_allocated}
                </span>
                <Progress
                  value={
                    (credits?.data?.credits_consumed / (credits?.data?.credits_allocated || 1)) *
                    100
                  }
                  className='w-full'
                />
              </>
            )}
          </div>

          <div className='text-sm'>
            {credits?.data?.credits_consumed_today === credits?.data?.daily_limit && (
              <span className='text-red-400'>*daily limit reached</span>
            )}
            <span>
              Daily Limit: {credits?.data?.credits_consumed_today}/{credits?.data?.daily_limit}
            </span>
            <Progress
              value={
                (credits?.data?.credits_consumed_today / (credits?.data?.daily_limit || 1)) * 100
              }
              className='w-full'
            />
          </div>
        </div>
      )}
    </div>
  )
}
