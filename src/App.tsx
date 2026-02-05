import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts";
import { ProtectedRoute, GuestOnlyRoute } from "@/guards";
import { ToastContainer } from "@/components/molecules/ToastContainer";
import {
  HomePage,
  LoginPage,
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
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
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
          {/* Rutas por rol: envolver con <RequireRole allowedRoles={["admin"]} fallbackTo="/"> cuando agregues páginas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
