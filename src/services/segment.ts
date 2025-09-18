import API from './config'

export const getSegments = async () => {
  try {
    const response = await API.get('/lead/segments', { timeout: 15000 })
    return response.data
  } catch (error) {
    console.error('Error fetching segments:', error)
    throw error
  }
}

const restructureFilter = (config: any) => {
  const newFilterConfig = Object.fromEntries(
    Object.entries(config).filter(
      ([_, value]) =>
        value !== '' &&
        value !== undefined &&
        value !== null &&
        !(Array.isArray(value) && value.length === 0)
    )
  )
  if (newFilterConfig.dateRange) {
    const { from, to } = newFilterConfig.dateRange as Record<string, Date>
    if (from || to) {
      newFilterConfig.dateRange = {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
      }
    } else {
      delete newFilterConfig.dateRange
    }
  }
  return newFilterConfig
}

export const getSegmentData = async (segmentId: string, filter: any) => {
  try {
    const response = await API.post(`/lead/segments/${segmentId}`, restructureFilter(filter))
    return response.data
  } catch (error) {
    console.error(`Error fetching data for segment ${segmentId}:`, error)
    throw error
  }
}

const restructureConfig = (config: any) => {
  const newFilterConfig = {
    ...config,
    filter: Object.fromEntries(
      Object.entries(config.filter)
        .filter(
          ([_, value]) =>
            value !== '' &&
            value !== undefined &&
            value !== null &&
            !(Array.isArray(value) && value.length === 0)
        )
        .map(([key, value]) => [
          key,
          typeof value === 'string'
            ? value === 'TRUE'
              ? true
              : value === 'FALSE'
                ? false
                : value
            : value,
        ])
    ),
  }
  return newFilterConfig
}

export const upsertSegment = async (segmentData: any, segmentId?: string) => {
  try {
    const response = await API.put('/lead/segments', restructureConfig(segmentData), {
      params: { segment_id: segmentId },
    })
    return response.data
  } catch (error) {
    console.error(`Error upserting segment ${segmentId}:`, error)
    throw error
  }
}

export const getCriticalNumbersForFilter = async (segment_filter: any) => {
  try {
    const response = await API.post('/lead/critical-numbers-for-filter', {
      segment_filter,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching critical numbers for filter:', error)
    throw error
  }
}

export const deleteSegment = async (segmentId: string) => {
  try {
    const response = await API.delete(`/lead/segments/${segmentId}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting segment ${segmentId}:`, error)
    throw error
  }
}
