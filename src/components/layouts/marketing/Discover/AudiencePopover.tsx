import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveAudience } from '@/services/discover'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

export const SaveAudiencePopover = ({ filterQuery, targetSize }: any) => {
  const [audienceName, setAudienceName] = useState('')
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate({from: '/audiences/$audienceId'})
  const saveAudienceMutation = useMutation({
    mutationFn: saveAudience,
    onSuccess: (data: any) => {
      setOpen(false)
      toast.success('Audience was successfully created')
    },
  })

  const handleSave = () => {
    if (!audienceName || !filterQuery) return

    const audienceData = {
      name: audienceName,
      query: JSON.stringify({
        version: 'v1',
        filters: Object.entries(filterQuery).map(([key, filter]: any) => ({
          name: key,
          label: filter.label,
          operator: filter.operator,
          empty_value: filter.empty_value,
          values: filter.values.map((value: string) => ({ name: value, label: value })),
        })),
      }),
      target_size: targetSize,
      aud_type: 'MARKET',
      query_type: 'JSON',
    }

    saveAudienceMutation.mutate(audienceData)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline'>Save Audience</Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-4'>
        <Input
          placeholder='Enter audience name'
          value={audienceName}
          onChange={(e) => setAudienceName(e.target.value)}
        />
        <Button onClick={handleSave} className='mt-2 w-full'>
          Save
        </Button>
      </PopoverContent>
    </Popover>
  )
}
