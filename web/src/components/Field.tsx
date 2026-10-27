import type { ChangeEvent } from "react"

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  rows?: number
  type?: string
  list?: string
  autoComplete?: string
  placeholder?: string
  min?: string
  step?: string
}

export function Field({ label, name, value, onChange, error, rows, type = "text", list, autoComplete, placeholder, min, step }: FieldProps) {
  const common = {
    name,
    value,
    onChange,
    placeholder,
    autoComplete,
    required: true,
    "aria-invalid": Boolean(error),
    className: `w-full rounded-sm border bg-white px-4 py-2 ${error ? "border-danger" : "border-muted"}`,
  }
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-primary">{label}</span>
      {rows ? <textarea rows={rows} {...common} /> : <input type={type} list={list} min={min} step={step} {...common} />}
      {error && <span role="alert" className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  )
}
