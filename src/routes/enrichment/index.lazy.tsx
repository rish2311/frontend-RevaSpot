import Enrichment from '@/components/layouts/Enrichment'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/enrichment/')({
  component: Enrichment,
})
