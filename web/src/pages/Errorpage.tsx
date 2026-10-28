import { Link, isRouteErrorResponse, useRouteError } from "react-router"
import { buttonClass } from "@/components/Button"

export default function Errorpage() {
  const error = useRouteError()
  const missing = isRouteErrorResponse(error) && error.status === 404
  return (
    <div className="px-4 py-24 text-center">
      <h1 className="mb-4 text-3xl font-bold text-primary">{missing ? "Page not found" : "Something went wrong"}</h1>
      <Link to="/" className={buttonClass()}>Back to products</Link>
    </div>
  )
}
