import API from './config'

export interface EnrichLeadData {
  lead_stage?: string
  email?: string
  first_name?: string
  last_name?: string
  name?: string
  phone?: any
  linkedin?: string
  lead_source?: string
  lead_id?: string
  re_derive?: boolean
  re_enrich?: boolean
  sync?: boolean
  created_at?: string
  updated_at?: string
  email_verified?: string
}

export interface leadLinkedinData {
  linkedin: string
  contact_type: string
}

export interface BulkEnrichData {
  leads: EnrichLeadData[]
  re_derive?: boolean
  re_enrich?: boolean
}

export interface MigrateLeadsData {
  start: number
  end: number
}

export const getHistory = async (historyType?: string) => {
  try {
    const response = await API.get(`/lead/file/history`)
    return response.data
  } catch (error) {
    console.error('Error fetching user history:', error)
    throw error
  }
}

export const getSingleEnrichmentHistory = async (historyType: string, offset: number, limit: number) => {
  try {
    const response = await API.get(`/profile/contact/history`, {
      params: {
        contact_types: historyType,
        offset: offset,
        limit: limit,
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching user history:', error)
    throw error
  }
}

export const downloadFile = async (file_id: string) => {
  try {
    const response = await API.get(`/lead/file/download`, {
      params: { file_id },
    })
    if (response.data.data) {
      return { download_url: response.data.data.download_url ?? '' }
    }
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

export const enrichLead = async (leadData: EnrichLeadData) => {
  try {
    const response = await API.post(`/lead/enrich`, leadData)
    return response.data
  } catch (error) {
    console.error('Error enriching lead:', error)
    throw error
  }
}

export const getLeadContact = async (leadData: leadLinkedinData) => {
  try {
    const response = await API.post(`/profile/contact`, leadData)
    return response.data.data
  } catch (error) {
    console.log('Error getting lead contact:', error)
    throw error
  }
}

export const getLeadContactInfo = async (contact_id: string) => {
  try {
    const response = await API.get(`/profile/contact/${contact_id}`)
    return response.data
  } catch (error) {}
}

export const bulkEnrich = async (bulkData: BulkEnrichData) => {
  try {
    const response = await API.post(`/lead/bulk/enrich`, bulkData)
    return response.data
  } catch (error) {
    console.error('Error in bulk enriching leads:', error)
    throw error
  }
}

export const fileEnrich = async (
  file: File,
  mapping: Record<string, string>,
  forClient: string,
  enrichmentType: string,
  extractEmails?: boolean
) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(mapping))
    formData.append('for_client', forClient)
    formData.append('enrichment_type', enrichmentType)
    formData.append('extract_emails', JSON.stringify(extractEmails))
    const response = await API.post(`/lead/file/upload`, formData, {
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

export const getLeadStatus = async (lead_id: string) => {
  try {
    const response = await API.get(`/lead/status`, {
      params: { lead_id },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching lead status by ID:', error)
    throw error
  }
}

export const getFileStatus = async (file_id: string) => {
  try {
    const response = await API.get(`/lead/file/status`, {
      params: { file_id },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching file status:', error)
    throw error
  }
}

export interface LeadsFilter {
  params?: Record<string, any>
  sort_params?: Record<string, any>
  offset?: number
  pageIndex?: number
  pageSize?: number
}

const restructureConfig = (config: any) => {
  const newFilterConfig = {
    ...config,
    params: Object.fromEntries(
      Object.entries(config.params).filter(
        ([_, value]) =>
          value !== '' &&
          value !== undefined &&
          value !== null &&
          !(Array.isArray(value) && value.length === 0)
      )
    ),
  }
  if (newFilterConfig.params.profile_fit)
    newFilterConfig.params.profile_fit = newFilterConfig.params.profile_fit === 'Yes'
  if (newFilterConfig.params.dateRange) {
    const { from, to } = newFilterConfig.params.dateRange as Record<string, Date>
    if (from || to) {
      newFilterConfig.params.dateRange = {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
      }
    } else {
      delete newFilterConfig.params.dateRange
    }
  }
  newFilterConfig.offset = (newFilterConfig.pageIndex ?? 0) * (newFilterConfig.pageSize ?? 50)
  delete newFilterConfig.pageIndex
  delete newFilterConfig.pageSize
  return newFilterConfig
}

export const getLeads = async (leadsFilter: LeadsFilter) => {
  try {
    const response = await API.post(`/lead`, restructureConfig(leadsFilter))
    return response.data
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw error
  }
}

export const exportLeads = async (leadsFilter: LeadsFilter) => {
  try {
    const response = await API.post(`/lead/export`, restructureConfig(leadsFilter))
    if (response.data.data && response.data.data.download_url) {
      return { download_url: response.data.data.download_url }
    } else throw new Error('No download URL found')
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw error
  }
}
