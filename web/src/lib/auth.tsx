import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { api, clearSession } from "@/lib/api"
import type { User } from "@/types"

type Session = { user: User; access: string; refresh: string }
type Body = { name?: string; email: string; password: string }

interface Auth { user: User | null; signin: (mode: "login" | "register", body: Body) => Promise<void>; logout: () => void }

const AuthContext = createContext<Auth>({ user: null, signin: async () => {}, logout: () => {} })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem("user") ?? "null"))
  const signin = async (mode: "login" | "register", body: Body) => {
    const { data } = await api.post<Session>(`/auth/${mode}/`, body)
    localStorage.setItem("access", data.access)
    localStorage.setItem("refresh", data.refresh)
    localStorage.setItem("user", JSON.stringify(data.user))
    setUser(data.user)
  }
  const logout = () => {
    clearSession()
    setUser(null)
  }
  return <AuthContext value={{ user, signin, logout }}>{children}</AuthContext>
}
