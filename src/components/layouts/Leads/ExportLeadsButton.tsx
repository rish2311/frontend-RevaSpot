import { useState } from 'react'

import { GlobalHUDLoader } from '@/components/custom/HUDLoader'

import { Button } from '@/components/ui/button'
import { exportLeads, LeadsFilter } from '@/services/lead'
import { useQuery } from '@tanstack/react-query'
import { FileDownIcon } from 'lucide-react'

const ExportLeadsButton = ({ leadsFilter }: { leadsFilter: LeadsFilter }) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const { refetch } = useQuery({
    queryKey: ['exportLeads', leadsFilter],
    queryFn: () => exportLeads(leadsFilter),
    enabled: false, // Disable automatic query execution
  })

  const handleDownload = async () => {
    setIsDownloading(true)
    const { data } = await refetch()
    const link = data?.download_url
    setIsDownloading(false)
    if (!link) return

    const anchor = document.createElement('a')
    anchor.href = link
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  return (
    <>
      {isDownloading && <GlobalHUDLoader />}
      <Button
        variant={'link'}
        className='m-0 h-fit w-fit px-1 text-primary'
        onClick={handleDownload}
      >
        Export <FileDownIcon />
      </Button>
    </>
  )
}

export default ExportLeadsButton
