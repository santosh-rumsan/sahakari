import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { createAuthApi } from "@rs/sdk";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const authApi = createAuthApi(import.meta.env["VITE_API_URL"] ?? "");

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const form = useForm({
    defaultValues: {
      phone: "",
      fullName: "",
      cooperative: "",
      passbookNumber: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setError("");
      try {
        const res = await authApi.register({
          phone: value.phone,
          fullName: value.fullName,
          cooperative: value.cooperative,
          passbookNumber: value.passbookNumber,
          password: value.password,
        });
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate({ to: "/dashboard" });
      } catch (err: any) {
        setError(err.message ?? "Registration failed");
      }
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          Create Account
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Register as a cooperative member
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="phone">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9779810223471"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="fullName">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Surpana Surkheti"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="cooperative">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cooperative Name
                </label>
                <input
                  type="text"
                  placeholder="Chandragiri Saving & Credit"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="passbookNumber">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Passbook Number
                </label>
                <input
                  type="text"
                  placeholder="PASS1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 chars: 1 capital, 1 digit, 1 special"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Register"}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
