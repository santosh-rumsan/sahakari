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

import { getToken, getStorageItem } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const LOAN_ELIGIBLE_KYC_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED"] as const;

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
      className: "bg-secondary-container text-on-secondary-container",
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
  const loanEligible = !!kyc?.status && LOAN_ELIGIBLE_KYC_STATUSES.includes(kyc.status as (typeof LOAN_ELIGIBLE_KYC_STATUSES)[number]);
  const kycApproved = kyc?.status === "APPROVED";
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-surface/80 backdrop-blur-xl">
        <div>
          <p className="text-xs font-medium text-secondary">
            Welcome back
          </p>
          <h1 className="font-headline text-lg font-bold text-on-surface leading-tight">
            {user.fullName ?? ""}
          </h1>
        </div>
        <Link
          to="/app/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-colors active:scale-95"
        >
          <Bell size={18} className="text-on-surface-variant" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-on-error font-bold">
              {unreadCount}
            </span>
          )}
        </Link>
      </header>

      <main className="px-6 space-y-8 pt-2">
        {/* Editorial heading */}
        <section>
          <p className="text-on-surface-variant text-sm">{user.cooperative ?? ""}</p>
          <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight leading-tight mt-1">
            Your finances,<br />at a glance.
          </h2>
        </section>

        {/* KYC & Loan Action Cards */}
        <div className="grid grid-cols-1 gap-5">
          {/* KYC Card */}
          <div
            className={`rounded-xl p-6 flex items-center justify-between shadow-sm ${
              kycApproved
                ? "bg-linear-to-br from-primary to-primary-dim text-on-primary"
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
                <p className={`text-sm font-semibold font-headline ${kycApproved ? "text-on-primary" : "text-on-surface"}`}>
                  KYC Verification
                </p>
                <StatusBadge status={kyc?.status ?? "NOT_STARTED"} />
              </div>
            </div>
            <Link
              to="/app/kyc"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition active:scale-95 ${
                kycApproved
                  ? "bg-white/20 text-on-primary hover:bg-white/30"
                  : "bg-primary text-on-primary hover:bg-primary-dim"
              }`}
            >
              {kyc ? "View" : "Start"}
            </Link>
          </div>

          {/* Loan Card */}
          <div className="rounded-xl bg-surface-container-lowest p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  loanEligible ? "bg-secondary-container" : "bg-surface-container-low"
                }`}
              >
                <CreditCard
                  size={22}
                  className={loanEligible ? "text-on-secondary-container" : "text-on-surface-variant"}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface font-headline">Apply for Loan</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {loanEligible ? "KYC submitted — you can apply" : "Submit KYC first"}
                </p>
              </div>
            </div>
            {loanEligible ? (
              <Link
                to="/app/loans/new"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-dim active:scale-95"
              >
                Apply
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-full bg-surface-container-high px-5 py-2 text-sm font-semibold text-on-surface-variant"
              >
                Apply
              </button>
            )}
          </div>
        </div>

        {/* Loan Applications */}
        {loans && loans.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-headline font-semibold text-on-surface">My Loan Applications</h3>
            <div className="space-y-3">
              {loans.map((loan) => (
                <Link
                  key={loan.id}
                  to="/app/loans/$id"
                  params={{ id: loan.id }}
                  className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-5 shadow-sm transition hover:bg-surface-container-low active:scale-[0.98]"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Ref: {loan.referenceNumber}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
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
              <h3 className="font-headline font-semibold text-on-surface">Recent Alerts</h3>
              <Link to="/app/notifications" className="text-sm font-semibold text-primary">
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
                      <p className={`text-sm font-semibold ${notif.isRead ? "text-on-surface" : "text-on-secondary-container"}`}>
                        {notif.title}
                      </p>
                      <p className={`mt-0.5 text-xs leading-relaxed ${notif.isRead ? "text-on-surface-variant" : "text-on-secondary-container"}`}>
                        {notif.message}
                      </p>
                    </div>
                    <span className="text-xs whitespace-nowrap text-on-surface-variant">
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
