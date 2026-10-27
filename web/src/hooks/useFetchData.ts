import axios from "axios"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { errorText } from "@/lib/errors"

export function useFetchData<T>(url: string | null, params: object = {}) {
  const [result, setResult] = useState<{ key: string; data: T | null; error: string }>({ key: "", data: null, error: "" })
  const [tick, setTick] = useState(0)
  const query = JSON.stringify(params)
  const key = `${url}|${query}|${tick}`
  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await api.get<T>(url, { params: JSON.parse(query), signal: controller.signal })
        setResult({ key, data: res.data, error: "" })
      } catch (err) {
        if (!axios.isCancel(err)) setResult({ key, data: null, error: errorText(err) })
      }
    }
    load()
    return () => controller.abort()
  }, [url, query, key])
  const loading = Boolean(url) && result.key !== key
  return { data: loading ? null : result.data, error: loading ? "" : result.error, loading, reload: () => setTick((n) => n + 1) }
}
