import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import ErrorComponent from '@/components/custom/ErrorComponent'
import HUDLoader from '@/components/custom/HUDLoader'
import { ThemeProvider } from '@/components/custom/theme-provider'
import { Auth0Provider, useAuth0, User } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PostHogProvider } from 'posthog-js/react'
import NotFoundComponent from './components/custom/404'
import {
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  AUTH_CALLBACK_URL,
  POSTHOG_HOST,
  POSTHOG_KEY,
} from './config'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from './store/authProvider'
import useIntegration from './store/integration'
import useAuthStore from './store/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
    auth: undefined!,
    router: undefined!,
    iCallback: undefined!,
    authState: undefined!,
  },
  defaultErrorComponent: () => <ErrorComponent />,
  defaultPendingComponent: () => <HUDLoader />,
  defaultNotFoundComponent: () => <NotFoundComponent />,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface HistoryState {
    data?: any
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) throw new Error('Failed to find root element')

function RouterWithContext() {
  const auth = useAuth0<User>()
  const authState = useAuthStore()
  return (
    <RouterProvider
      router={router}
      context={{ auth: auth, router: router, iCallback: useIntegration(), authState }}
    />
  )
}

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <Auth0Provider
          domain={AUTH0_DOMAIN}
          clientId={AUTH0_CLIENT_ID}
          authorizationParams={{
            audience: AUTH0_AUDIENCE,
            redirect_uri: AUTH_CALLBACK_URL,
          }}
          useRefreshTokens
          useRefreshTokensFallback
          cacheLocation='localstorage'
          skipRedirectCallback={window.location.pathname != '/callback'}
        >
          <AuthProvider>
            <PostHogProvider
              apiKey={POSTHOG_KEY}
              options={{
                api_host: POSTHOG_HOST,
                ui_host: 'https://us.posthog.com',
                autocapture: true,
                capture_heatmaps: true,
                enable_heatmaps: true,
                capture_pageview: false,
                disable_session_recording: false,
              }}
            >
              <QueryClientProvider client={queryClient}>
                <RouterWithContext />
              </QueryClientProvider>
            </PostHogProvider>
          </AuthProvider>
        </Auth0Provider>
      </ThemeProvider>
    </StrictMode>
  )
}

createRoot(rootElement).render(<App />)
