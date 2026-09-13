import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { login } from "../api/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reason = searchParams.get("reason");
  const returnToFromUrl = searchParams.get("returnTo");

  const safeReturnTo =
    returnToFromUrl &&
    returnToFromUrl.startsWith("/") &&
    !returnToFromUrl.startsWith("//")
      ? returnToFromUrl
      : "/products";

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    const expiresAt = Number(sessionStorage.getItem("expiresAt") || "0");

    if (token && expiresAt && Date.now() < expiresAt) {
      navigate(safeReturnTo, {
        replace: true,
      });
    }
  }, [navigate, safeReturnTo]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(username, password);

      const expiresAt = Date.now() + 60 * 1000;

      sessionStorage.setItem("accessToken", user.accessToken);
      sessionStorage.setItem("refreshToken", user.refreshToken);
      sessionStorage.setItem("firstName", user.firstName);
      sessionStorage.setItem("expiresAt", String(expiresAt));

      navigate(safeReturnTo, {
        replace: true,
      });
    } catch {
      setError("Incorrect username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-header">
          <div className="logo">CS</div>

          <div>
            <h1>Clinic Stock Console</h1>
            <p>Stock Management System</p>
          </div>
        </div>

        <div className="login-intro">
          <h2>Welcome back</h2>

          <p>Sign in to view, search and manage clinic stock levels.</p>
        </div>

        {reason === "expired" && (
          <p className="message error-message" role="alert">
            Your session expired. Sign in again to continue where you left off.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="message error-message" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-help">Authorized clinic staff only</p>
      </section>
    </main>
  );
}

export default LoginPage;
