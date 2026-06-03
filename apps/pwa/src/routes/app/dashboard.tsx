import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  XCircle,
} from "lucide-react";

import { createKycApi, createLoanApi, createNotificationApi } from "@rs/sdk";

import { AppHeader } from "../../components/app-header";
import TooltipWrapper from "../../components/tooltip-wrapper";
import { getStorageItem, getToken } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    APPROVED: {
      icon: <CheckCircle2 size={12} />,
      className: "bg-primary-container text-on-primary-container",
    },
    PENDING: {
      icon: <Clock size={12} />,
      className: "bg-yellow-200 text-on-secondary-container",
    },
    UNDER_REVIEW: {
      icon: <AlertCircle size={12} />,
      className: "bg-tertiary-container text-on-tertiary-container",
    },
    REJECTED: {
      icon: <XCircle size={12} />,
      className: "bg-error-container text-on-error",
    },
    DRAFT: {
      icon: <Clock size={12} />,
      className: "bg-surface-container-high text-on-surface-variant",
    },
    SUBMITTED: {
      icon: <Clock size={12} />,
      className: "bg-secondary-container text-on-secondary-container",
    },
  };
  const cfg = map[status] ?? map["DRAFT"];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon} {status.replace("_", " ")}
    </span>
  );
}

function DashboardPage() {
  const token = getToken();
  const kycApi = createKycApi(apiUrl);
  const loanApi = createLoanApi(apiUrl);
  const notifApi = createNotificationApi(apiUrl);

  const { data: kyc } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
    refetchInterval: 5000,
  });

  const { data: loans } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanApi.listMine(token),
    refetchInterval: 5000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.list(token),
  });

  const user = JSON.parse(getStorageItem("user") ?? "{}");
  const cooperativeName =
    typeof user.cooperative === "string"
      ? user.cooperative
      : (user.cooperative?.name ?? "");
  const kycApproved = kyc?.status === "APPROVED";

  // Consider a loan pending only if it's in submission/review states
  const pendingStatuses = new Set(["SUBMITTED", "UNDER_REVIEW", "PENDING"]);
  const hasPendingLoans =
    loans?.some((loan) => pendingStatuses.has(loan.status)) ?? false;

  const loanEligible = kycApproved && !hasPendingLoans;
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="bg-surface min-h-screen">
      <AppHeader
        right={
          <Link
            to="/app/notifications"
            className="bg-surface-container-lowest hover:bg-surface-container-low relative flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors active:scale-95"
          >
            <Bell size={18} className="text-on-surface-variant" />
            {unreadCount > 0 && (
              <span className="bg-error text-on-error absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </Link>
        }
      >
        <div>
          <h1 className="font-headline text-on-surface text-lg leading-tight font-bold">
            Namaste, {user.fullName ?? ""}!
          </h1>
        </div>
      </AppHeader>

      <main className="space-y-8 px-6 pt-2">
        {/* Editorial heading */}
        <section>
          <p className="text-sm text-gray-700">{cooperativeName}</p>
          <h2 className="font-headline mt-1 text-3xl leading-tight font-bold tracking-tight text-red-700">
            Your finances,
            <br />
            at a glance.
          </h2>
        </section>

        {/* KYC & Loan Action Cards */}
        <div className="grid grid-cols-1 gap-5">
          {/* KYC Card */}
          <div
            className={`flex items-center justify-between rounded-xl p-6 shadow-sm ${
              kycApproved
                ? "from-primary to-primary-dim text-on-primary bg-linear-to-br"
                : "bg-surface-container-lowest"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  kycApproved
                    ? "bg-white/20"
                    : kyc?.status === "REJECTED"
                      ? "bg-error-container"
                      : "bg-surface-container-low"
                }`}
              >
                <FileText
                  size={22}
                  className={
                    kycApproved
                      ? "text-on-primary"
                      : kyc?.status === "REJECTED"
                        ? "text-on-error-container"
                        : "text-on-surface-variant"
                  }
                />
              </div>
              <div>
                <p
                  className={`font-headline text-sm font-semibold ${kycApproved ? "text-on-primary" : "text-on-surface"}`}
                >
                  KYC Verification
                </p>
                <StatusBadge status={kyc?.status ?? "NOT_STARTED"} />
              </div>
            </div>
            <Link
              to="/app/kyc"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition active:scale-95 ${
                kycApproved
                  ? "text-on-primary bg-white/20 hover:bg-white/30"
                  : "bg-primary text-on-primary hover:bg-primary-dim"
              }`}
            >
              {kyc ? "View" : "Start"}
            </Link>
          </div>

          {/* Loan Card */}
          <div className="bg-surface-container-lowest flex items-center justify-between rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  loanEligible
                    ? "bg-secondary-container"
                    : "bg-surface-container-low"
                }`}
              >
                <CreditCard
                  size={22}
                  className={
                    loanEligible
                      ? "text-on-secondary-container"
                      : "text-on-surface-variant"
                  }
                />
              </div>
              <div>
                <p className="text-on-surface font-headline text-sm font-semibold">
                  Apply for Loan
                </p>
                <p className="text-on-surface-variant mt-0.5 text-xs">
                  {!kycApproved
                    ? "KYC approval required"
                    : hasPendingLoans
                      ? "You have a pending loan"
                      : "KYC approved — you can apply"}
                </p>
              </div>
            </div>
            {loanEligible ? (
              <TooltipWrapper tip="Apply for loan">
                <Link
                  to="/app/loans/new"
                  className="bg-primary text-on-primary hover:bg-primary-dim rounded-full px-5 py-2 text-sm font-semibold transition active:scale-95"
                >
                  Apply
                </Link>
              </TooltipWrapper>
            ) : (
              <TooltipWrapper
                tip={
                  !kycApproved
                    ? "Your KYC must be approved before you can apply for a loan"
                    : "You have a pending loan. Complete or wait for approval before applying for a new loan."
                }
              >
                <button
                  type="button"
                  disabled
                  className="bg-surface-container-high text-on-surface-variant cursor-not-allowed rounded-full px-5 py-2 text-sm font-semibold"
                >
                  Apply
                </button>
              </TooltipWrapper>
            )}
          </div>
        </div>

        {/* Loan Applications */}
        {loans && loans.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-headline text-on-surface font-semibold">
              My Loan Applications
            </h3>
            <div className="space-y-3">
              {loans.map((loan) => (
                <Link
                  key={loan.id}
                  to="/app/loans/$id"
                  params={{ id: loan.id }}
                  className="bg-surface-container-lowest hover:bg-surface-container-low flex items-center justify-between rounded-xl p-5 shadow-sm transition active:scale-[0.98]"
                >
                  <div>
                    <p className="text-on-surface text-sm font-semibold">
                      Ref: {loan.referenceNumber}
                    </p>
                    <p className="text-on-surface-variant mt-0.5 text-xs">
                      NPR {loan.loanAmount?.toLocaleString() ?? "—"} ·{" "}
                      {loan.purpose?.replace("_", " ") ?? "—"}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Notifications */}
        {notifications && notifications.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-on-surface font-semibold">
                Recent Activities
              </h3>
              <Link
                to="/app/notifications"
                className="text-primary text-sm font-semibold"
              >
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-xl p-5 ${
                    notif.isRead
                      ? "bg-surface-container-lowest"
                      : "bg-secondary-container"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${notif.isRead ? "text-on-surface" : "text-on-secondary-container"}`}
                      >
                        {notif.title}
                      </p>
                      <p
                        className={`mt-0.5 text-xs leading-relaxed ${notif.isRead ? "text-on-surface-variant" : "text-on-secondary-container"}`}
                      >
                        {notif.message}
                      </p>
                    </div>
                    <span className="text-on-surface-variant text-xs whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
