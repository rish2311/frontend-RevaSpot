import { Button } from '@/components/ui/button'
import { FileDownIcon, FileIcon, UploadCloud } from 'lucide-react'
import Papa from 'papaparse'
import { Dispatch, SetStateAction } from 'react'
import Dropzone from 'shadcn-dropzone'
import { toast } from 'sonner'

const MediaUpload = ({
  records,
  setRecords,
  uploadedFile,
  setFile,
  setCsvColumns,
}: {
  records: number | null
  setRecords: Dispatch<SetStateAction<number | null>>
  uploadedFile: File | null
  setFile: Dispatch<SetStateAction<File | null>>
  setCsvColumns: Dispatch<SetStateAction<string[] | null>>
}) => {
  const handleFileProcessing = (file: File) => {
    try {
      setFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        Papa.parse(text, {
          skipEmptyLines: true,
          complete: (results: any) => {
            const firstLine = results.data[0]
            if (firstLine.some((column: string) => !column)) {
              toast.error('Failed to upload the file. Some columns are missing or empty.')
              return
            }
            setRecords(results.data.length - 1)
            setCsvColumns(firstLine)
          },
        })
      }
      reader.readAsText(file)
    } catch (error) {
      toast.error('Failed to upload the file.')
    }
  }

  return (
    <div>
      <h3 className='my-2 text-lg font-semibold'>Media Upload</h3>
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
        // containerClassName='my-2 flex cursor-pointer flex-col justify-center rounded-md border-2 border-dashed border-secondary-foreground bg-background p-6 text-center'
        onDrop={(acceptedFiles: File[]) => {
          if (acceptedFiles.length > 0) {
            handleFileProcessing(acceptedFiles[0])
          }
        }}
        accept={{ 'text/csv': ['.csv'] }}
        maxFiles={1}
      >
        {(dropzone) => (
          <div className='my- flex h-full w-full cursor-pointer flex-col justify-center rounded-md bg-background p-6 text-center'>
            {uploadedFile ? (
              <>
                <div className='flex items-center justify-center space-x-1 text-sm text-primary'>
                  <FileIcon size={18} />
                  <p>{uploadedFile.name}</p>
                </div>
                {records && (
                  <p className='text-xs text-secondary-foreground'>Total Records: {records}</p>
                )}
              </>
            ) : (
              <>
                <UploadCloud className='mx-auto text-primary' size={24} />
              </>
            )}
            <p className='my-4 text-sm'>
              {dropzone.isDragAccept
                ? 'Drop your files here!'
                : 'Drag and drop your files or browse'}
            </p>
            <p className='mt-1 text-sm font-normal text-secondary-foreground'>
              Max 10MB files are allowed
            </p>
          </div>
        )}
      </Dropzone>
      <p className='text-sm font-normal text-secondary-foreground'>Only supports .csv files</p>
    </div>
  )
}

export default MediaUpload
