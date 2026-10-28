import { Link, useSearchParams } from "react-router"
import type { SubmitEvent } from "react"
import { Button, buttonClass } from "@/components/Button"
import { Pagination } from "@/components/Pagination"
import { ProductCard } from "@/components/ProductCard"
import { Empty, ErrorState, Loading } from "@/components/States"
import { useFetchData } from "@/hooks/useFetchData"
import { useAuth } from "@/lib/auth"
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
  const { data, loading, error, reload } = useFetchData<Page<Product>>("/products/", Object.fromEntries(params))
  const { data: categories } = useFetchData<string[]>("/products/categories/")
  const { search = "", category = "", ordering = "-created_at" } = Object.fromEntries(params)
  const page = Number(params.get("page") || 1)
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== "page") next.delete("page")
    setParams(next)
    if (key === "page") window.scrollTo({ top: 0 })
  }
  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    update("search", String(new FormData(e.currentTarget).get("search")).trim())
  }
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={submit} role="search" className="flex flex-1 gap-2">
          <input key={search} name="search" defaultValue={search} placeholder="Search name, brand or description" aria-label="Search products" className={`${control} min-w-0 flex-1`} />
          <Button type="submit">Search</Button>
        </form>
        <select aria-label="Category" value={category} onChange={(e) => update("category", e.target.value)} className={control}>
          <option value="">All categories</option>
          {categories?.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select aria-label="Sort by" value={ordering} onChange={(e) => update("ordering", e.target.value)} className={control}>
          {sorts.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {loading && <Loading />}
      {error && <ErrorState message={error} retry={reload} />}
      {data && data.count === 0 && (
        <Empty title="No products found">
          {search || category ? <Button variant="outline" onClick={() => setParams({})}>Clear filters</Button> : user && <Link to="/products/new" className={buttonClass()}>Add the first product</Link>}
        </Empty>
      )}
      {data && data.count > 0 && (
        <>
          <p className="mb-4 text-sm text-muted">{data.count} products</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.results.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          <Pagination page={page} pages={Math.ceil(data.count / pageSize)} onChange={(next) => update("page", String(next))} />
        </>
      )}
    </>
  )
}
