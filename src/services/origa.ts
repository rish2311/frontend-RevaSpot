import API from './config'

export const triggerSingleCall = async (data: any) => {
  try {
    const response = await API.post(`/integrations/origa/trigger-call`, data)
    return response.data
  } catch (error: any) {
    console.error('Error triggering single call:', error)
    throw error
  }
}

export const triggerBulkCall = async (
  file: File,
  mapping: Record<string, string>,
  agentIdentifier: string,
  forClient: string
) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(mapping))
    formData.append('for_client', forClient)
    formData.append('agent_identifier', agentIdentifier)
    const response = await API.post(`/integrations/origa/bulk-trigger-call`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error: any) {
    console.error('Error triggering bulk call:', error)
    throw error
  }
}

export const getOrigaCallDetails = async (callId: string) => {
  try {
    const response = await API.get(`/integrations/origa/call/${callId}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching call details:', error)
    throw error
  }
}

export const getOrigaContacts = async (
  params?: Record<string, any>,
  limit?: number,
  offset?: number
) => {
  try {
    const response = await API.post(`/integrations/origa/contacts`, { params, limit, offset })
    return response.data
  } catch (error: any) {
    console.error('Error fetching contacts:', error)
    throw error
  }
}

export const getOrigaCampaignAnalysis = async (params?: Record<string, any>) => {
  try {
    const response = await API.post(`/integrations/origa/campaign-analysis`, { params })
    return response.data
  } catch (error: any) {
    console.error('Error fetching campaign analysis:', error)
    throw error
  }
}

export const getOrigaCampaignHistory = async () => {
  try {
    const response = await API.get(`/integrations/origa/history`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching campaign history:', error)
    throw error
  }
}

export const getOrigaAgents = async () => {
  try {
    const response = await API.get(`/integrations/origa/agents`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching agents:', error)
    throw error
  }
}
