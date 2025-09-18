import Dashboard from '@/components/layouts/Dashboard'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard/')({
  component: Dashboard,
})
