import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";

import { createLoanApi } from "@rs/sdk";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/loans")({
  component: LoansPage,
});

function getToken() {
  return localStorage.getItem("token") ?? "";
}

function LoansPage() {
  const token = getToken();
  const loanApi = createLoanApi(apiUrl);
  const { data: loans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanApi.listMine(token),
  });

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { className: string; label: string }> = {
      APPROVED: { className: "bg-green-50 text-green-700", label: "Approved" },
      REJECTED: { className: "bg-red-50 text-red-700", label: "Rejected" },
      SUBMITTED: { className: "bg-blue-50 text-blue-700", label: "Submitted" },
      UNDER_REVIEW: {
        className: "bg-orange-50 text-orange-700",
        label: "Under Review",
      },
      DRAFT: { className: "bg-gray-50 text-gray-600", label: "Draft" },
    };
    const cfg = map[status] ?? map["DRAFT"];
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
      >
        {cfg.label}
      </span>
    );
  }

  if (isLoading)
    return <div className="p-4 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Loans</h1>
        <Link
          to="/app/loans/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + New Application
        </Link>
      </div>

      {!loans || loans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No loan applications yet.</p>
          <Link
            to="/app/loans/new"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Ref: {loan.referenceNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {loan.loanAmount
                      ? `NPR ${loan.loanAmount.toLocaleString()}`
                      : "Amount not set"}{" "}
                    · {loan.purpose?.replace("_", " ") ?? "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {loan.duration?.replace("_", " ") ?? "—"} ·{" "}
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
  );
}
