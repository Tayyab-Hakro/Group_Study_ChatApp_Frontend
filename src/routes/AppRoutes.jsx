import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { useAuthStore } from "../store/authStore";

export const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          !isLoading && isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          !isLoading && isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        }
      />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
