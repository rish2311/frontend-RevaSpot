import AddEditSegment from '@/components/layouts/Segments/AddEditSegment'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/segments/update')({
  component: AddEditSegment,
})
