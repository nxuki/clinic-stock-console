import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import StockPage from "./pages/StockPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <StockPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/items/:id"
        element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/products" replace />} />

      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}

export default App;
