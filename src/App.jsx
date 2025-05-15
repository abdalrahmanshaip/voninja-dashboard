import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Lessons from "./pages/Lessons";
import Challenges from "./pages/Challenges";
import Transactions from "./pages/Transactions";
import Coupons from "./pages/Coupons";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
              <Route index element={<Lessons />} />
              <Route path="lessons" element={<Lessons />} />
              {/* <Route path="challenges" element={<Challenges />} /> */}
              {/* <Route path="transactions" element={<Transactions />} /> */}
              {/* <Route path="coupons" element={<Coupons />} /> */}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
