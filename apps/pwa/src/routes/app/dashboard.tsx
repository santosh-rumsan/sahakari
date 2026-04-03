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

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    APPROVED: {
      icon: <CheckCircle2 size={14} />,
      className: "bg-green-50 text-green-700",
    },
    PENDING: {
      icon: <Clock size={14} />,
      className: "bg-yellow-50 text-yellow-700",
    },
    UNDER_REVIEW: {
      icon: <AlertCircle size={14} />,
      className: "bg-orange-50 text-orange-700",
    },
    REJECTED: {
      icon: <XCircle size={14} />,
      className: "bg-red-50 text-red-700",
    },
    DRAFT: { icon: <Clock size={14} />, className: "bg-gray-50 text-gray-600" },
    SUBMITTED: {
      icon: <Clock size={14} />,
      className: "bg-blue-50 text-blue-700",
    },
  };
  const cfg = map[status] ?? map["DRAFT"];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
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
  const kycApproved = kyc?.status === "APPROVED";

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome, {user.fullName ?? ""}
          </h1>
          <p className="text-sm text-gray-500">{user.cooperative ?? ""}</p>
        </div>
        <Link
          to="/app/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
        >
          <Bell size={18} className="text-gray-600" />
          {(notifications?.filter((n) => !n.isRead).length ?? 0) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notifications?.filter((n) => !n.isRead).length}
            </span>
          )}
        </Link>
      </div>

      {/* KYC Status Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${kycApproved ? "bg-green-100" : kyc?.status === "REJECTED" ? "bg-red-100" : "bg-yellow-100"}`}
            >
              <FileText
                size={20}
                className={
                  kycApproved
                    ? "text-green-600"
                    : kyc?.status === "REJECTED"
                      ? "text-red-600"
                      : "text-yellow-600"
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                KYC Verification
              </p>
              <StatusBadge status={kyc?.status ?? "NOT_STARTED"} />
            </div>
          </div>
          <Link
            to="/app/kyc"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${kycApproved ? "cursor-not-allowed bg-gray-100 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {kyc ? "View" : "Start"}
          </Link>
        </div>
      </div>

      {/* Loan Application Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${kycApproved ? "bg-blue-100" : "bg-gray-100"}`}
            >
              <CreditCard
                size={20}
                className={kycApproved ? "text-blue-600" : "text-gray-400"}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Apply for Loan
              </p>
              <p className="text-xs text-gray-500">
                {kycApproved
                  ? "KYC approved — you can apply"
                  : "Complete KYC first"}
              </p>
            </div>
          </div>
          <Link
            to={kycApproved ? "/app/loans/new" : "#"}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${kycApproved ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-gray-100 text-gray-400"}`}
          >
            Apply
          </Link>
        </div>
      </div>

      {/* Loan Applications List */}
      {loans && loans.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            My Loan Applications
          </h2>
          {loans.map((loan) => (
            <Link
              key={loan.id}
              to={`/app/loans/${loan.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ref: {loan.referenceNumber}
                </p>
                <p className="text-xs text-gray-500">
                  NPR {loan.loanAmount?.toLocaleString() ?? "—"} ·{" "}
                  {loan.purpose?.replace("_", " ") ?? "—"}
                </p>
              </div>
              <StatusBadge status={loan.status} />
            </Link>
          ))}
        </div>
      )}

      {/* Recent Notifications */}
      {notifications && notifications.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Recent Notifications
          </h2>
          {notifications.slice(0, 3).map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 ${notif.isRead ? "border-gray-100 bg-white" : "border-blue-200 bg-blue-50"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {notif.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {notif.message}
                  </p>
                </div>
                <span className="text-xs whitespace-nowrap text-gray-400">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
