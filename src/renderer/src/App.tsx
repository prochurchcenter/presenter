import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Layout from "@renderer/components/Layout"
import { Home } from "@renderer/pages/Home"
import { Settings } from "@renderer/pages/Settings"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "settings",
        element: <Settings />
      }
    ]
  }
])

function App(): JSX.Element {
  return <RouterProvider router={router} />
}

export default App