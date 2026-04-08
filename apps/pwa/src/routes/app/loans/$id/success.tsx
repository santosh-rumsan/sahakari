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
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">Application Submitted!</h1>
            <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
              Your loan application has been submitted successfully. You will be notified once it is reviewed.
            </p>
          </div>
        </div>

        {/* Loan summary card */}
        {loan && (
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-surface-container-low">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-headline">
                Reference Number
              </p>
              <p className="font-mono text-xl font-bold text-on-surface mt-1">{loan.referenceNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-surface-container-low">
              {[
                { label: "Amount", value: `NPR ${loan.loanAmount?.toLocaleString() ?? "—"}` },
                { label: "Purpose", value: loan.purpose?.replace("_", " ") ?? "—" },
                { label: "Duration", value: loan.duration?.replace(/_/g, " ") ?? "—" },
                { label: "Status", value: "Submitted", className: "text-secondary font-semibold" },
              ].map(({ label, value, className }) => (
                <div key={label} className="bg-surface-container-lowest px-5 py-4">
                  <span className="block text-xs text-on-surface-variant">{label}</span>
                  <span className={`mt-0.5 block text-sm font-medium text-on-surface ${className ?? ""}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/app/dashboard"
            className="w-full rounded-lg bg-primary py-3.5 text-center text-sm font-semibold text-on-primary transition active:scale-95 hover:bg-primary-dim"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/app/loans"
            className="w-full rounded-lg bg-surface-container-high py-3.5 text-center text-sm font-semibold text-on-surface transition active:scale-95 hover:bg-surface-container"
          >
            View My Loans
          </Link>
        </div>
      </div>
    </div>
  );
}
