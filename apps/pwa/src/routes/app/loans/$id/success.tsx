import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { getToken } from "../../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/loans/$id/success")({
  component: LoanSuccessPage,
});

function LoanSuccessPage() {
  const { id } = Route.useParams();
  const token = getToken();

  const { data: loan } = useQuery({
    queryKey: ["loan", id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Success icon */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary-container flex h-20 w-20 items-center justify-center rounded-full">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-on-surface text-2xl font-bold">
              Application Submitted!
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
              Your loan application has been submitted successfully. You will be
              notified once it is reviewed.
            </p>
          </div>
        </div>

        {/* Loan summary card */}
        {loan && (
          <div className="bg-surface-container-lowest overflow-hidden rounded-xl shadow-sm">
            <div className="bg-surface-container-low px-5 py-4">
              <p className="text-on-surface-variant font-headline text-xs font-semibold tracking-widest uppercase">
                Reference Number
              </p>
              <p className="text-on-surface mt-1 font-mono text-xl font-bold">
                {loan.referenceNumber}
              </p>
            </div>
            <div className="bg-surface-container-low grid grid-cols-2 gap-px">
              {[
                {
                  label: "Amount",
                  value: `NPR ${loan.loanAmount?.toLocaleString() ?? "—"}`,
                },
                {
                  label: "Purpose",
                  value: loan.purpose?.replace("_", " ") ?? "—",
                },
                {
                  label: "Duration",
                  value: loan.duration?.replace(/_/g, " ") ?? "—",
                },
                {
                  label: "Status",
                  value: "Submitted",
                  className: "text-secondary font-semibold",
                },
              ].map(({ label, value, className }) => (
                <div
                  key={label}
                  className="bg-surface-container-lowest px-5 py-4"
                >
                  <span className="text-on-surface-variant block text-xs">
                    {label}
                  </span>
                  <span
                    className={`text-on-surface mt-0.5 block text-sm font-medium ${className ?? ""}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/app/dashboard"
            className="bg-primary text-on-primary hover:bg-primary-dim w-full rounded-lg py-3.5 text-center text-sm font-semibold transition active:scale-95"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/app/loans"
            className="bg-surface-container-high text-on-surface hover:bg-surface-container w-full rounded-lg py-3.5 text-center text-sm font-semibold transition active:scale-95"
          >
            View My Loans
          </Link>
        </div>
      </div>
    </div>
  );
}
