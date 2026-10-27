import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router"
import { Button } from "@/components/Button"
import { Field } from "@/components/Field"
import { useAuth } from "@/lib/auth"
import { errorText, fieldErrors } from "@/lib/errors"

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const { user, signin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const isLogin = mode === "login"
  if (user) return <Navigate to="/" replace />
  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError("")
    try {
      await signin(mode, form)
      navigate("/")
    } catch (err) {
      const found = fieldErrors(err)
      setErrors(found)
      setFormError(Object.keys(found).length ? "" : errorText(err))
      setSaving(false)
    }
  }
  const change = (e: { target: { name: string; value: string } }) => setForm({ ...form, [e.target.name]: e.target.value })
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-4 rounded-md bg-white p-6">
      <h1 className="text-2xl font-bold text-primary">{isLogin ? "Login" : "Create your account"}</h1>
      {!isLogin && <Field label="Name" name="name" value={form.name} onChange={change} error={errors.name} autoComplete="name" />}
      <Field label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} autoComplete="email" />
      <Field label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} autoComplete={isLogin ? "current-password" : "new-password"} />
      {formError && <p role="alert" className="text-danger">{formError}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Please wait..." : isLogin ? "Login" : "Sign up"}</Button>
      <p className="text-center text-sm text-muted">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link to={isLogin ? "/register" : "/login"} className="font-semibold text-primary underline">{isLogin ? "Sign up" : "Login"}</Link>
      </p>
    </form>
  )
}
