import { AUTH0_AUDIENCE } from '@/config'
import { InitApiInterceptors } from '@/services/config'
import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useRef } from 'react'
import useAuthStore, { User } from './auth'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}): JSX.Element => {
  const auth = useAuth0()
  const {
    setAuthStatus,
    setUser,
    logout: logoutFromStore,
    setAuth0Context,
    setShowPlatformModeSelector,
    toggleMarketingMode,
  } = useAuthStore()
  const searchParams = new URLSearchParams(location.search)
  const didInitialise = useRef(false)

  useEffect(() => {
    if (!auth.isLoading) {
      ;(async () => {
        const claims = await auth.getIdTokenClaims()
        let validToken = false
        if (claims?.exp) {
          const expirationTime = claims?.exp! * 1000
          const currentTime = Date.now()
          validToken = expirationTime > currentTime
        }
        if (!didInitialise.current) {
          didInitialise.current = true
          setAuth0Context(auth)
          InitApiInterceptors(auth)
        }

        //setAuthStatus(auth.isAuthenticated && validToken);
        if (!auth.isAuthenticated || !validToken) {
          await auth.loginWithRedirect({
            appState: { returnTo: location.href },
            authorizationParams: {
              invitation: searchParams.get('invitation') ?? undefined,
              organization: searchParams.get('organization') ?? undefined,
            },
          })
        } else if (auth.isAuthenticated && auth.user) {
          // Type assertion since Auth0 provides a slightly different user structure
          setUser(auth.user as User)
          const roles = auth.user[AUTH0_AUDIENCE + '/roles']

          if (
            roles.includes('admin') ||
            (roles.includes('sales_intelligence') && roles.includes('marketing_intelligence'))
          ) {
            setShowPlatformModeSelector(true)
          } else if (roles.includes('marketing_intelligence')) {
            window.history.pushState({}, '', '/discover') // Ensure URL is updated first
            toggleMarketingMode() // Then toggle marketing mode
          }
        }
      })().catch(console.error)
    }
    // useAuthStore.setState({ logout });
  }, [auth, setAuthStatus, setUser])

  return <>{children}</>
}
