import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getAllProducts, getCategories } from "../api/products";

const PAGE_SIZE = 12;

function StockPage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("q") || "";

  const category = searchParams.get("category") || "";

  const sort = searchParams.get("sort") || "title";

  const order = searchParams.get("order") === "desc" ? "desc" : "asc";

  const pageFromUrl = Number(searchParams.get("page") || "1");

  const requestedPage =
    Number.isInteger(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  const firstName = sessionStorage.getItem("firstName") || "User";

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["products"],

    queryFn: ({ signal }) => getAllProducts(signal),

    staleTime: 30_000,
  });

  const { data: categories = [], isError: categoriesError } = useQuery({
    queryKey: ["categories"],

    queryFn: ({ signal }) => getCategories(signal),

    staleTime: 5 * 60 * 1000,
  });

  const productsData = data?.products;

  const filteredProducts = useMemo(() => {
    let result = [...(productsData ?? [])];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) => {
        const searchableText = [
          product.title,
          product.description,
          product.category,
          product.brand || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      });
    }

    if (category) {
      result = result.filter((product) => product.category === category);
    }

    result.sort((a, b) => {
      const comparison =
        sort === "price"
          ? a.price - b.price
          : sort === "stock"
            ? a.stock - b.stock
            : a.title.localeCompare(b.title);

      return order === "desc" ? -comparison : comparison;
    });

    return result;
  }, [productsData, search, category, sort, order]);

  const totalProducts = filteredProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  useEffect(() => {
    if (requestedPage > totalPages) {
      const next = new URLSearchParams(searchParams);

      next.set("page", "1");

      setSearchParams(next, {
        replace: true,
      });
    }
  }, [requestedPage, totalPages, searchParams, setSearchParams]);

  const page = requestedPage > totalPages ? 1 : requestedPage;

  const startIndex = (page - 1) * PAGE_SIZE;

  const endIndex = startIndex + PAGE_SIZE;

  const visibleProducts = filteredProducts.slice(startIndex, endIndex);

  function updateSearch(value: string) {
    const next = new URLSearchParams(searchParams);

    if (value.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }

    next.set("page", "1");

    setSearchParams(next, {
      replace: true,
    });
  }

  function updateCategory(value: string) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set("category", value);
    } else {
      next.delete("category");
    }

    next.set("page", "1");

    setSearchParams(next);
  }

  function updateSort(value: string) {
    const next = new URLSearchParams(searchParams);

    switch (value) {
      case "price-asc":
        next.set("sort", "price");
        next.set("order", "asc");
        break;

      case "price-desc":
        next.set("sort", "price");
        next.set("order", "desc");
        break;

      case "stock-asc":
        next.set("sort", "stock");
        next.set("order", "asc");
        break;

      case "stock-desc":
        next.set("sort", "stock");
        next.set("order", "desc");
        break;

      default:
        next.set("sort", "title");
        next.set("order", "asc");
    }

    next.set("page", "1");

    setSearchParams(next);
  }

  function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    const next = new URLSearchParams(searchParams);

    next.set("page", String(newPage));

    setSearchParams(next);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function clearFilters() {
    setSearchParams({
      sort: "title",
      order: "asc",
      page: "1",
    });
  }

  function logout() {
    sessionStorage.removeItem("accessToken");

    sessionStorage.removeItem("refreshToken");

    sessionStorage.removeItem("firstName");

    sessionStorage.removeItem("expiresAt");

    navigate("/login");
  }

  let selectedSort = "title-asc";

  if (sort === "price" && order === "asc") {
    selectedSort = "price-asc";
  }

  if (sort === "price" && order === "desc") {
    selectedSort = "price-desc";
  }

  if (sort === "stock" && order === "asc") {
    selectedSort = "stock-asc";
  }

  if (sort === "stock" && order === "desc") {
    selectedSort = "stock-desc";
  }

  function renderPagination() {
    return (
      <nav className="pagination" aria-label="Stock pagination">
        <button
          type="button"
          className="pagination-button"
          disabled={page <= 1}
          onClick={() => changePage(page - 1)}
        >
          Previous
        </button>

        <span className="pagination-info">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <button
          type="button"
          className="pagination-button"
          disabled={page >= totalPages}
          onClick={() => changePage(page + 1)}
        >
          Next
        </button>
      </nav>
    );
  }

  if (isLoading) {
    return (
      <main className="status-page">
        <div className="loader" aria-hidden="true" />

        <h2>Loading stock...</h2>

        <p>Please wait while we retrieve the latest stock information.</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="status-page">
        <h2>Unable to load stock</h2>

        <p>We couldn't retrieve the stock information.</p>

        <button
          type="button"
          className="primary-button"
          onClick={() => refetch()}
        >
          Try again
        </button>
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
        <section className="dashboard-title">
          <div>
            <h2>Stock Inventory</h2>

            <p>Search, filter and manage clinic stock levels.</p>
          </div>

          <div className="stock-count">
            {totalProducts} {totalProducts === 1 ? "item" : "items"}
          </div>
        </section>

        <section className="controls" aria-label="Stock filters">
          <div className="control-group search-control">
            <label htmlFor="search">Search stock</label>

            <input
              id="search"
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
            />
          </div>

          <div className="control-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              value={category}
              onChange={(event) => updateCategory(event.target.value)}
            >
              <option value="">All categories</option>

              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            {categoriesError && (
              <small className="control-error">
                Categories are currently unavailable.
              </small>
            )}
          </div>

          <div className="control-group">
            <label htmlFor="sort">Sort</label>

            <select
              id="sort"
              value={selectedSort}
              onChange={(event) => updateSort(event.target.value)}
            >
              <option value="title-asc">Product name A-Z</option>

              <option value="price-asc">Price: Low to high</option>

              <option value="price-desc">Price: High to low</option>

              <option value="stock-asc">Stock: Low to high</option>

              <option value="stock-desc">Stock: High to low</option>
            </select>
          </div>
        </section>

        <div className="results-bar">
          <div>
            {isFetching && (
              <span className="updating-text">Updating stock...</span>
            )}

            {!isFetching && (search || category) && (
              <span className="updating-text">
                Showing {totalProducts} matching{" "}
                {totalProducts === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {(search || category || sort !== "title" || order !== "asc") && (
            <button
              type="button"
              className="clear-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {totalProducts > PAGE_SIZE && renderPagination()}

        {visibleProducts.length === 0 ? (
          <section className="empty-state">
            <h3>No stock found</h3>

            <p>No products matched your current search or filters.</p>

            <button
              type="button"
              className="primary-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </section>
        ) : (
          <section className="product-grid" aria-label="Stock items">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-container">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="product-image"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";

                      const fallback = event.currentTarget.nextElementSibling;

                      if (fallback instanceof HTMLElement) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />

                  <div className="image-fallback">
                    <span>CS</span>

                    <small>Image unavailable</small>
                  </div>
                </div>

                <div className="product-info">
                  <span className="category-badge">{product.category}</span>

                  <h3>{product.title}</h3>

                  <p className="product-description">{product.description}</p>

                  <div className="product-details">
                    <div>
                      <span className="detail-label">Price</span>

                      <strong>${product.price.toFixed(2)}</strong>
                    </div>

                    <div>
                      <span className="detail-label">Stock</span>

                      <strong>{product.stock}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-button"
                    onClick={() => navigate(`/items/${product.id}`)}
                  >
                    View details
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {totalProducts > PAGE_SIZE &&
          visibleProducts.length > 0 &&
          renderPagination()}
      </main>
    </div>
  );
}

export default StockPage;
