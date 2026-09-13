import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProduct, updateProductStock } from "../api/products";

import type { ProductsResponse } from "../types/product";

function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const productId = Number(id);

  const [stockValue, setStockValue] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product", productId],

    queryFn: ({ signal }) => getProduct(productId, signal),

    enabled: Number.isFinite(productId) && productId > 0,
  });

  const stockMutation = useMutation({
    mutationFn: (newStock: number) => updateProductStock(productId, newStock),

    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(["product", productId], updatedProduct);

      queryClient.setQueryData<ProductsResponse>(
        ["products"],
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,

            products: currentData.products.map((item) =>
              item.id === updatedProduct.id
                ? {
                    ...item,
                    stock: updatedProduct.stock,
                  }
                : item,
            ),
          };
        },
      );

      setSuccessMessage(`Stock updated to ${updatedProduct.stock}.`);

      setStockValue("");
    },
  });

  function handleStockUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");

    const newStock = Number(stockValue);

    if (
      stockValue.trim() === "" ||
      !Number.isInteger(newStock) ||
      newStock < 0
    ) {
      return;
    }

    stockMutation.mutate(newStock);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopyMessage("Link copied");

      window.setTimeout(() => {
        setCopyMessage("");
      }, 2000);
    } catch {
      setCopyMessage("Unable to copy link");
    }
  }

  function logout() {
    sessionStorage.removeItem("accessToken");

    sessionStorage.removeItem("refreshToken");

    sessionStorage.removeItem("firstName");

    sessionStorage.removeItem("expiresAt");

    navigate("/login");
  }

  const firstName = sessionStorage.getItem("firstName") || "User";

  if (!Number.isFinite(productId) || productId <= 0) {
    return (
      <main className="status-page">
        <h2>Invalid item</h2>

        <p>The item link is not valid.</p>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/products")}
        >
          Back to inventory
        </button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="status-page">
        <div className="loader" aria-hidden="true" />

        <h2>Loading item...</h2>

        <p>Please wait while we load the stock information.</p>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="status-page">
        <h2>Unable to load item</h2>

        <p>We couldn't retrieve this stock item.</p>

        <div className="status-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => refetch()}
          >
            Try again
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/products")}
          >
            Back to inventory
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <div className="small-logo">CS</div>

          <div>
            <h1>Clinic Stock Console</h1>

            <p>Stock Management System</p>
          </div>
        </div>

        <div className="user-area">
          <span>Welcome, {firstName}</span>

          <button type="button" className="logout-button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="detail-toolbar">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="copy-link-area">
            <button type="button" className="copy-button" onClick={copyLink}>
              Copy item link
            </button>

            {copyMessage && (
              <span className="copy-message" role="status">
                {copyMessage}
              </span>
            )}
          </div>
        </section>

        <section className="product-detail-card">
          <div className="detail-image-section">
            <img
              src={product.images?.[0] || product.thumbnail}
              alt={product.title}
              className="detail-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";

                const fallback = event.currentTarget.nextElementSibling;

                if (fallback instanceof HTMLElement) {
                  fallback.style.display = "flex";
                }
              }}
            />

            <div className="detail-image-fallback">
              <span>CS</span>

              <small>Image unavailable</small>
            </div>
          </div>

          <div className="detail-content">
            <span className="category-badge">{product.category}</span>

            <h2>{product.title}</h2>

            <p className="detail-description">{product.description}</p>

            <div className="detail-grid">
              <div className="detail-box">
                <span className="detail-label">Price</span>

                <strong>${product.price.toFixed(2)}</strong>
              </div>

              <div className="detail-box">
                <span className="detail-label">Current stock</span>

                <strong>{product.stock}</strong>
              </div>

              {product.brand && (
                <div className="detail-box">
                  <span className="detail-label">Brand</span>

                  <strong>{product.brand}</strong>
                </div>
              )}

              {product.weight !== undefined && (
                <div className="detail-box">
                  <span className="detail-label">Weight</span>

                  <strong>{product.weight}</strong>
                </div>
              )}

              {product.rating !== undefined && (
                <div className="detail-box">
                  <span className="detail-label">Rating</span>

                  <strong>{product.rating}</strong>
                </div>
              )}

              <div className="detail-box">
                <span className="detail-label">Item ID</span>

                <strong>#{product.id}</strong>
              </div>
            </div>

            <section className="stock-correction">
              <div>
                <h3>Correct stock</h3>

                <p>
                  Update the stock quantity if the recorded amount is incorrect.
                </p>
              </div>

              <form className="stock-form" onSubmit={handleStockUpdate}>
                <div className="stock-input-group">
                  <label htmlFor="stock">New stock quantity</label>

                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={stockValue}
                    onChange={(event) => setStockValue(event.target.value)}
                    placeholder={String(product.stock)}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={stockMutation.isPending}
                >
                  {stockMutation.isPending ? "Updating..." : "Update stock"}
                </button>
              </form>

              {successMessage && (
                <p className="success-message" role="status">
                  {successMessage}
                </p>
              )}

              {stockMutation.isError && (
                <p className="error-message" role="alert">
                  Unable to update stock. Please try again.
                </p>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetailPage;
