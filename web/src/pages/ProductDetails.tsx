import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Button, buttonClass } from "@/components/Button"
import { ProductImage } from "@/components/ProductImage"
import { ErrorState, Loading } from "@/components/States"
import { useFetchData } from "@/hooks/useFetchData"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { errorText } from "@/lib/errors"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/types"

export default function ProductDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const { data: product, loading, error, reload } = useFetchData<Product>(`/products/${id}/`)
  const remove = async () => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return
    setDeleting(true)
    try {
      await api.delete(`/products/${id}/`)
      navigate("/")
    } catch (err) {
      setDeleteError(errorText(err))
      setDeleting(false)
    }
  }
  if (loading) return <Loading />
  if (error || !product) return <ErrorState message={error} retry={reload} />
  const { name, brand, category, description, price, image_url, owner } = product
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="overflow-hidden rounded-md bg-white">
        <ProductImage key={image_url} src={image_url} alt={name} />
      </div>
      <div className="flex flex-col gap-3">
        <Link to="/" className="text-sm text-muted hover:underline">Back to products</Link>
        <p className="text-muted">{brand}</p>
        <h1 className="text-3xl font-bold text-primary">{name}</h1>
        <span className="w-fit rounded-lg bg-accent/25 px-3 text-sm text-primary">{category}</span>
        <p className="text-2xl font-bold text-primary">{formatPrice(price)}</p>
        <p className="whitespace-pre-line">{description}</p>
        {user?.id === owner && (
          <div className="mt-4 flex gap-3">
            <Link to={`/products/${id}/edit`} className={buttonClass("outline")}>Edit</Link>
            <Button variant="danger" onClick={remove} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
          </div>
        )}
        {deleteError && <p role="alert" className="text-danger">{deleteError}</p>}
      </div>
    </div>
  )
}
