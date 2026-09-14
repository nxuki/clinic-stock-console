import { afterEach, describe, expect, it, vi } from "vitest";

import { login } from "./auth";

describe("login API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs in using a one minute token expiry", async () => {
    const mockUser = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      id: 1,
      username: "emilys",
      firstName: "Emily",
      lastName: "Johnson",
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockUser), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await login("emilys", "emilyspass");

    expect(fetchSpy).toHaveBeenCalledWith("https://dummyjson.com/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: "emilys",
        password: "emilyspass",
        expiresInMins: 1,
      }),
    });

    expect(result.accessToken).toBe("access-token");

    expect(result.firstName).toBe("Emily");
  });

  it("throws an error for failed login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 401,
      }),
    );

    await expect(login("wrong-user", "wrong-password")).rejects.toThrow(
      "Invalid username or password.",
    );
  });
});
