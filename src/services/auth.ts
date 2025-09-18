import API from './config'

export const getClientState = async () => {
  try {
    const response = await API.get(`/auth/me`, {
      timeout: 10*1000
    })
    return response.data
  } catch (error: any) {
    console.error('Error fetching me:', error)
    throw error
  }
}

export const getClients = async () => {
  try {
    const response = await API.get(`/auth/admin/clients`)
    if (response!.data.success) {
      return response.data.data
    } else {
      console.error('Error fetching /auth/admin/clients:', response)
      throw 'Error fetching /auth/admin/clients'
    }
  } catch (error: any) {
    console.error('Error fetching me:', error)
    throw error
  }
}

export const integrateCRM = async (params: Record<string, any>) => {
  try {
    const response = await API.post(`/auth/crm`, params)
    return response.data
  } catch (error: any) {
    console.error('Error fetching me:', error)
    throw error
  }
}
