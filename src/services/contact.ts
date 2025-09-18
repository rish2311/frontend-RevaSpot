import API from './config'

export const uploadContactList = async (
  file: File,
  lead_count: number,
  extraction_types: string[],
  phoneVerification: boolean,
) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lead_count', lead_count.toString())
    formData.append('extraction_types', JSON.stringify(extraction_types))
    formData.append('phone_verification', phoneVerification.toString())

    const response = await API.post(`/profile/contact/bulk/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10 * 1000,
    })

    return response.data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const getContactFileHistory = async () => {
  try {
    const response = await API.get(`/profile/contact/bulk/history`)
    return response.data
  } catch (error) {
    console.error('Error getting contact extration files:', error)
    throw error
  }
}

export const triggerContactExtractionExport = async(contactExtractionId: string, export_type: string) => {
  try {
    const response = await API.post(`/profile/contact/bulk/${contactExtractionId}/export`, {
      export_type: export_type
    })
    return response.data
  } catch (error) {
    console.error('Error triggering export for contact extraction')
    throw error
  }
}

export const downloadContactExtractionFile = async(contactExtractionId:string, export_type: string) => {
  try {
    const response = await API.get(`/profile/contact/bulk/${contactExtractionId}/download?export_type=${export_type}`)
    return response.data
  } catch (error) {
    console.error('Error downloading exported file')
    throw error
  }
}
