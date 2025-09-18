import CampaignDetails from '@/components/layouts/AI-Calling/CampaignDetails'
import { createLazyFileRoute } from '@tanstack/react-router'
export const Route = createLazyFileRoute('/ai_calling/$campaignId/')({
  component: CampaignDetails,
})
