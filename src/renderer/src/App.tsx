import { Route, Routes, HashRouter } from 'react-router-dom'
import Layout from "@renderer/components/Layout"
import { Home } from "@renderer/pages/Home"
import { Settings } from "@renderer/pages/Settings"
import { Presenter } from "@renderer/pages/Presenter"
import { ErrorBoundary } from '@renderer/components/error-boundary'

// const router = createHashRouter([
//   {
//     path: "/",
//     element: <Layout />,
//     errorElement: <ErrorBoundary />,
//     children: [
//       {
//         index: true,
//         element: <Home />
//       },
//       {
//         path: "/presenter",
//         element: <Presenter />
//       },

//     ]
//   }
// ])

function App(): JSX.Element {
  const isPresenter = window.location.hash.includes('presenter')

  return (
    <HashRouter>
      <Routes>
        {isPresenter ? (
          <Route path="/presenter" element={<Presenter />} />
        ) : (
          <Route path="/" element={<Layout />} errorElement={<ErrorBoundary />}>
            <Route index element={<Home />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  )
}

export default App