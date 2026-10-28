import { Outlet } from "react-router"
import { Header } from "@/components/Header"

export default function App() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </>
  )
}
