import CampaignCallLogs from '@/components/layouts/marketing/Campaigns/CampaignCallLogs'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/campaigns/$campaignId/$campaign_lead/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CampaignCallLogs />
}
