import { useState } from "react";
import Header from "./components/Header";
import ListOfCompanies from "./components/ListOfCompanies";
import Login from "./pages/Login";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Gateway from "./pages/Gateway";
import CompanyForm from "./pages/CompanyForm";
import LedgerCreation from "./pages/LedgerCreation";
import StockItemCreation from "./pages/StockItemCreation";
import UnitCreation from "./pages/UnitCreation";
import PurchaseVoucherCreation from "./pages/PurchaseVoucherCreation";
import StockSummary from "./pages/StockSummary";
import StockItemMonthlySummary from "./pages/StockItemMonthlySummary";
import ProfitAndLoss from "./pages/ProfitAndLoss";

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
        <Route
          path="/:companyId/gateway"
          element={
            <ProtectedRoute>
              <Gateway />
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies/create"
          element={
            <ProtectedRoute>
              <CompanyForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies/edit/:id"
          element={
            <ProtectedRoute>
              <CompanyForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/:companyId/ledger/create"
          element={
            <ProtectedRoute>
              <LedgerCreation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/:companyId/ledger/alter/:ledgerId"
          element={
            <ProtectedRoute>
              <LedgerCreation />
            </ProtectedRoute>
          }
        />

        {/* 1. STOCK ITEM CREATION ROUTE */}
        <Route 
          path="/:companyId/stock-item/create" 
          element={
            <ProtectedRoute>
              <StockItemCreation />
            </ProtectedRoute>
          } 
        />

        {/* 2. STOCK ITEM ALTERATION (EDIT) ROUTE */}
        <Route 
          path="/:companyId/stock-item/alter/:itemId" 
          element={
            <ProtectedRoute>
              <StockItemCreation />
            </ProtectedRoute>
          } 
        />

        {/* Unit Measure Master Routes */}
        <Route 
          path="/:companyId/unit/create" 
          element={
            <ProtectedRoute>
              <UnitCreation />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/:companyId/unit/alter/:unitId" 
          element={
            <ProtectedRoute>
              <UnitCreation />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/:companyId/voucher/purchase" 
          element={
            <ProtectedRoute>
              <PurchaseVoucherCreation />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/:companyId/stock-summary" 
          element={
            <ProtectedRoute>
              <StockSummary />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/:companyId/pnl" 
          element={
            <ProtectedRoute>
              <ProfitAndLoss />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/:companyId/stock-item-monthly-summary/:itemId" 
          element={
            <ProtectedRoute>
              <StockItemMonthlySummary />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
