import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

import { createKycApi, createLoanApi } from "@rs/sdk";

import { AppHeader } from "../../components/app-header";
import TooltipWrapper from "../../components/tooltip-wrapper";
import { getToken } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/loans")({
  component: LoansRouteWrapper,
});

function LoansRouteWrapper() {
  const { location } = useRouterState();

  if (location.pathname !== "/app/loans") {
    return <Outlet />;
  }

  return <LoansPage />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string }> = {
    APPROVED: {
      className: "bg-primary-container text-on-primary-container",
      label: "Approved",
    },
    ACTIVE: {
      className: "bg-green-100 text-green-700",
      label: "Active",
    },
    COMPLETED: {
      className: "bg-surface-container-high text-on-surface-variant",
      label: "Completed",
    },
    OVERDUE: {
      className: "bg-red-100 text-red-700",
      label: "Overdue",
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
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function LoansPage() {
  const token = getToken();
  const loanApi = createLoanApi(apiUrl);
  const kycApi = createKycApi(apiUrl);

  const { data: loans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanApi.listMine(token),
  });

  const { data: kyc } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  const kycApproved = kyc?.status === "APPROVED";

  // Only loans still in application/review stages should block a new request.
  const pendingStatuses = new Set([
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "PENDING",
  ]);
  const hasPendingLoans =
    loans?.some((loan) => pendingStatuses.has(loan.status)) ?? false;

  const canApplyForLoan = kycApproved && !hasPendingLoans;

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <AppHeader
        title="My Loans"
        right={
          <TooltipWrapper
            tip={
              !kycApproved
                ? "Your KYC must be approved before you can apply for a loan"
                : hasPendingLoans
                  ? "You have a pending loan. Complete or wait for approval before applying for a new loan."
                  : "Apply for a new loan"
            }
            disable={canApplyForLoan}
          >
            {canApplyForLoan ? (
              <Link
                to="/app/loans/new"
                className="bg-primary text-on-primary hover:bg-primary-dim rounded-lg px-5 py-2 text-sm font-semibold transition active:scale-95"
              >
                + New
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="bg-surface-container-high text-on-surface-variant cursor-not-allowed rounded-lg px-5 py-2 text-sm font-semibold"
              >
                + New
              </button>
            )}
          </TooltipWrapper>
        }
      />

      <div className="space-y-4 px-6 pt-2">
        {!loans || loans.length === 0 ? (
          <div className="bg-surface-container-low mt-8 rounded-xl p-10 text-center">
            <div className="bg-surface-container mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-on-surface text-sm font-semibold">
              No loan applications yet
            </p>
            <p className="text-on-surface-variant mt-1 text-xs">
              Apply for your first loan to get started.
            </p>
            <TooltipWrapper
              tip={
                !kycApproved
                  ? "Your KYC must be approved before you can apply for a loan"
                  : hasPendingLoans
                    ? "You have a pending loan. Complete or wait for approval before applying for a new loan."
                    : "Start your loan application"
              }
              disable={canApplyForLoan}
            >
              {canApplyForLoan ? (
                <Link
                  to="/app/loans/new"
                  className="bg-primary text-on-primary hover:bg-primary-dim mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold transition active:scale-95"
                >
                  Apply for Loan
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="bg-surface-container-high text-on-surface-variant mt-5 cursor-not-allowed rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  Apply for Loan
                </button>
              )}
            </TooltipWrapper>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <Link
                key={loan.id}
                to="/app/loans/$id"
                params={{ id: loan.id }}
                className="bg-surface-container-lowest hover:bg-surface-container-low block rounded-xl p-5 shadow-sm transition active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-on-surface font-headline text-sm font-semibold">
                      Ref: {loan.referenceNumber}
                    </p>
                    <p className="text-on-surface-variant mt-0.5 text-xs">
                      {loan.loanAmount
                        ? `NPR ${loan.loanAmount.toLocaleString()}`
                        : "Amount not set"}{" "}
                      · {loan.purpose?.replace("_", " ") ?? "—"}
                    </p>
                    <p className="text-on-surface-variant mt-0.5 text-xs">
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
