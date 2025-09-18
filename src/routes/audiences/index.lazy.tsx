import Audiences from '@/components/layouts/marketing/Audiences'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/audiences/')({
  component: Audiences,
})
