import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Lessons from './pages/Lessons'
import Challenges from './pages/Challenges'
import Transactions from './pages/Transactions'
import Coupons from './pages/Coupons'
import DashboardLayout from './layouts/DashboardLayout'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { CouponProvider } from './context/CouponContext'
import { ChallengeProvider } from './context/ChallengeContext'
import { TransactionsProvider } from './context/TransationContext'
import { UserProvider } from './context/UserContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Users from './pages/Users'
import { LibraryProvider } from './context/LibraryContext'
import { EventProvider } from './context/EventContext'
import Library from './pages/Library'
import Events from './pages/Events'

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <UserProvider>
          {/* <DataProvider>
            <ChallengeProvider>
              <TransactionsProvider>
                <CouponProvider>
                <LibraryProvider>
                
                  */}

          <EventProvider>
            <Routes>
              <Route
                path='/login'
                element={<Login />}
              />
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Lessons />}
                />
                <Route
                  path='lessons'
                  element={<Lessons />}
                />
                <Route
                  path='events'
                  element={<Events />}
                />
                <Route
                  path='users'
                  element={<Users />}
                />
                <Route
                  path='challenges'
                  element={<Challenges />}
                />
                <Route
                  path='transactions'
                  element={<Transactions />}
                />
                <Route
                  path='coupons'
                  element={<Coupons />}
                />
                <Route
                  path='library'
                  element={<Library />}
                />
              </Route>
              <Route
                path='*'
                element={
                  <Navigate
                    to='/'
                    replace
                  />
                }
              />
            </Routes>
          </EventProvider>

          {/*
          </LibraryProvider>
                </CouponProvider>
              </TransactionsProvider>
            </ChallengeProvider>
          </DataProvider> 
          */}
        </UserProvider>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
