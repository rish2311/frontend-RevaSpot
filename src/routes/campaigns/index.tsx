import Campaigns from '@/components/layouts/marketing/Campaigns'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/campaigns/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Campaigns />
}
