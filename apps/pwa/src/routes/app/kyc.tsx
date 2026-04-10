import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";

import { createKycApi } from "@rs/sdk";

import {
  clearKycSubmitErrors,
  getFirstKycErrorRoute,
  storeKycSubmitErrors,
  type KycSubmitFieldError,
} from "../../lib/kyc-submit-errors";
import { getToken } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const LOAN_ELIGIBLE_KYC_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED"] as const;
type SubmitError = Error & { details?: KycSubmitFieldError[] };

export const Route = createFileRoute("/app/kyc")({
  component: KycRouteWrapper,
});

const STEPS = [
  { key: "basic-info", label: "Basic Info" },
  { key: "mandatory", label: "Mandatory" },
  { key: "nominee", label: "Nominee" },
  { key: "signature", label: "Signature" },
] as const;

function KycRouteWrapper() {
  const { location } = useRouterState();

  if (location.pathname !== "/app/kyc") {
    return <Outlet />;
  }

  return <KycPage />;
}

function KycPage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const kycApi = createKycApi(apiUrl);
  const [submitErrors, setSubmitErrors] = useState<KycSubmitFieldError[]>([]);

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  // Auto-redirect to basic-info when KYC exists but has never been filled
  if (!isLoading && kyc?.status === "DRAFT" && !kyc.fullNameEn) {
    navigate({ to: "/app/kyc/basic-info" });
    return null;
  }

  const createMutation = useMutation({
    mutationFn: () => kycApi.create(token),
    onSuccess: () => {
      clearKycSubmitErrors();
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      navigate({ to: "/app/kyc/basic-info" });
    },
  });

  const submitMutation = useMutation<unknown, SubmitError>({
    mutationFn: () => kycApi.submit(token, kyc!.id),
    onSuccess: () => {
      setSubmitErrors([]);
      clearKycSubmitErrors();
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
    onError: (error) => {
      const errors = Array.isArray(error.details) ? error.details : [];
      setSubmitErrors(errors);
      storeKycSubmitErrors(errors);
      if (errors.length > 0) {
        navigate({ to: getFirstKycErrorRoute(errors) });
      }
    },
  });

  const status = kyc?.status ?? "NOT_STARTED";

  const statusMeta: Record<
    string,
    {
      icon: React.ReactNode;
      title: string;
      sub: string;
      cardClass: string;
    }
  > = {
    NOT_STARTED: {
      icon: <Clock size={36} className="text-on-surface-variant" />,
      title: "KYC Not Started",
      sub: "Complete your KYC to unlock loan applications.",
      cardClass: "bg-surface-container-low",
    },
    DRAFT: {
      icon: <Clock size={36} className="text-secondary" />,
      title: "KYC In Progress",
      sub: "Continue filling your KYC form.",
      cardClass: "bg-secondary-container",
    },
    PENDING: {
      icon: <AlertCircle size={36} className="text-on-tertiary-container" />,
      title: "KYC Under Review",
      sub: "Your KYC has been submitted and is being reviewed by the cooperative.",
      cardClass: "bg-tertiary-container",
    },
    UNDER_REVIEW: {
      icon: <AlertCircle size={36} className="text-on-tertiary-container" />,
      title: "KYC Under Review",
      sub: "Your KYC has been submitted and is being reviewed by the cooperative.",
      cardClass: "bg-tertiary-container",
    },
    APPROVED: {
      icon: <CheckCircle2 size={36} className="text-primary" />,
      title: "KYC Approved!",
      sub: "Your KYC has been approved. You can now apply for a loan.",
      cardClass: "bg-primary-container",
    },
    REJECTED: {
      icon: <XCircle size={36} className="text-error" />,
      title: "KYC Rejected",
      sub: kyc?.rejectionReason
        ? `Reason: ${kyc.rejectionReason}`
        : "Please contact the cooperative for more information.",
      cardClass: "bg-error-container",
    },
  };

  const meta = statusMeta[status] ?? statusMeta["NOT_STARTED"];

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pb-32">
      <header className="bg-surface/80 sticky top-0 z-40 flex h-16 items-center px-6 backdrop-blur-xl">
        <h1 className="font-headline text-on-surface text-xl font-bold">
          KYC Verification
        </h1>
      </header>

      <div className="space-y-5 px-6 pt-2">
        {/* Status card */}
        <div className={`rounded-xl p-8 text-center ${meta.cardClass}`}>
          <div className="mb-4 flex justify-center">{meta.icon}</div>
          <h2 className="font-headline text-on-surface text-lg font-bold">
            {meta.title}
          </h2>
          <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
            {meta.sub}
          </p>
        </div>

        {/* Step progress for in-progress states */}
        {(status === "DRAFT" ||
          status === "PENDING" ||
          status === "UNDER_REVIEW") && (
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <p className="font-headline text-on-surface-variant mb-4 text-xs font-semibold tracking-widest uppercase">
              Progress
            </p>
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => (
                <div
                  key={step.key}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                      status !== "DRAFT"
                        ? "bg-primary text-on-primary"
                        : "bg-primary-container text-primary"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-on-surface-variant text-center text-[10px] leading-tight font-medium">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {submitMutation.isError && (
            <div className="rounded-xl bg-error-container px-5 py-4">
              <p className="text-sm font-semibold text-on-error-container">
                {submitMutation.error.message}
              </p>
              {submitErrors.length > 0 && (
                <div className="mt-3 space-y-1 text-sm text-on-error-container">
                  {submitErrors.map((error) => (
                    <p key={error.field}>• {error.label}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {status === "NOT_STARTED" && (
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="hover:bg-primary-dim bg-primary text-on-primary w-full rounded-lg py-3.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Start KYC"}
            </button>
          )}

          {status === "DRAFT" && (
            <div className="space-y-3">
              {STEPS.map((step) => (
                <Link
                  key={step.key}
                  to={`/app/kyc/${step.key}`}
                  className="bg-surface-container-lowest hover:bg-surface-container-low flex items-center justify-between rounded-xl p-5 shadow-sm transition active:scale-[0.98]"
                >
                  <span className="font-headline text-on-surface text-sm font-semibold capitalize">
                    {step.label}
                  </span>
                  <ChevronRight size={16} className="text-on-surface-variant" />
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSubmitErrors([]);
                  submitMutation.mutate();
                }}
                disabled={submitMutation.isPending}
                className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-on-primary transition hover:bg-primary-dim active:scale-95 disabled:opacity-50"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit KYC"}
              </button>
            </div>
          )}

          {(status === "PENDING" || status === "UNDER_REVIEW") && (
            <div className="bg-tertiary-container rounded-xl px-5 py-4 text-center">
              <p className="text-on-tertiary-container text-sm">
                Your KYC has been submitted. You can apply for a loan while it
                is under review.
              </p>
            </div>
          )}

          {LOAN_ELIGIBLE_KYC_STATUSES.includes(status as (typeof LOAN_ELIGIBLE_KYC_STATUSES)[number]) && (
            <Link
              to="/app/loans/new"
              className="bg-primary text-on-primary block w-full rounded-lg py-3.5 text-center text-sm font-semibold transition hover:bg-primary-dim active:scale-95"
            >
              Apply for Loan
            </Link>
          )}

          {status === "REJECTED" && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (kyc?.id) navigate({ to: "/app/kyc/basic-info" });
                }}
                className="bg-error-container text-on-error-container w-full rounded-lg py-3.5 text-sm font-semibold transition hover:opacity-90 active:scale-95"
              >
                Update KYC
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitErrors([]);
                  submitMutation.mutate();
                }}
                disabled={submitMutation.isPending}
                className="w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-on-primary transition hover:bg-primary-dim active:scale-95 disabled:opacity-50"
              >
                {submitMutation.isPending ? "Submitting..." : "Resubmit KYC"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
