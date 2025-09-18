import { getClientState } from '@/services'
import { Auth0ContextInterface, User as Auth0User } from '@auth0/auth0-react'
import { create } from 'zustand'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  showPlatformModeSelector: boolean
  setShowPlatformModeSelector: (show: boolean) => void
  marketingMode: boolean
  toggleMarketingMode: (mode?: boolean) => void
  setAuthStatus: (authStatus: boolean) => void
  setUser: (userData: User | null) => void
  logout: () => void
  loading: boolean
  clientState: any
  auth0Context: Auth0ContextInterface
  setAuth0Context: (state: Auth0ContextInterface) => void
}

// Custom user type based on Auth0's user structure
export interface User extends Auth0User {
  picture?: string
}

function isBooleanDefined(value: boolean | undefined): boolean {
  return value !== undefined && typeof value === 'boolean'
}

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: true,
  isAuthenticated: false,
  user: null,
  showPlatformModeSelector: false,
  setShowPlatformModeSelector: (show: boolean) => set({ showPlatformModeSelector: show }),
  marketingMode: false,
  toggleMarketingMode: (mode?: boolean) => {
    set((state) => {
      let newMarketingMode: boolean | undefined = !state.marketingMode
      let skipRoutePush = false
      if (isBooleanDefined(mode)) {
        skipRoutePush = true
        newMarketingMode = mode
      }
      if (!skipRoutePush) {
        if (newMarketingMode) {
          window.history.pushState({}, '', '/discover')
        }
      }

      return { marketingMode: newMarketingMode }
    })
  },
  auth0Context: undefined!,
  setAuthStatus: (authStatus) => set({ isAuthenticated: authStatus, loading: false }),
  setUser: async (userData) => {
    const cs = await getClientState()
    set({ user: userData, clientState: cs.data })
    set({ isAuthenticated: true, loading: false })
  },
  setAuth0Context: (state) => set({ auth0Context: state }),
  clientState: undefined,
  logout: async () => {
    await get().auth0Context!.logout({ logoutParams: { returnTo: window.location.origin } })
    set({ isAuthenticated: false, user: null, loading: false })
  },
}))

export default useAuthStore
