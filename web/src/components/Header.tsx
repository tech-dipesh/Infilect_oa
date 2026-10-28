import { Link, useNavigate } from "react-router"
import { buttonClass } from "@/components/Button"
import { useAuth } from "@/lib/auth"

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const signout = () => {
    logout()
    navigate("/")
  }
  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-2xl font-bold">Infilect</Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/products/new" className={buttonClass()}>Add product</Link>
              <button onClick={signout} className="hover:underline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className={buttonClass()}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
