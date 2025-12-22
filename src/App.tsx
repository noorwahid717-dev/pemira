import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TPSPanelProvider } from './hooks/useTPSPanelStore'
import { CandidateAdminProvider } from './hooks/useCandidateAdminStore'
import { TPSAdminProvider } from './hooks/useTPSAdminStore'
import { DPTAdminProvider } from './hooks/useDPTAdminStore'
import ProtectedRoute from './router/ProtectedRoute'
import AdminProtectedRoute from './router/AdminProtectedRoute'
import PublicOnlyRoute from './router/PublicOnlyRoute'
import { appRoutes, fallbackRoute } from './router/routes'
import { AdminAuthProvider } from './hooks/useAdminAuth'
import { ToastProvider } from './components/Toast'
import { PopupProvider } from './components/Popup'
import { ActiveElectionProvider } from './hooks/useActiveElection'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

const App = (): React.JSX.Element => (
  <PopupProvider>
    <ToastProvider>
      <AdminAuthProvider>
        <ActiveElectionProvider>
          <TPSPanelProvider>
            <CandidateAdminProvider>
              <TPSAdminProvider>
                <DPTAdminProvider>
                  <BrowserRouter>
                    <React.Suspense fallback={<LoadingScreen />}>
                      <Routes>
                        {appRoutes.map(({ id, path, Component, requiresAuth, requiresAdminAuth, publicOnly }) => {
                          let element: React.JSX.Element = <Component />
                          if (requiresAdminAuth) {
                            element = <AdminProtectedRoute component={Component} />
                          } else if (requiresAuth) {
                            element = <ProtectedRoute component={Component} />
                          } else if (publicOnly) {
                            element = <PublicOnlyRoute component={Component} />
                          }
                          return <Route key={id} path={path} element={element} />
                        })}
                        <Route path={fallbackRoute.path} element={<fallbackRoute.Component />} />
                      </Routes>
                    </React.Suspense>
                  </BrowserRouter>
                </DPTAdminProvider>
              </TPSAdminProvider>
            </CandidateAdminProvider>
          </TPSPanelProvider>
        </ActiveElectionProvider>
      </AdminAuthProvider>
    </ToastProvider>
  </PopupProvider>
)

export default App
