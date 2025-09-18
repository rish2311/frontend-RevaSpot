import API from './config'

export const getDashboardDataCriticalNumbers = async (
  start_date?: Date,
  end_date?: Date,
  file_ids?: string[],
  segment_ids?: string[]
) => {
  try {
    const response = await API.post(`/metrics/lead-analysis/critical-numbers`, {
      start_date: start_date?.toISOString(),
      end_date: end_date?.toISOString(),
      file_ids,
      segment_ids,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }
}

export const getDashboardDataMetrics = async (
  start_date?: Date,
  end_date?: Date,
  file_ids?: string[],
  segment_ids?: string[]
) => {
  try {
    const response = await API.post(`/metrics/lead-analysis/metrics`, {
      start_date: start_date?.toISOString(),
      end_date: end_date?.toISOString(),
      file_ids,
      segment_ids,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }
}

export const getFunnelData = async (
  start_date?: Date,
  end_date?: Date,
  file_ids?: string[],
  segment_ids?: string[],
  segment_filter?: any
) => {
  try {
    const response = await API.post(`/metrics/funnel`, {
      start_date: start_date?.toISOString(),
      end_date: end_date?.toISOString(),
      file_ids,
      segment_ids,
      segment_filter,
    }, {timeout: 20*1000})
    return response.data
  } catch (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }
}

export const getWeekOnWeekPerformance = async (
  start_date?: Date,
  end_date?: Date,
  file_ids?: string[],
  segment_ids?: string[]
) => {
  try {
    const response = await API.post(`/metrics/weekly-performance`, {
      start_date: start_date?.toISOString(),
      end_date: end_date?.toISOString(),
      file_ids,
      segment_ids,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }
}
