import axios from "axios"

type ApiError = { error?: string | Record<string, string[]> }

export function errorText(err: unknown) {
  if (!axios.isAxiosError<ApiError>(err)) return "Something went wrong, please try again"
  if (!err.response) return "Cannot reach the server, please try again"
  const error = err.response.data?.error
  return typeof error === "string" ? error : "Please fix the highlighted fields"
}

export function fieldErrors(err: unknown) {
  const error = axios.isAxiosError<ApiError>(err) ? err.response?.data?.error : undefined
  const entries = typeof error === "object" ? Object.entries(error).map(([key, messages]): [string, string] => [key, messages[0]]) : []
  return Object.fromEntries(entries)
}
