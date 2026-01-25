import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import LoginUser from "./components/auth/LoginUser";
import LoginAdmin from "./components/auth/LoginAdmin";
import RegisterUser from "./components/auth/RegisterUser";
import RegisterAdmin from "./components/auth/RegisterAdmin";

import ProtectedRoute from "./components/common/ProtectedRoute";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LaboratoriesList from "./components/admin/LaboratoriesList";

export default function App() {
  return (
    <Routes>
      {/* 🔓 PÚBLICO */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginUser />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/register" element={<RegisterUser />} />

      {/* 👤 USUARIO */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* 👮 ADMIN */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/register-admin"
        element={
          <ProtectedRoute adminOnly>
            <RegisterAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/laboratories"
        element={
          <ProtectedRoute adminOnly>
            <LaboratoriesList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}