import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import Boxes from '../pages/Boxes'
import Challenges from '../pages/Challenges'
import Coupons from '../pages/Coupons'
import Events from '../pages/Events'
import Lessons from '../pages/Lessons'
import Library from '../pages/Library'
import Login from '../pages/Login'
import Transactions from '../pages/Transactions'
import Users from '../pages/Users'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
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
          path='users'
          element={<Users />}
        />
        <Route
          path='events'
          element={<Events />}
        />
        <Route
          path='challenges'
          element={<Challenges />}
        />
        <Route
          path='lessons'
          element={<Lessons />}
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
          path='boxes'
          element={<Boxes />}
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
    </Route>
  )
)

export default router
