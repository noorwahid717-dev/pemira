import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './router/ProtectedRoute'
import PublicOnlyRoute from './router/PublicOnlyRoute'
import { appRoutes, fallbackRoute } from './router/routes'
import './App.css'

const App = (): JSX.Element => (
  <BrowserRouter>
    <Routes>
      {appRoutes.map(({ id, path, Component, requiresAuth, publicOnly }) => {
        let element: JSX.Element = <Component />
        if (requiresAuth) {
          element = <ProtectedRoute component={Component} />
        } else if (publicOnly) {
          element = <PublicOnlyRoute component={Component} />
        }
        return <Route key={id} path={path} element={element} />
      })}
      <Route path={fallbackRoute.path} element={<fallbackRoute.Component />} />
    </Routes>
  </BrowserRouter>
)

export default App
