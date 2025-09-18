import Discover from '@/components/layouts/marketing/Discover'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/discover/')({
  component: Discover,
})
