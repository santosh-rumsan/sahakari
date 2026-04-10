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

function isPdf(url: string) {
  return url.toLowerCase().includes(".pdf");
}

function DocumentPreview({ label, url }: { label: string; url: string }) {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <p className="mb-3 text-xs font-medium text-on-surface-variant">{label}</p>
      {isPdf(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl bg-surface-container-low px-4 py-6 text-center text-sm font-medium text-primary"
        >
          Open PDF
        </a>
      ) : (
        <img
          src={url}
          alt={label}
          className={label === "Passport Photo" ? "h-48 w-full rounded-xl object-cover" : "w-full rounded-xl"}
        />
      )}
    </div>
  );
}

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
    APPROVED: { className: "bg-primary-container text-on-primary-container", label: "Approved" },
    REJECTED: { className: "bg-error-container text-on-error", label: "Rejected" },
    SUBMITTED: { className: "bg-secondary-container text-on-secondary-container", label: "Submitted" },
    UNDER_REVIEW: { className: "bg-tertiary-container text-on-tertiary-container", label: "Under Review" },
    DRAFT: { className: "bg-surface-container-high text-on-surface-variant", label: "Draft" },
  };

  const tabs = ["Details", "Documents"];
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!loan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-on-surface-variant">Loan not found</p>
      </div>
    );
  }

  const status = statusConfig[loan.status] ?? statusConfig["DRAFT"];

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-6 h-14 bg-surface/80 backdrop-blur-xl">
        <Link
          to="/app/loans"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="font-headline text-base font-semibold text-on-surface">Loan Detail</h1>
      </header>

      <div className="px-6 pt-4 space-y-5">
        {/* Hero info card */}
        <div className="rounded-xl bg-linear-to-br from-primary to-primary-dim p-6 text-on-primary shadow-lg">
          <p className="text-xs font-medium opacity-70 font-headline mb-1">Reference</p>
          <p className="font-mono text-sm font-semibold opacity-90">{loan.referenceNumber}</p>
          <p className="font-headline text-3xl font-bold tracking-tight mt-3">
            NPR {loan.loanAmount?.toLocaleString() ?? "—"}
          </p>
          <p className="text-sm opacity-80 mt-1">{loan.purpose?.replace("_", " ") ?? "—"}</p>
          <div className="mt-4">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Rejection reason */}
        {loan.status === "REJECTED" && loan.rejectionReason && (
          <div className="rounded-xl bg-error-container px-5 py-4">
            <p className="text-xs font-semibold text-on-error-container">
              Rejection Reason: {loan.rejectionReason}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 rounded-2xl bg-surface-container-low p-1.5">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === i
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {activeTab === 0 && (
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            {[
              { label: "Duration", value: loan.duration?.replace(/_/g, " ") },
              { label: "Collateral", value: loan.collateralType?.replace("_", " ") },
              { label: "Guarantor", value: loan.guarantorName },
              { label: "Guarantor Address", value: loan.guarantorAddress },
            ]
              .filter((row) => row.value)
              .map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-surface-container-low" : ""}`}
                >
                  <span className="text-sm text-on-surface-variant">{label}</span>
                  <span className="text-sm font-semibold text-on-surface">{value}</span>
                </div>
              ))}
          </div>
        )}

        {/* Documents tab */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {loan.citizenshipFrontUrl && (
              <DocumentPreview label="Citizenship (Front)" url={loan.citizenshipFrontUrl} />
            )}
            {loan.citizenshipBackUrl && (
              <DocumentPreview label="Citizenship (Back)" url={loan.citizenshipBackUrl} />
            )}
            {loan.passportPhotoUrl && (
              <DocumentPreview label="Passport Photo" url={loan.passportPhotoUrl} />
            )}
            {loan.propertyDocumentUrl && (
              <DocumentPreview label="Property Document" url={loan.propertyDocumentUrl} />
            )}
            {!loan.citizenshipFrontUrl && !loan.passportPhotoUrl && (
              <div className="rounded-xl bg-surface-container-low py-10 text-center">
                <p className="text-sm text-on-surface-variant">No documents uploaded.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
