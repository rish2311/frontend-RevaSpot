import AICalling from '@/components/layouts/AI-Calling'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/ai_calling/')({
  component: AICalling,
})
