import Contact from '@/components/layouts/Contacts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contact/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Contact />
}
