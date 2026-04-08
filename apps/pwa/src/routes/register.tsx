import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { createAuthApi } from "@rs/sdk";

import { setStorageItem } from "../lib/storage";

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
        setStorageItem("token", res.accessToken);
        setStorageItem("user", JSON.stringify(res.user));
        navigate({ to: "/app/dashboard" });
      } catch (err: any) {
        setError(err.message ?? "Registration failed");
      }
    },
  });

  const inputClass =
    "w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50";

  return (
    <div className="flex min-h-screen flex-col bg-surface pb-10">
      {/* Top decorative gradient */}
      <div className="h-36 bg-linear-to-br from-primary to-primary-dim" />

      <div className="flex flex-1 flex-col px-6 -mt-10">
        <div className="rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_rgba(0,0,0,0.08)] p-7 space-y-6">
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">Create Account</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Register as a cooperative member</p>
          </div>

          {error && (
            <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
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
                  <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">Phone Number</label>
                  <input type="tel" placeholder="9779810223471" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                </div>
              )}
            </form.Field>

            <form.Field name="fullName">
              {(field) => (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">Full Name</label>
                  <input type="text" placeholder="Surpana Surkheti" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                </div>
              )}
            </form.Field>

            <form.Field name="cooperative">
              {(field) => (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">Cooperative Name</label>
                  <input type="text" placeholder="Chandragiri Saving & Credit" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                </div>
              )}
            </form.Field>

            <form.Field name="passbookNumber">
              {(field) => (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">Passbook Number</label>
                  <input type="text" placeholder="PASS1" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">Password</label>
                  <input type="password" placeholder="Min 8 chars: 1 capital, 1 digit, 1 special" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                </div>
              )}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">Confirm Password</label>
                  <input type="password" placeholder="Repeat password" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-on-primary transition active:scale-95 hover:bg-primary-dim disabled:opacity-50"
                >
                  {isSubmitting ? "Creating account..." : "Register"}
                </button>
              )}
            </form.Subscribe>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
