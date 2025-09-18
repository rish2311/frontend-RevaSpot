import CampaignView from '@/components/layouts/marketing/Campaigns/CampaignView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/campaigns/$campaignId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CampaignView />
}
