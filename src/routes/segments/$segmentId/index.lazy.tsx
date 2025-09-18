import SegmentView from '@/components/layouts/Segments/SegmentView'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/segments/$segmentId/')({
  component: SegmentView,
})
