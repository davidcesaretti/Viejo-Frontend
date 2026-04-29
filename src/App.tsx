import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts";
import { ProtectedRoute, GuestOnlyRoute, RequireRole } from "@/guards";
import { ToastContainer } from "@/components/molecules/ToastContainer";
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProductsListPage,
  ProductFormPage,
  StockListPage,
  StockFormPage,
  ClientsListPage,
  ClientFormPage,
  ClientAccountPage,
  SalesListPage,
  CreateSalePage,
  SaleDetailPage,
  UsersListPage,
  UserFormPage,
  CashboxPage,
  ProfilePage,
} from "@/pages";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestOnlyRoute>
                <ForgotPasswordPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestOnlyRoute>
                <ResetPasswordPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/caja" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <ProductsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos/nuevo"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos/:id/editar"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <StockListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/nuevo"
            element={
              <ProtectedRoute>
                <StockFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/:id/editar"
            element={
              <ProtectedRoute>
                <StockFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <ClientsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes/nuevo"
            element={
              <ProtectedRoute>
                <ClientFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes/:id/editar"
            element={
              <ProtectedRoute>
                <ClientFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes/:id/cuenta"
            element={
              <ProtectedRoute>
                <ClientAccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas"
            element={
              <ProtectedRoute>
                <SalesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas/nueva"
            element={
              <ProtectedRoute>
                <CreateSalePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas/:id"
            element={
              <ProtectedRoute>
                <SaleDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caja"
            element={
              <ProtectedRoute>
                <CashboxPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Gestión de usuarios — solo administradores */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={["administrador"]}>
                  <UsersListPage />
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios/nuevo"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={["administrador"]}>
                  <UserFormPage />
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios/:id/editar"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={["administrador"]}>
                  <UserFormPage />
                </RequireRole>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
