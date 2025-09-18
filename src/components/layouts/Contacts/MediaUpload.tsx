import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  X,
  LinkedinIcon,
  Download,
  CreditCard,
} from 'lucide-react'

import Papa from 'papaparse'
import Dropzone from 'shadcn-dropzone'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { z } from 'zod'
import { uploadContactList } from '@/services/contact'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClients } from '@/services'
import { getCredits } from '@/services/credits'

interface ParsedData {
  data: any[]
  rowCount: number
  hasLinkedinColumn: boolean
  linkedinCount: number // This will still represent the count of rows with LinkedIn data
}

const MediaUpload = () => {
  const queryClient = useQueryClient()
  const [fileInfo, setFileInfo] = useState<ParsedData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [accordionValue, setAccordionValue] = useState<string>('')
  const [extractionTypes, setExtractionTypes] = useState<string[]>([])
  const [phoneVerification, setPhoneVerification] = useState<boolean>(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false)

  const sampleData = [
    ['name', 'phone', 'email', 'linkedin'],
    ['John Smith', '+1-555-0123', 'john.smith@email.com', 'https://linkedin.com/in/johnsmith'],
    [
      'Sarah Johnson',
      '+1-555-0456',
      'sarah.johnson@email.com',
      'https://linkedin.com/in/sarahjohnson',
    ],
    [
      'Michael Brown',
      '+1-555-0789',
      'michael.brown@email.com',
      'https://linkedin.com/in/michaelbrown',
    ],
    ['Emily Davis', '+1-555-0321', 'emily.davis@email.com', 'https://linkedin.com/in/emilydavis'],
    [
      'David Wilson',
      '+1-555-0654',
      'david.wilson@email.com',
      'https://linkedin.com/in/davidwilson',
    ],
    ['Missing LinkedIn', '', '', '', 'PS006'],
    ['Empty Person ID', '', '', 'https://linkedin.com/in/empty', ''],
  ]

  const downloadSampleFile = () => {
    const csv = Papa.unparse(sampleData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'sample_contacts.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Sample file downloaded successfully!')
    }
  }

  const checkLinkedinData = (rawData: any[]): ParsedData => {
    if (rawData.length === 0) {
      return {
        data: rawData,
        rowCount: 0,
        hasLinkedinColumn: false,
        linkedinCount: 0,
      }
    }

    const headers = rawData[0].map((h: string) => h.trim().toLowerCase())
    const dataRows = rawData.slice(1)
    const rowCount = dataRows.length

    const hasLinkedinColumn = headers.includes('linkedin')

    let linkedinCount = 0
    if (hasLinkedinColumn) {
      const linkedinIndex = headers.indexOf('linkedin')
      linkedinCount = dataRows.filter((row: string[]) => {
        const linkedinValue = row[linkedinIndex]?.trim()
        return linkedinValue && linkedinValue.length > 0
      }).length
    }

    return {
      data: rawData,
      rowCount,
      hasLinkedinColumn,
      linkedinCount,
    }
  }

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      rowCount,
      extractionTypes,
      phoneVerification,
    }: {
      file: File
      rowCount: number
      extractionTypes: string[]
      phoneVerification: boolean
    }) => uploadContactList(file, rowCount, extractionTypes, phoneVerification),
    onSuccess: () => {
      toast.success('File uploaded successfully! Your request is being processed.')
      queryClient.invalidateQueries({ queryKey: ['contact-file-history'] })
      queryClient.refetchQueries({ queryKey: ['contact-file-history'] })
      clearFileSelection()
      setShowConfirmDialog(false)
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message || 'An unknown error occurred.'}`)
      setShowConfirmDialog(false)
    },
  })

  const {
    data: credits,
    isError,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['credits', 'sales'],
    queryFn: () => getCredits('sales'),
    refetchOnMount: true,
  })

  console.log('Current Credits:', credits)

  const clearFileSelection = () => {
    setFileInfo(null)
    setSelectedFile(null)
    setAccordionValue('')
    setPhoneVerification(false)
    setExtractionTypes([])
  }

  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      toast.error('Please select only one file at a time.')
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setAccordionValue('file-info')

      Papa.parse(file, {
        complete: (results) => {
          const validationResult = checkLinkedinData(results.data)
          console.log('File Analysis:', validationResult)
          setFileInfo(validationResult)

          if (!validationResult.hasLinkedinColumn) {
            toast.error('Missing required "linkedin" column. Please refer to file requirements.')
          } else if (validationResult.linkedinCount === 0) {
            toast.warning('No LinkedIn URLs found in the file.')
          } else {
            toast.success(
              `File parsed successfully. Found ${validationResult.linkedinCount} LinkedIn URLs.`
            )
          }
        },
        header: false,
        skipEmptyLines: true,
        error: (error) => {
          toast.error(`Failed to parse CSV: ${error.message}`)
          clearFileSelection()
        },
      })
    }
  }

  const handleFileRemove = () => {
    clearFileSelection()
    toast.success('File removed')
  }

  const handleUpload = () => {
    if (!fileInfo || !selectedFile) {
      toast.error('Cannot upload: No file selected or file information is missing.')
      return
    }

    if (!fileInfo.hasLinkedinColumn) {
      toast.error('Cannot upload: File is missing the required "linkedin" column.')
      return
    }
    if (fileInfo.rowCount === 0) {
      toast.error('Cannot upload: The file has no data rows.')
      return
    }
    if (fileInfo.linkedinCount === 0) {
      toast.error('Cannot upload: No LinkedIn URLs found in the file.')
      return
    }

    if (extractionTypes.length === 0) {
      toast.error('Please select at least one extraction type before uploading.')
      return
    }

    // Show confirmation dialog instead of directly uploading
    setShowConfirmDialog(true)
  }

  const handleConfirmUpload = () => {
    if (!fileInfo || !selectedFile) return

    uploadMutation.mutate({
      file: selectedFile,
      rowCount: fileInfo.linkedinCount,
      extractionTypes,
      phoneVerification,
    })

    console.log('Attempting upload with:', {
      fileName: selectedFile.name,
      linkedinCount: fileInfo.linkedinCount,
      extractionTypes,
      phoneVerification,
    })
  }


const isUploadDisabled = () => {
  if (extractionTypes.length === 0) {
    return true
  }
  
  if (uploadMutation.isPending) {
    return true
  }

    console.log('Checking upload disabled state with credits:', credits)
  
  if (credits?.data?.consumption_type === 'prepaid') {
    const creditsAllocated = credits.data.credits_allocated || 0
    const creditsUsed = credits.data.credits_consumed || 0
    const availableCredits = creditsAllocated - creditsUsed
    
    const requiredCredits = (fileInfo?.linkedinCount || 0) * extractionTypes.length
    
    return availableCredits < requiredCredits
  }
  
  return false
}

  return (
    <>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Upload CSV for contact extraction</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-6 lg:grid-cols-3'>
          <div className='flex flex-col gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={downloadSampleFile}
              className='w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/50'
            >
              <Download className='mr-2 h-4 w-4' />
              Download Sample File
            </Button>
            <div className='lg:col-span-1'>
              <div className='h-fit rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-950/50 dark:to-indigo-950/50'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900'>
                    <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-100'>
                    File Requirements
                  </h3>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h4 className='mb-2 text-sm font-medium text-blue-800 dark:text-blue-200'>
                      Required Fields
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300'>
                        <LinkedinIcon className='h-4 w-4' />
                        <div>
                          <span className='font-medium'>linkedin</span>
                          <p className='text-xs text-blue-600 dark:text-blue-400'>
                            Must be present as a column header and contain LinkedIn profile URLs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='mb-2 text-sm font-medium text-blue-800 dark:text-blue-200'>
                      Optional Fields (exact match required)
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300'>
                        <div className='h-4 w-4 rounded-sm border border-blue-400' />
                        <span>name, first_name, last_name</span>
                      </div>
                    </div>
                  </div>

                  <div className='border-t border-blue-200 pt-4 dark:border-blue-800'>
                    <div className='space-y-3'>
                      <div className='space-y-1'>
                        <p className='text-xs text-blue-600 dark:text-blue-400'>
                          Only CSV files are supported.
                        </p>
                        <p className='text-xs text-blue-600 dark:text-blue-400'>
                          Single file upload only.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-4 lg:col-span-2'>
            <div className='rounded-xl border bg-card p-4'>
              <h3 className='mb-3 text-sm font-medium'>Select Extraction Types</h3>
              <div className='space-y-2'>
                {[
                  { id: 'phone', label: 'Phone' },
                  { id: 'personal_email', label: 'Personal Email' },
                  { id: 'professional_email', label: 'Professional Email' },
                ].map((option) => (
                  <div key={option.id} className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id={option.id}
                      checked={extractionTypes.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExtractionTypes([...extractionTypes, option.id])
                        } else {
                          setExtractionTypes(extractionTypes.filter((type) => type !== option.id))
                          if (option.id === 'phone') {
                            setPhoneVerification(false)
                          }
                        }
                      }}
                      className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                    />
                    <label
                      htmlFor={option.id}
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>

              {extractionTypes.includes('phone') && (
                <div className='mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='phone_verification'
                      checked={phoneVerification}
                      onChange={(e) => setPhoneVerification(e.target.checked)}
                      className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                    />
                    <label
                      htmlFor='phone_verification'
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      Phone Verification
                    </label>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Enable phone number verification for extracted phone numbers.
                  </p>
                </div>
              )}

              {extractionTypes.length === 0 && (
                <p className='mt-2 text-xs text-muted-foreground'>
                  Please select at least one extraction type to enable upload.
                </p>
              )}
            </div>

            {!selectedFile && extractionTypes.length === 0 && (
              <div className='rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center'>
                <FileText className='mx-auto mb-2 h-8 w-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  Please select a client and extraction types first to enable file upload.
                </p>
              </div>
            )}

            {!selectedFile && extractionTypes.length > 0 && (
              <div className='rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-all duration-200 hover:border-primary hover:bg-primary/5 dark:border-gray-600 dark:bg-gray-900/50'>
                <Dropzone
                  accept={{ 'text/csv': ['.csv'] }}
                  maxFiles={1}
                  dropZoneClassName='p-8 rounded-xl'
                  onDrop={handleFileDrop}
                ></Dropzone>
              </div>
            )}

            {fileInfo && selectedFile && (
              <Accordion
                type='single'
                collapsible
                value={accordionValue}
                onValueChange={setAccordionValue}
                className='rounded-xl border bg-card shadow-sm'
              >
                <AccordionItem value='file-info' className='border-none'>
                  <AccordionTrigger className='rounded-t-xl px-4 py-3 hover:bg-gray-50 hover:no-underline dark:hover:bg-gray-900/50'>
                    <div className='flex flex-1 items-center gap-3'>
                      <div className='rounded-lg bg-primary/10 p-2'>
                        <FileText className='h-4 w-4 text-primary' />
                      </div>
                      <div className='flex-1 text-left'>
                        <p className='font-medium'>{selectedFile.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {fileInfo.rowCount.toLocaleString()} total •{' '}
                          <span
                            className={`${
                              fileInfo.linkedinCount > 0 ? 'text-green-600' : 'text-orange-500'
                            }`}
                          >
                            {fileInfo.linkedinCount.toLocaleString()} LinkedIn URLs
                          </span>{' '}
                          •{' '}
                          {fileInfo.hasLinkedinColumn
                            ? fileInfo.linkedinCount > 0
                              ? 'Ready'
                              : 'No LinkedIn URLs'
                            : 'Missing LinkedIn Column'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-4 pb-4 pt-0'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                          <FileText className='h-4 w-4 text-muted-foreground' />
                          <div className='min-w-0 flex-1'>
                            <p className='text-xs text-muted-foreground'>Total Rows</p>
                            <p className='text-sm font-medium'>
                              {fileInfo.rowCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                          <LinkedinIcon className='h-4 w-4 text-blue-600' />
                          <div className='min-w-0 flex-1'>
                            <p className='text-xs text-muted-foreground'>LinkedIn URLs</p>
                            <p
                              className={`text-sm font-medium ${fileInfo.linkedinCount > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {fileInfo.linkedinCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!fileInfo.hasLinkedinColumn && (
                        <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50'>
                          <div className='flex items-start gap-3'>
                            <AlertCircle className='mt-0.5 h-5 w-5 text-red-600' />
                            <div>
                              <h4 className='font-medium text-red-800 dark:text-red-200'>
                                Missing Required Column
                              </h4>
                              <p className='mt-1 text-sm text-red-700 dark:text-red-300'>
                                The required "linkedin" column is missing from your file.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {fileInfo.hasLinkedinColumn && fileInfo.linkedinCount === 0 && (
                        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/50'>
                          <div className='flex items-start gap-3'>
                            <AlertCircle className='mt-0.5 h-5 w-5 text-yellow-600' />
                            <div>
                              <h4 className='font-medium text-yellow-800 dark:text-yellow-200'>
                                No LinkedIn URLs Found
                              </h4>
                              <p className='mt-1 text-sm text-yellow-700 dark:text-yellow-300'>
                                While the "linkedin" column exists, no LinkedIn URLs were found in
                                the data.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {fileInfo.hasLinkedinColumn && fileInfo.linkedinCount > 0 && (
                        <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50'>
                          <div className='flex items-start gap-3'>
                            <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
                            <div>
                              <h4 className='font-medium text-green-800 dark:text-green-200'>
                                Ready to Upload
                              </h4>
                              <p className='mt-1 text-sm text-green-700 dark:text-green-300'>
                                Found {fileInfo.linkedinCount.toLocaleString()} LinkedIn URLs ready
                                for processing.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className='flex gap-3'>
                        <Button variant='outline' onClick={handleFileRemove} className='flex-1'>
                          <X className='mr-2 h-4 w-4' />
                          Remove File
                        </Button>
                        <Button
                          onClick={handleUpload}
                          className='flex-1'
                          disabled={
                            !selectedFile ||
                            !fileInfo ||
                            !fileInfo.hasLinkedinColumn ||
                            fileInfo.rowCount === 0 ||
                            fileInfo.linkedinCount === 0 ||
                            extractionTypes.length === 0 ||
                            uploadMutation.isPending
                          }
                        >
                          <Upload className='mr-2 h-4 w-4' />
                          Upload CSV
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-4'>
              <CreditCard className='h-5 w-5 text-primary' />
              Confirm Upload
            </DialogTitle>
            <DialogDescription className='text-left'>
              <div className='space-y-6'>
                <div className='my-3 rounded-lg border bg-amber-50 p-3 dark:bg-amber-950/50'>
                  <div className='flex items-start gap-2'>
                    <AlertCircle className='mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-500' />
                    <div className='text-sm'>
                      {credits?.data && (
                        <>
                          <p className='font-medium text-amber-800 dark:text-amber-200'>
                            {fileInfo?.linkedinCount
                              ? fileInfo.linkedinCount * extractionTypes.length
                              : 0}{' '}
                            credits will be blocked for extraction.
                          </p>
                          <div>
                            <p className='mt-1 text-amber-700 dark:text-amber-300'>
                              Unfound profiles will result in refunded credits.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className='text-sm text-muted-foreground'>
                  <div className='space-y-1'>
                    <p>
                      <strong>File:</strong> {selectedFile?.name}
                    </p>
                    <p>
                      <strong>LinkedIn URLs:</strong>{' '}
                      {fileInfo?.linkedinCount?.toLocaleString() || 0}
                    </p>
                    <p>
                      <strong>Extraction Types:</strong> {extractionTypes.join(', ')}
                    </p>
                    {phoneVerification && (
                      <p>
                        <strong>Phone Verification:</strong> Enabled
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex-row gap-3 sm:flex-row sm:justify-end sm:space-x-2'>
            <Button
              onClick={handleConfirmUpload}
              disabled={isUploadDisabled()}
              className='flex-1 sm:flex-none'
            >
              {uploadMutation.isPending ? (
                <>
                  <span className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></span>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Confirm Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MediaUpload
