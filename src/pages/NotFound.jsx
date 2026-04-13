import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-6">
      <div className="surface-panel w-full max-w-md px-8 py-10 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[var(--text-primary)]">404</h1>
        <p className="mb-4 text-xl text-[var(--text-secondary)]">Oops! Page not found</p>
        <a href="/" className="font-medium text-[var(--primary)] underline-offset-4 hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
