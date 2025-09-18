import { create } from 'zustand'

export interface Callback {
  queryParam: URLSearchParams
  callback: boolean
  setQuery: (query: URLSearchParams) => void
}

export const useIntegration = create<Callback>((set) => ({
  queryParam: undefined!,
  callback: false,
  setQuery: (query: URLSearchParams) => {
    if (!query) {
      set({ queryParam: query, callback: false })
    } else {
      set({ queryParam: query, callback: true })
    }
  },
}))

export default useIntegration
