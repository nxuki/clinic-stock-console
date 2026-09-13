import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProduct, updateProductStock } from "../api/products";

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

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

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

    navigate("/login");
  }

  if (!Number.isFinite(productId) || productId <= 0) {
    return (
      <main className="status-page">
        <h2>Invalid stock item</h2>

        <p>The requested stock item could not be identified.</p>

        <button
          className="primary-button"
          type="button"
          onClick={() => navigate("/products")}
        >
          Return to inventory
        </button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="status-page">
        <div className="loader" aria-hidden="true"></div>

        <h2>Loading item...</h2>

        <p>Please wait while we retrieve the stock item.</p>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="status-page">
        <h2>Unable to load item</h2>

        <p>We couldn't retrieve this stock item.</p>

        <div className="error-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => refetch()}
          >
            Try again
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() => navigate("/products")}
          >
            Return to inventory
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
          <span>Welcome, {sessionStorage.getItem("firstName") || "User"}</span>

          <button type="button" className="logout-button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="detail-page">
        <div className="detail-toolbar">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back to inventory
          </button>

          <div className="copy-area">
            <button type="button" className="copy-button" onClick={copyLink}>
              Copy item link
            </button>

            {copyMessage && (
              <span className="copy-message" role="status">
                {copyMessage}
              </span>
            )}
          </div>
        </div>

        <section className="detail-card">
          <div className="detail-image-section">
            <img
              src={product.thumbnail}
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
              <div>CS</div>
              <p>Image unavailable</p>
            </div>
          </div>

          <div className="detail-information">
            <span className="category-badge">{product.category}</span>

            <h2>{product.title}</h2>

            <p className="detail-description">{product.description}</p>

            <div className="information-grid">
              <div className="information-item">
                <span>Price</span>

                <strong>${product.price.toFixed(2)}</strong>
              </div>

              <div className="information-item">
                <span>Current stock</span>

                <strong>{product.stock}</strong>
              </div>

              {product.brand && (
                <div className="information-item">
                  <span>Brand</span>

                  <strong>{product.brand}</strong>
                </div>
              )}

              {product.weight !== undefined && (
                <div className="information-item">
                  <span>Weight</span>

                  <strong>{product.weight}</strong>
                </div>
              )}

              {product.rating !== undefined && (
                <div className="information-item">
                  <span>Rating</span>

                  <strong>{product.rating}</strong>
                </div>
              )}

              <div className="information-item">
                <span>Item ID</span>

                <strong>#{product.id}</strong>
              </div>
            </div>

            <section className="stock-correction">
              <div className="stock-correction-heading">
                <h3>Correct stock level</h3>

                <p>Enter the corrected quantity for this item.</p>
              </div>

              <form className="stock-form" onSubmit={handleStockUpdate}>
                <div className="stock-input-group">
                  <label htmlFor="stock">New stock quantity</label>

                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stockValue}
                    onChange={(event) => setStockValue(event.target.value)}
                    placeholder={String(product.stock)}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button update-stock-button"
                  disabled={stockMutation.isPending || stockValue.trim() === ""}
                >
                  {stockMutation.isPending ? "Updating..." : "Update stock"}
                </button>
              </form>

              {stockMutation.isError && (
                <p className="stock-error" role="alert">
                  Stock could not be updated. Please try again.
                </p>
              )}

              {successMessage && (
                <p className="stock-success" role="status">
                  {successMessage}
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
