import { Route, Routes, HashRouter } from 'react-router-dom'
import Layout from "@renderer/components/Layout"
import { Home } from "@renderer/pages/Home"
import { Settings } from "@renderer/pages/Settings"
import { Presenter } from "@renderer/pages/Presenter"
import { Collection } from "@renderer/pages/Collection"
import { Setlist } from "@renderer/pages/Setlist"
import { ErrorBoundary } from '@renderer/components/error-boundary'
import { Toaster } from '@renderer/components/ui/toaster'

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
            <Route path="collection" element={<Collection />} />
            <Route path="setlist" element={<Setlist />} />
          </Route>
        )}
      </Routes>
      <Toaster />
    </HashRouter>
  )
}

export default App