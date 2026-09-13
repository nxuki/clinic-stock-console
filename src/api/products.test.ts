import { afterEach, describe, expect, it, vi } from "vitest";

import { updateProductStock } from "./products";

describe("updateProductStock", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
