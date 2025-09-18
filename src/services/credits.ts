import API from './config'

export const getCredits = async (accountType: string) => {
  try {
    const response = await API.get(`/credits/cycle?account_type=${accountType}`, {
      params: { account_type: accountType },
    })
    return response.data
  } catch (error: any) {
    console.error('Error fetching credits:', error)
    throw error
  }
}
