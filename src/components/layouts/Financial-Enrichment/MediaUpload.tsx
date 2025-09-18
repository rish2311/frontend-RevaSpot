import { Button } from '@/components/ui/button'
import { FileDownIcon } from 'lucide-react'
import Papa from 'papaparse'
import Dropzone from 'shadcn-dropzone'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadRawFileForFb } from '@/services'

const MediaUpload = () => {
  const queryClient = useQueryClient()
  const uploadMutation = useMutation({
    mutationFn: uploadRawFileForFb,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['fb-files-history']})
      toast.success('File uploaded successfully!')
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`)
    },
  })

  return (
    <div>
      <div className='flex items-center justify-between text-sm'>
        <p>Upload your document here.</p>
        <Button
          variant={'link'}
          className='text-primary'
          onClick={() => {
            const sampleData = [['name', 'email', 'phone', 'linkedin']]
            const csv = Papa.unparse(sampleData)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', 'sample.csv')
            link.click()
          }}
        >
          Download Sample File <FileDownIcon />
        </Button>
      </div>
      
      <Dropzone
        accept={{ 'text/csv': ['.csv'] }}
        maxFiles={1}
        dropZoneClassName='min-h-[20vh]'
        onDrop={(acceptedFiles: any) => {
          if (acceptedFiles.length > 0) {
            uploadMutation.mutate(acceptedFiles[0])
          }
        }}
      />

      <p className='text-sm font-normal text-secondary-foreground'>Only supports .csv files</p>
    </div>
  )
}

export default MediaUpload
