import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";

import { createKycApi } from "@rs/sdk";

import { getToken } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/kyc")({
  component: KycPage,
});

const STEPS = ["Basic Info", "Mandatory", "Nominee", "Signature"] as const;

function KycPage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const kycApi = createKycApi(apiUrl);

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  const createMutation = useMutation({
    mutationFn: () => kycApi.create(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kyc"] }),
  });

  const status = kyc?.status ?? "NOT_STARTED";

  function StatusIcon({ s }: { s: string }) {
    if (s === "APPROVED")
      return <CheckCircle2 size={40} className="text-green-500" />;
    if (s === "REJECTED") return <XCircle size={40} className="text-red-500" />;
    if (s === "UNDER_REVIEW")
      return <AlertCircle size={40} className="text-orange-500" />;
    return <Clock size={40} className="text-yellow-500" />;
  }

  function StatusMessage({ s }: { s: string }) {
    if (s === "NOT_STARTED")
      return {
        title: "KYC Not Started",
        sub: "Complete your KYC to unlock loan applications",
      };
    if (s === "DRAFT")
      return {
        title: "KYC In Progress",
        sub: "Continue filling your KYC form",
      };
    if (s === "PENDING")
      return {
        title: "KYC Under Review",
        sub: "Your KYC is being reviewed by the cooperative",
      };
    if (s === "UNDER_REVIEW")
      return {
        title: "KYC Under Review",
        sub: "Your KYC is being reviewed by the cooperative",
      };
    if (s === "APPROVED")
      return {
        title: "KYC Approved!",
        sub: "Your KYC has been approved. You can now apply for a loan.",
      };
    if (s === "REJECTED")
      return {
        title: "KYC Rejected",
        sub: kyc?.rejectionReason
          ? `Reason: ${kyc.rejectionReason}`
          : "Please contact the cooperative for more information.",
      };
    return { title: "Unknown", sub: "" };
  }

  const msg = StatusMessage(status);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Clock className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="mb-3 flex justify-center">
          <StatusIcon s={status} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{msg.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{msg.sub}</p>
      </div>

      {/* Progress Steps */}
      {(status === "DRAFT" ||
        status === "PENDING" ||
        status === "UNDER_REVIEW") && (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          {STEPS.map((step, i) => {
            const completed = [
              "DRAFT",
              "PENDING",
              "UNDER_REVIEW",
              "APPROVED",
            ].includes(status);
            return (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${completed ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
                >
                  {i + 1}
                </div>
                <span className="mt-1 text-center text-xs text-gray-500">
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {status === "NOT_STARTED" && (
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Start KYC"}
          </button>
        )}

        {status === "DRAFT" && (
          <div className="space-y-2">
            {(["basic-info", "mandatory", "nominee", "signature"] as const).map(
              (tab) => (
                <Link
                  key={tab}
                  to={`/app/kyc/${tab}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-800 capitalize">
                    {tab === "basic-info"
                      ? "Basic Info"
                      : tab === "mandatory"
                        ? "Mandatory (Substitute)"
                        : tab}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              ),
            )}
          </div>
        )}

        {(status === "PENDING" || status === "UNDER_REVIEW") && (
          <p className="py-4 text-center text-sm text-gray-500">
            Your KYC is being reviewed. You will be notified once it is
            approved.
          </p>
        )}

        {status === "REJECTED" && (
          <button
            onClick={() => {
              const kycId = kyc?.id;
              if (kycId) navigate({ to: "/app/kyc/basic-info" });
            }}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Update & Resubmit KYC
          </button>
        )}
      </div>
    </div>
  );
}
