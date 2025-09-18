import {
  Audience,
  Audiences,
  CreateAudience,
  DiscoverQuery,
  DiscoverQueryResult,
  Export,
} from '@/types'
import API from './config'
import { json } from 'stream/consumers'
import { stringify } from 'querystring'

export const getFilters = async () => {
  try {
    const response = await API.get(`/profile/filters`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching discover filters:', error)
    throw error
  }
}

export const getFilterOptions = async (path: string) => {
  console.log("filter option path", path)
  try {
    const response = await API.get(path, {
      timeout: 10* 1000
    })
    return response.data
  } catch (error) {
    console.error('Error fetching discover filter options for :', path, error)
    throw error
  }
}

export const queryDiscover = async (query: DiscoverQuery): Promise<DiscoverQueryResult> => {
  // console.log("request", query)
  try {
    const response = await API.post('/profile/query', query, { timeout: 10 * 1000 })
    return response.data.data
  } catch (error) {
    console.error('Error querying discover with query :', query, error)
    throw error
  }
}

export const saveAudience = async (req: CreateAudience): Promise<Audience> => {
  // console.log("request", query)
  try {
    const response = await API.post('/audience', req)
    return response.data
  } catch (error) {
    console.error('Error querying discover with query :', req.query, error)
    throw error
  }
}

export const fetchAudiences = async (offset: number = 0, size: number = 10): Promise<Audiences> => {
  try {
    const response = await API.get(`/audience?offset=${offset}&size=${size}`, {
      timeout: 10*1000
    })
    return response.data
  } catch (error) {
    console.error('error while fetching audiences', offset, size, error)
    throw error
  }
}

export const fetchAudience = async (aud_id: number): Promise<Audience> => {
  try {
    const response = await API.get(`/audience/${aud_id}`)
    return response.data
  } catch (error) {
    console.error('error while fetching audience', aud_id, error)
    throw error
  }
}

export const exportAudience = async (
  audience_id: number,
  force: boolean = false,
  size: number = 1000
): Promise<Export> => {
  // console.log("request", query)
  try {
    const response = await API.post(
      `/audience/${audience_id}/export?force=${force}&size=${size}`,
      {}
    )
    return response.data
  } catch (error) {
    console.error('Error querying discover with query :', audience_id, error)
    throw error
  }
}

export const downloadExport = async (export_id: string) => {
  try {
    const response = await API.get(`/audience/export/${export_id}/download`)
    return response.data.url
  } catch (error) {
    console.error('Error while downloadExport :', export_id, error)
    throw error
  }
}
