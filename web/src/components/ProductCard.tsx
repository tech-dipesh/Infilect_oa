import { Link } from "react-router"
import { ProductImage } from "@/components/ProductImage"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/types"

export function ProductCard({ product }: { product: Product }) {
  const { id, name, brand, category, price, image_url } = product
  return (
    <Link to={`/products/${id}`} className="flex flex-col overflow-hidden rounded-md bg-white shadow-xs transition-shadow duration-200 hover:shadow-sm">
      <ProductImage key={image_url} src={image_url} alt={name} />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-sm text-muted">{brand}</p>
        <h2 className="line-clamp-2 font-semibold text-primary">{name}</h2>
        <span className="w-fit rounded-lg bg-accent/25 px-3 text-sm text-primary">{category}</span>
        <p className="mt-auto pt-2 text-lg font-bold text-primary">{formatPrice(price)}</p>
      </div>
    </Link>
  )
}
