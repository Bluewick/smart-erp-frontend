import { useState } from "react";
import Header from "./components/Header";
import ListOfCompanies from "./components/ListOfCompanies";
import Login from "./pages/Login";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("authToken");

  return token ? <Navigate to="/companies" replace /> : children;
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <ListOfCompanies />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
