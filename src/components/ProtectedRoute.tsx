import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

type SessionStatus = "checking" | "valid" | "missing" | "expired";

function clearSession() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("firstName");
  sessionStorage.removeItem("expiresAt");
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("checking");

  const accessToken = sessionStorage.getItem("accessToken");

  const expiresAt = Number(sessionStorage.getItem("expiresAt") || "0");

  const currentLocation = location.pathname + location.search;

  useEffect(() => {
    let expiryTimer: number | undefined;

    const validationTimer = window.setTimeout(() => {
      if (!accessToken) {
        setSessionStatus("missing");
        return;
      }

      if (!expiresAt) {
        clearSession();
        setSessionStatus("expired");
        return;
      }

      const remainingTime = expiresAt - Date.now();

      if (remainingTime <= 0) {
        clearSession();
        setSessionStatus("expired");
        return;
      }

      setSessionStatus("valid");

      expiryTimer = window.setTimeout(() => {
        clearSession();
        setSessionStatus("expired");
      }, remainingTime);
    }, 0);

    return () => {
      window.clearTimeout(validationTimer);

      if (expiryTimer !== undefined) {
        window.clearTimeout(expiryTimer);
      }
    };
  }, [accessToken, expiresAt]);

  if (sessionStatus === "checking") {
    return (
      <main className="status-page">
        <div className="loader" aria-hidden="true" />

        <h2>Checking session...</h2>
      </main>
    );
  }

  if (sessionStatus === "missing") {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(currentLocation)}`}
        replace
      />
    );
  }

  if (sessionStatus === "expired") {
    return (
      <Navigate
        to={`/login?reason=expired&returnTo=${encodeURIComponent(
          currentLocation,
        )}`}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
