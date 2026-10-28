import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useSearchParams } from "react-router"
import { Button, buttonClass } from "@/components/Button"
import { Pagination } from "@/components/Pagination"
import { ProductCard } from "@/components/ProductCard"
import { Empty, ErrorState, Loading } from "@/components/States"
import { useFetchData } from "@/hooks/useFetchData"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { errorText } from "@/lib/errors"
import type { Page, Product } from "@/types"

const pageSize = 12
const sorts = [
  { value: "-created_at", label: "Newest" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
]
const control = "rounded-sm border border-muted bg-white px-4 py-2"

export default function Products() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [asking, setAsking] = useState(false)
  const [aiError, setAiError] = useState("")
  const { data, loading, error, reload } = useFetchData<Page<Product>>("/products/", Object.fromEntries(params))
  const { data: categories } = useFetchData<string[]>("/products/categories/")
  const { search = "", category = "", ordering = "-created_at", min_price = "", max_price = "" } = Object.fromEntries(params)
  const page = Number(params.get("page") || 1)
  const filtered = Boolean(search || category || min_price || max_price)
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== "page") next.delete("page")
    setParams(next)
    if (key === "page") window.scrollTo({ top: 0 })
  }
  const askAI = async (query: string) => {
    if (!query) return setAiError("Type what you are looking for first")
    setAsking(true)
    setAiError("")
    try {
      const { data: filters } = await api.post<Record<string, string>>("/ai/search/", { query }, { timeout: 30000 })
      setParams(filters)
    } catch (err) {
      setAiError(errorText(err))
    }
    setAsking(false)
  }
  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget, e.nativeEvent.submitter)
    const query = String(form.get("search")).trim()
    if (form.get("mode") === "ai") askAI(query)
    else update("search", query)
  }
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={submit} role="search" className="flex flex-1 gap-2">
          <input key={search} name="search" defaultValue={search} placeholder="Search name, brand or description" aria-label="Search products" className={`${control} min-w-0 flex-1`} />
          <Button type="submit">Search</Button>
          <Button type="submit" name="mode" value="ai" variant="outline" disabled={asking}>{asking ? "Thinking..." : "Ask AI"}</Button>
        </form>
        <select aria-label="Category" value={category} onChange={(e) => update("category", e.target.value)} className={control}>
          <option value="">All categories</option>
          {categories?.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select aria-label="Sort by" value={ordering} onChange={(e) => update("ordering", e.target.value)} className={control}>
          {sorts.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {aiError && <p role="alert" className="mb-4 text-danger">{aiError}</p>}
      {loading && <Loading />}
      {error && <ErrorState message={error} retry={reload} />}
      {data && data.count === 0 && (
        <Empty title="No products found">
          {filtered ? <Button variant="outline" onClick={() => setParams({})}>Clear filters</Button> : user && <Link to="/products/new" className={buttonClass()}>Add the first product</Link>}
        </Empty>
      )}
      {data && data.count > 0 && (
        <>
          <p className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>{data.count} products</span>
            {(min_price || max_price) && <span>Price {min_price || 0} to {max_price || "no limit"}</span>}
            {filtered && <button onClick={() => setParams({})} className="font-semibold text-primary underline">Clear filters</button>}
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.results.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          <Pagination page={page} pages={Math.ceil(data.count / pageSize)} onChange={(next) => update("page", String(next))} />
        </>
      )}
    </>
  )
}
