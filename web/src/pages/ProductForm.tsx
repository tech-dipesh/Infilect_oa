import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router"
import { Button, buttonClass } from "@/components/Button"
import { Field } from "@/components/Field"
import { ErrorState, Loading } from "@/components/States"
import { useFetchData } from "@/hooks/useFetchData"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { errorText, fieldErrors } from "@/lib/errors"
import type { Product } from "@/types"

const fields = [
  { name: "name", label: "Product name" },
  { name: "brand", label: "Brand" },
  { name: "category", label: "Category", list: "categories" },
  { name: "price", label: "Price", type: "number", min: "0.01", step: "0.01" },
  { name: "image_url", label: "Image URL", type: "url", placeholder: "https://" },
  { name: "description", label: "Description", rows: 5 },
]

function Fields({ product }: { product: Product | null }) {
  const navigate = useNavigate()
  const { data: categories } = useFetchData<string[]>("/products/categories/")
  const [form, setForm] = useState({
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    price: product?.price ?? "",
    image_url: product?.image_url ?? "",
    description: product?.description ?? "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const [writing, setWriting] = useState(false)
  const ready = Boolean(form.name && form.brand && form.category)
  const generate = async () => {
    setWriting(true)
    setErrors({})
    setFormError("")
    try {
      const { data } = await api.post<{ description: string }>("/ai/description/", { name: form.name, brand: form.brand, category: form.category }, { timeout: 30000 })
      setForm((current) => ({ ...current, description: data.description }))
    } catch (err) {
      setFormError(errorText(err))
    }
    setWriting(false)
  }
  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError("")
    try {
      const { data } = product ? await api.put<Product>(`/products/${product.id}/`, form) : await api.post<Product>("/products/", form)
      navigate(`/products/${data.id}`)
    } catch (err) {
      const found = fieldErrors(err)
      setErrors(found)
      setFormError(Object.keys(found).length ? "" : errorText(err))
      setSaving(false)
    }
  }
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-xl flex-col gap-4 rounded-md bg-white p-6">
      <h1 className="text-2xl font-bold text-primary">{product ? "Edit product" : "Add product"}</h1>
      {fields.map((field) => (
        <Field key={field.name} {...field} value={form[field.name as keyof typeof form]} error={errors[field.name]} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} />
      ))}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={generate} disabled={!ready || writing}>{writing ? "Writing..." : "Generate description"}</Button>
        {!ready && <span className="text-sm text-muted">Enter name, brand and category first</span>}
      </div>
      <datalist id="categories">{categories?.map((name) => <option key={name} value={name} />)}</datalist>
      {formError && <p role="alert" className="text-danger">{formError}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save product"}</Button>
        <Link to={product ? `/products/${product.id}` : "/"} className={buttonClass("outline")}>Cancel</Link>
      </div>
    </form>
  )
}

export default function ProductForm() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading, error, reload } = useFetchData<Product>(id ? `/products/${id}/` : null)
  if (!user) return <Navigate to="/login" replace />
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} retry={reload} />
  if (data && data.owner !== user.id) return <ErrorState message="You can only edit your own products" />
  return <Fields product={data} />
}
