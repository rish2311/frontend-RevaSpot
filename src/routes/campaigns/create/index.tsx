import CreateCampaignView from '@/components/layouts/marketing/Campaigns/CreateCampaign'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/campaigns/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateCampaignView />
}
