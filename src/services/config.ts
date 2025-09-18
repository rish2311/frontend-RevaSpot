import { API_URL } from '@/config'
import { Auth0ContextInterface } from '@auth0/auth0-react'
import axios from 'axios'

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  timeout: 5000,
})

export const InitApiInterceptors = (auth: Auth0ContextInterface) => {
  API.interceptors.request.use(
    async (config) => {
      const token = await auth.getAccessTokenSilently()
      if (token) config.headers.Authorization = `Bearer ${token}`
      else throw Error('AccessToken not found. Relogin')
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  API.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) auth.loginWithRedirect()
      return Promise.reject(error)
    }
  )
}

export const addAccessTokenInterceptor = (getAccessTokenSilently: any, loginWithRedirect: any) => {
  API.interceptors.request.use(
    async (config) => {
      const token = await getAccessTokenSilently()
      if (token) config.headers.Authorization = `Bearer ${token}`
      else throw Error('AccessToken not found. Relogin')
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  API.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) loginWithRedirect()
      return Promise.reject(error)
    }
  )
}

export default API
