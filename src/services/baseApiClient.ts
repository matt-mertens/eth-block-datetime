import axios, { AxiosInstance } from 'axios'

export const baseApiClient = (baseUrl: string, accessToken?: string): AxiosInstance => {
  const headers: any = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return axios.create({
    baseURL: baseUrl,
    headers,
  })
}
