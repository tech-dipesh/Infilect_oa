import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter } from "react-router"
import "@/globals.css"
import App from "@/App"
import { AuthProvider } from "@/lib/auth"
import Auth from "@/pages/Auth"
import Errorpage from "@/pages/Errorpage"
import ProductDetails from "@/pages/ProductDetails"
import ProductForm from "@/pages/ProductForm"
import Products from "@/pages/Products"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Errorpage />,
    children: [
      { index: true, element: <Products /> },
      { path: "login", element: <Auth mode="login" /> },
      { path: "register", element: <Auth mode="register" /> },
      { path: "products/new", element: <ProductForm /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "products/:id/edit", element: <ProductForm /> },
    ],
  },
])

const root = document.getElementById("root")
if (root) createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
