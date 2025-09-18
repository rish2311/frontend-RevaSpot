import { fetchAudiences } from '@/services/discover'
import { ApiFetchState, Audience } from '@/types'
import { error } from 'console'
import { create } from 'zustand'

export interface AudienceState {
  loading: ApiFetchState
  audiences: Audience[]
  hasMore: boolean
  fetch: (page: number, size: number) => void
  export: (audience_id: number, size?: number) => void
}

export const useAudience = create<AudienceState>((set, get) => {
  return {
    loading: ApiFetchState.Loading,
    audiences: [],
    hasMore: false,
    fetch: async (page: number = 0, size: number = 20) => {
      try {
        set({ loading: ApiFetchState.Loading })
        const data = await fetchAudiences(page * size, size)
        set({ loading: ApiFetchState.Success, audiences: data.data, hasMore: data.has_more })
      } catch (e) {
        // console.log(error)
        set({ loading: ApiFetchState.Failed })
      }
    },
    export: (audience_id: number, size?: number) => {},
  }
})
