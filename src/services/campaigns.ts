import API from './config'
import { Campaign } from '@/components/layouts/marketing/Campaigns/CreateCampaign'


export const createCampaign = async(campaignParams: Campaign) => {
  try {
    const response = await API.post(`/campaign/`, campaignParams)
    return response.data
  } catch (error) {
    console.error('Error creating campaing campaign:', error)
    throw error
  }
}

export const getCampaigns = async () => {
  try {
    const response = await API.get(`/campaign/`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching campaign:', error)
    throw error
  }
}

export const getCampaignMetrics = async (campaignId: string) => {
  try {
    const response = await API.get(`/campaign/${campaignId}/metrics`)
    return response.data
  } catch (error) {
    console.error('Error fetching campaign metrics:', error)
    throw error
  }
}

export const getCampaignLeads = async (campaignId: string, limit: number, offset: number) => {
  try {
    const response = await API.get(`/campaign/${campaignId}/leads?limit=${limit}&offset=${offset}`)
    return response.data
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw error
  }
}

export const updateCampaignLeads = async (campaignId: string, leadId: string, status?: string, remarks?: string) => {
  try {
    const response = await API.put(`/campaign/${campaignId}/lead/${leadId}`, {
      status,
      remarks
    })
    return response.data
  } catch (error) {
    console.error('Error updating leads:', error)
    throw error
  }
}

export const getLeadCallLogs = async (leadId: string) => {
  try {
    const response = await API.get(`/campaign/lead/${leadId}/calls`)
    return response.data
  } catch (error) {
    console.error('Error loading call logs:', error)
    throw error
  }
}
