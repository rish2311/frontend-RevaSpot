import HUDLoader from '@/components/custom/HUDLoader'
import PostHogPageviewTracker from '@/components/custom/PostHogPageViewTracker'
import Header from '@/components/layouts/Header'
import SideNavbar from '@/components/layouts/SideNavbar'
import { Toaster } from '@/components/ui/sonner'
import { Callback } from '@/store/integration'
import { Auth0ContextInterface } from '@auth0/auth0-react'
import { QueryClient } from '@tanstack/react-query'
import {
  Outlet,
  createRootRouteWithContext,
  createRouter,
  useLocation,
} from '@tanstack/react-router'
import { usePostHog } from 'posthog-js/react'
import * as React from 'react'
import { useEffect } from 'react'
import useAuthStore, { AuthState } from '../store/auth'
import { StoreApi, UseBoundStore } from 'zustand'
const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      )

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthStore()
  const location = useLocation()
  const posthog = usePostHog()

  useEffect(() => {
    if (posthog && isAuthenticated && user) {
      posthog.identify(user.sub, {
        email: user.email,
        name: user.nickname,
        client: user.org_name,
      })
      posthog.capture('user_logged_in', {
        email: user.email,
        client: user.org_name,
        path: location.pathname,
        time: new Date().toISOString(),
      })
    }
  }, [posthog, isAuthenticated, user])

  if (loading || !isAuthenticated) return <HUDLoader />
  return (
    <>
      <PostHogPageviewTracker />
      {children}
    </>
  )
}

interface RouterContext {
  authState: AuthState
  iCallback: Callback
  queryClient: QueryClient
  auth: Auth0ContextInterface
  router: ReturnType<typeof createRouter> | any // Reference to the router itself
}

const marketing = ['/audience', '/discover', '/campaign']

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context, location }) => {
    if (marketing.some((prefix) => location.pathname.startsWith(prefix))) {
      context.authState.toggleMarketingMode(true)
    }
    const searchParams = new URLSearchParams(location.search)
    // if (location.pathname === '/callback' && searchParams.has('code')) {
    //   const result = await context.auth.handleRedirectCallback()
    //   window.location.replace(result.appState?.returnTo ?? '/')
    // } else
    if (location.pathname === '/integrations/callback' && searchParams.has('state')) {
      // window.location.replace(`/integrations?${searchParams.toString()}`)
      context.iCallback.setQuery(searchParams)
      context.router.navigate({ to: '/integrations', replace: true })
    }
  },
  component: RootComponent,
})

function RootComponent() {
  return (
    <ProtectedRoute>
      <React.Fragment>
        <div className='flex h-screen max-h-screen w-full flex-col space-y-4 overflow-hidden bg-neutral-100 px-4 py-4 dark:bg-neutral-800'>
          <Header />
          <div className='flex h-full flex-grow flex-row space-x-4 overflow-hidden'>
            <SideNavbar />
            <div className='flex-grow overflow-auto'>
              <Outlet />
            </div>
          </div>
        </div>
        <Toaster />
      </React.Fragment>
    </ProtectedRoute>
  )
}
