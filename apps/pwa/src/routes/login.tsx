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
    <div className="bg-surface flex min-h-screen flex-col">
      {/* Top decorative gradient */}
      <div className="from-primary to-primary-dim h-48 bg-linear-to-br" />

      <div className="-mt-10 flex flex-1 flex-col px-6">
        {/* Card */}
        <div className="bg-surface-container-lowest space-y-6 rounded-xl p-7 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
          <div>
            <h1 className="font-headline text-on-surface text-2xl font-bold">
              Welcome back
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Sign in to your Sahakari account
            </p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="9779810223471"
                className="bg-surface-container-low text-on-surface ring-outline-variant/50 focus:ring-primary/40 placeholder:text-on-surface-variant/50 w-full rounded-xl px-4 py-3 text-sm ring-1 transition outline-none focus:ring-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="bg-surface-container-low text-on-surface ring-outline-variant/50 focus:ring-primary/40 placeholder:text-on-surface-variant/50 w-full rounded-xl px-4 py-3 text-sm ring-1 transition outline-none focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-on-primary hover:bg-primary-dim w-full rounded-lg py-3.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-on-surface-variant text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Brand footer */}
        <div className="mt-8 text-center">
          <p className="font-headline text-primary text-lg font-bold">
            Sahakari
          </p>
          <p className="text-on-surface-variant mt-0.5 text-xs">
            Cooperative Finance Platform
          </p>
        </div>
      </div>
    </div>
  );
}
