import Header from '@/components/layouts/Header'
import API from './config'

export const clientIntegrations = async () => {
  try {
    const response = await API.get(`/integrations/status`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching me:', error)
    throw error
  }
}

export const uploadRawFileForFb = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await API.post('/integrations/fb-list/upload-raw', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10 * 1000
    }, )

    return response.data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const uploadEnrichedFileForFb = async (file: File, fb_id: string) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fb_id', fb_id)
    const response = await API.post('/integrations/fb-list/upload-enriched', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const fetchAllFbFiles = async () => {
  try {
    const response = await API.get('/integrations/fb-list')
    return response.data
  } catch (error) {
    console.error('failed getting files:', error)
    throw error
  }
}

export const getFbDownloadUrl = async (fb_list_id: string, file_type: string) => {
  try {
    const response = await API.post(
      `/integrations/fb-list/download-url/${fb_list_id}?file_type=${file_type}`
    )
    return response.data
  } catch (error) {
    console.error(`failed getting download url`, error)
    throw error
  }
}
