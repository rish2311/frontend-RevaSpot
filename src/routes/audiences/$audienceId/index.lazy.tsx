import AudienceDetails from '@/components/layouts/marketing/Audiences/AudienceDetails'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/audiences/$audienceId/')({
  component: AudienceDetails,
})
