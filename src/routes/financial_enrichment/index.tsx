import FinancialEnrichment from '@/components/layouts/Financial-Enrichment'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/financial_enrichment/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FinancialEnrichment/>
}
