import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { createLoanApi } from "@rs/sdk";

import { getToken } from "../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/loans/$id")({
  component: LoanDetailPage,
});

function LoanDetailPage() {
  const { id } = Route.useParams();
  const token = getToken();
  const loanApi = createLoanApi(apiUrl);

  const { data: loan, isLoading } = useQuery({
    queryKey: ["loan", id],
    queryFn: () => loanApi.getById(token, id),
    enabled: !!token,
  });

  const statusConfig: Record<string, { className: string; label: string }> = {
    APPROVED: { className: "bg-green-50 text-green-700", label: "Approved" },
    REJECTED: { className: "bg-red-50 text-red-700", label: "Rejected" },
    SUBMITTED: { className: "bg-blue-50 text-blue-700", label: "Submitted" },
    UNDER_REVIEW: {
      className: "bg-orange-50 text-orange-700",
      label: "Under Review",
    },
    DRAFT: { className: "bg-gray-50 text-gray-600", label: "Draft" },
  };

  const tabs = ["Details", "Documents"];
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading)
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (!loan)
    return <div className="p-4 text-center text-gray-500">Loan not found</div>;

  const status = statusConfig[loan.status] ?? statusConfig["DRAFT"];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/app/loans"
          className="flex items-center gap-1 text-sm text-gray-500"
        >
          <ChevronLeft size={16} /> Back
        </Link>
      </div>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-medium text-gray-500">
            Ref: {loan.referenceNumber}
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-900">
            NPR {loan.loanAmount?.toLocaleString() ?? "—"}
          </h1>
          <p className="text-sm text-gray-500">
            {loan.purpose?.replace("_", " ") ?? "—"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {loan.status === "REJECTED" && loan.rejectionReason && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-medium text-red-700">
            Rejection Reason: {loan.rejectionReason}
          </p>
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${activeTab === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-4">
          {[
            { label: "Duration", value: loan.duration?.replace("_", " ") },
            {
              label: "Collateral",
              value: loan.collateralType?.replace("_", " "),
            },
            { label: "Guarantor", value: loan.guarantorName },
            { label: "Guarantor Address", value: loan.guarantorAddress },
          ].map(({ label, value }) =>
            value ? (
              <div
                key={label}
                className="flex justify-between border-b border-gray-100 pb-3"
              >
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {value}
                </span>
              </div>
            ) : null,
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          {loan.citizenshipFrontUrl && (
            <div>
              <p className="mb-2 text-xs text-gray-500">Citizenship (Front)</p>
              <img
                src={loan.citizenshipFrontUrl}
                alt="Citizenship Front"
                className="w-full rounded-lg border"
              />
            </div>
          )}
          {loan.citizenshipBackUrl && (
            <div>
              <p className="mb-2 text-xs text-gray-500">Citizenship (Back)</p>
              <img
                src={loan.citizenshipBackUrl}
                alt="Citizenship Back"
                className="w-full rounded-lg border"
              />
            </div>
          )}
          {loan.passportPhotoUrl && (
            <div>
              <p className="mb-2 text-xs text-gray-500">Passport Photo</p>
              <img
                src={loan.passportPhotoUrl}
                alt="Photo"
                className="h-48 w-full rounded-lg border object-cover"
              />
            </div>
          )}
          {loan.salarySheetUrl && (
            <div>
              <p className="mb-2 text-xs text-gray-500">Salary Sheet</p>
              <img
                src={loan.salarySheetUrl}
                alt="Salary Sheet"
                className="w-full rounded-lg border"
              />
            </div>
          )}
          {loan.propertyDocumentUrl && (
            <div>
              <p className="mb-2 text-xs text-gray-500">Property Document</p>
              <img
                src={loan.propertyDocumentUrl}
                alt="Property Document"
                className="w-full rounded-lg border"
              />
            </div>
          )}
          {!loan.citizenshipFrontUrl &&
            !loan.passportPhotoUrl &&
            !loan.salarySheetUrl && (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            )}
        </div>
      )}
    </div>
  );
}
