import Segments from '@/components/layouts/Segments'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/segments/')({
  component: Segments,
})
