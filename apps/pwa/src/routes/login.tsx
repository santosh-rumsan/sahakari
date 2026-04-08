import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { createAuthApi } from "@rs/sdk";

import { setStorageItem } from "../lib/storage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const authApi = createAuthApi(import.meta.env["VITE_API_URL"] ?? "");

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await authApi.login({ phone, password });
      setStorageItem("token", res.accessToken);
      setStorageItem("user", JSON.stringify(res.user));
      navigate({ to: "/app/dashboard" });
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top decorative gradient */}
      <div className="h-48 bg-linear-to-br from-primary to-primary-dim" />

      <div className="flex flex-1 flex-col px-6 -mt-10">
        {/* Card */}
        <div className="rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_rgba(0,0,0,0.08)] p-7 space-y-6">
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">Welcome back</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Sign in to your Sahakari account</p>
          </div>

          {error && (
            <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="9779810223471"
                className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-on-primary transition active:scale-95 hover:bg-primary-dim disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>

        {/* Brand footer */}
        <div className="mt-8 text-center">
          <p className="font-headline text-lg font-bold text-primary">Sahakari</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Cooperative Finance Platform</p>
        </div>
      </div>
    </div>
  );
}
