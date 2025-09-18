import Leads from '@/components/layouts/Leads'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/leads/')({
  component: Leads,
})
