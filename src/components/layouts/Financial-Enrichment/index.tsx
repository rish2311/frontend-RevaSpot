import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'
import MediaUpload from './MediaUpload'
import FileHistory from './FileHistory'

const FinancialEnrichment = () => {
  const { user, isLoading } = useAuth0()

  if (isLoading) return <p>Loading...</p>

  const org = user?.org_name.toLowerCase()

  return (
    <section className='flex flex-col gap-8'>
      <h1 className='text-lg font-bold'>Financial Enrichment</h1>
      <Card className='border-none'>
        <CardHeader>
          {/*@ts-ignore*/}
          {org === 'revspot' && (
            <>
              <CardTitle>Download Enriched Data</CardTitle>
            </>
          )}
          {org === 'finance_buddha' && (
            <>
              <CardTitle>Download Raw Data</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent>
          {/*@ts-ignore*/}
          {org === 'revspot' && <MediaUpload />}
          <FileHistory org={org} />
        </CardContent>
      </Card>
    </section>
  )
}

export default FinancialEnrichment
