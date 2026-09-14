import { afterEach, describe, expect, it, vi } from "vitest";

import { getAllProducts, getProduct, updateProductStock } from "./products";

describe("products API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the product inventory", async () => {
    const mockResponse = {
      products: [
        {
          id: 1,
          title: "Test Product",
          description: "Test description",
          category: "test-category",
          price: 20,
          stock: 10,
          thumbnail: "image.jpg",
          images: ["image.jpg"],
        },
      ],
      total: 1,
      skip: 0,
      limit: 1,
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await getAllProducts();

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://dummyjson.com/products?limit=0",
      {
        signal: undefined,
      },
    );

    expect(result.products).toHaveLength(1);

    expect(result.products[0].title).toBe("Test Product");
  });

  it("throws when inventory loading fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    );

    await expect(getAllProducts()).rejects.toThrow("Unable to load stock.");
  });

  it("loads a single product", async () => {
    const mockProduct = {
      id: 99,
      title: "Amazon Echo Plus",
      description: "Test product",
      category: "mobile-accessories",
      price: 99.99,
      stock: 61,
      thumbnail: "image.jpg",
      images: ["image.jpg"],
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockProduct), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await getProduct(99);

    expect(fetchSpy).toHaveBeenCalledWith("https://dummyjson.com/products/99", {
      signal: undefined,
    });

    expect(result.id).toBe(99);

    expect(result.title).toBe("Amazon Echo Plus");
  });

  it("sends the corrected stock value using PUT", async () => {
    const mockProduct = {
      id: 99,
      title: "Amazon Echo Plus",
      description: "Test product",
      category: "mobile-accessories",
      price: 99.99,
      stock: 25,
      thumbnail: "image.jpg",
      images: ["image.jpg"],
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockProduct), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await updateProductStock(99, 25);

    expect(fetchSpy).toHaveBeenCalledWith("https://dummyjson.com/products/99", {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        stock: 25,
      }),
    });

    expect(result.stock).toBe(25);
  });

  it("throws an error when the stock update fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    );

    await expect(updateProductStock(99, 25)).rejects.toThrow(
      "Unable to update stock.",
    );
  });
});
