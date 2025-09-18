// export const ENV = import.meta.env.VITE_VERCEL_ENV
export const IS_PROD = import.meta.env.PROD
export const IS_DEV = import.meta.env.DEV

export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID
export const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE

export const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
export const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

let api_url = ''
if (IS_PROD) {
  api_url = import.meta.env.VITE_API_URL
} else {
  //? For testing purpose we are using staging backend
  api_url = import.meta.env.VITE_API_URL
  // api_url = 'http://127.0.0.1:5000'
}

export const API_URL = api_url

let app_url = ''
if (IS_PROD) {
  app_url = import.meta.env.VITE_APP_URL
} else {
  app_url = 'http://localhost:3000'
}

export const AUTH_CALLBACK_URL = app_url + '/callback'
export const INTEGRATIONS_CALLBACK_URL = app_url + '/integrations/callback'
