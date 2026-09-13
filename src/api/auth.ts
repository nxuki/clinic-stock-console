const API_URL = "https://dummyjson.com";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      expiresInMins: 1,
    }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password.");
  }

  return response.json();
}
