import Integrations from '@/components/layouts/Integrations'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/integrations/')({
  component: Integrations,
})
