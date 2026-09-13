import type { Product, ProductsResponse } from "../types/product";

const API_URL = "https://dummyjson.com";

/*
  Load the complete product collection once.

  The stock list then performs search,
  category filtering, sorting and pagination
  locally.

  This makes combined filters predictable and
  avoids competing search requests.
*/
export async function getAllProducts(
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  const response = await fetch(`${API_URL}/products?limit=0`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to load stock.");
  }

  return response.json();
}

export async function getCategories(signal?: AbortSignal): Promise<
  {
    slug: string;
    name: string;
    url: string;
  }[]
> {
  const response = await fetch(`${API_URL}/products/categories`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to load categories.");
  }

  return response.json();
}

export async function getProduct(
  id: number,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to load product.");
  }

  return response.json();
}

export async function updateProductStock(
  id: number,
  stock: number,
): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      stock,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update stock.");
  }

  return response.json();
}
