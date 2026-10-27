import type { ButtonHTMLAttributes } from "react"

const variants = {
  primary: "bg-accent text-primary hover:brightness-95",
  outline: "border border-primary text-primary hover:bg-primary hover:text-white",
  danger: "bg-danger text-white hover:brightness-90",
}

type Variant = keyof typeof variants

export const buttonClass = (variant: Variant = "primary") =>
  `inline-flex items-center justify-center rounded-lg px-6 py-2 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`

export function Button({ variant, className = "", ...props }: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`${buttonClass(variant)} ${className}`} {...props} />
}
