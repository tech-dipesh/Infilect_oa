export interface User { id: number; name: string; email: string }

export interface Product {
  id: number
  name: string
  brand: string
  category: string
  description: string
  price: string
  image_url: string
  owner: number
  created_at: string
  updated_at: string
}

export interface Page<T> { count: number; next: string | null; previous: string | null; results: T[] }
