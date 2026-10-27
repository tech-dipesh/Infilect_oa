import axios from "axios"

declare module "axios" {
  interface AxiosRequestConfig { retried?: boolean }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? "http://localhost:8000/api",
  withCredentials: true,
  timeout: 10000,
})

export const clearSession = () => ["access", "refresh", "user"].forEach((key) => localStorage.removeItem(key))

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || !error.config) throw error
  const { config, response } = error
  const refresh = localStorage.getItem("refresh")
  if (response?.status !== 401 || config.retried || !refresh || config.url?.startsWith("/auth/")) throw error
  try {
    const { data } = await axios.post<{ access: string }>(`${config.baseURL}/auth/refresh/`, { refresh })
    localStorage.setItem("access", data.access)
  } catch {
    clearSession()
    window.location.assign("/login")
    throw error
  }
  return api({ ...config, retried: true })
})