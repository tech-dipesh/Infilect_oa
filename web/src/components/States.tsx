import type { ReactNode } from "react"
import { Button } from "@/components/Button"

export const Loading = () => <p role="status" className="py-16 text-center text-muted">Loading...</p>

export const ErrorState = ({ message, retry }: { message: string; retry?: () => void }) => (
  <div role="alert" className="py-16 text-center">
    <p className="mb-4 text-danger">{message}</p>
    {retry && <Button variant="outline" onClick={retry}>Try again</Button>}
  </div>
)

export const Empty = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="py-16 text-center">
    <p className="mb-4 text-xl font-semibold text-primary">{title}</p>
    {children}
  </div>
)
