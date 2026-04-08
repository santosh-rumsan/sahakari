import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { createLoanApi } from "@rs/sdk";

import { getToken } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/loans")({
  component: LoansPage,
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string }> = {
    APPROVED: {
      className: "bg-primary-container text-on-primary-container",
      label: "Approved",
    },
    REJECTED: {
      className: "bg-error-container text-on-error",
      label: "Rejected",
    },
    SUBMITTED: {
      className: "bg-secondary-container text-on-secondary-container",
      label: "Submitted",
    },
    UNDER_REVIEW: {
      className: "bg-tertiary-container text-on-tertiary-container",
      label: "Under Review",
    },
    DRAFT: {
      className: "bg-surface-container-high text-on-surface-variant",
      label: "Draft",
    },
  };
  const cfg = map[status] ?? map["DRAFT"];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function LoansPage() {
  const token = getToken();
  const loanApi = createLoanApi(apiUrl);
  const { data: loans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanApi.listMine(token),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-surface/80 backdrop-blur-xl">
        <h1 className="font-headline text-xl font-bold text-on-surface">My Loans</h1>
        <Link
          to="/app/loans/new"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition active:scale-95 hover:bg-primary-dim"
        >
          + New
        </Link>
      </header>

      <div className="px-6 pt-2 space-y-4">
        {!loans || loans.length === 0 ? (
          <div className="mt-8 rounded-xl bg-surface-container-low p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">No loan applications yet</p>
            <p className="mt-1 text-xs text-on-surface-variant">Apply for your first loan to get started.</p>
            <Link
              to="/app/loans/new"
              className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-dim transition active:scale-95"
            >
              Apply for Loan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <Link
                key={loan.id}
                to={`/app/loans/${loan.id}`}
                className="block rounded-xl bg-surface-container-lowest p-5 shadow-sm transition hover:bg-surface-container-low active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface font-headline">
                      Ref: {loan.referenceNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {loan.loanAmount
                        ? `NPR ${loan.loanAmount.toLocaleString()}`
                        : "Amount not set"}{" "}
                      · {loan.purpose?.replace("_", " ") ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {loan.duration?.replace(/_/g, " ") ?? "—"} ·{" "}
                      {loan.collateralType === "WITH"
                        ? "With Collateral"
                        : "Without Collateral"}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
