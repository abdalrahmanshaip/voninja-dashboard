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

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <ChallengeProvider>
            <TransactionsProvider>
              <CouponProvider>
                <UserProvider>
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
                </UserProvider>
              </CouponProvider>
            </TransactionsProvider>
          </ChallengeProvider>
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
