import axios, { AxiosInstance } from 'axios'

export const baseApiClient = (baseUrl: string, headerParams?: { [key: string]: any }): AxiosInstance => {
  const headers: any = { ...headerParams }
  return axios.create({
    baseURL: baseUrl,
    headers,
  })
}
