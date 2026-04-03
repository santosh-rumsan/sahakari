import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CreditCard,
  FileText,
  LogOut,
  Shield,
} from "lucide-react";

import { createKycApi, createLoanApi, createNotificationApi } from "@rs/sdk";

import { getStorageItem, getToken, removeStorageItem } from "../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const kycApi = createKycApi(apiUrl);
const loanApi = createLoanApi(apiUrl);
const notifApi = createNotificationApi(apiUrl);

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    const token = getStorageItem("token");
    if (!token) throw new Error("Not authenticated");
  },
  component: AppLayout,
});

export { getToken };

function AppLayout() {
  const token = getToken();
  const navigate = useNavigate();
  const user = JSON.parse(getStorageItem("user") ?? "{}");

  const { data: kyc } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
    refetchInterval: 10000,
  });

  const { data: loans } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanApi.listMine(token),
    refetchInterval: 10000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.list(token),
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const kycApproved = kyc?.status === "APPROVED";
  const canApplyLoan = kycApproved;

  const handleLogout = () => {
    removeStorageItem("token");
    removeStorageItem("user");
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Bottom nav for mobile */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white px-2 py-2 md:hidden">
        <Link
          to="/app/dashboard"
          className="flex flex-col items-center gap-0.5 p-2 text-gray-500"
        >
          <Shield size={20} />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          to="/app/kyc"
          className="flex flex-col items-center gap-0.5 p-2 text-gray-500"
        >
          <FileText size={20} />
          <span className="text-xs">KYC</span>
        </Link>
        <Link
          to="/app/loans"
          className="flex flex-col items-center gap-0.5 p-2 text-gray-500"
        >
          <CreditCard size={20} />
          <span className="text-xs">Loans</span>
        </Link>
        <Link
          to="/app/passbook"
          className="flex flex-col items-center gap-0.5 p-2 text-gray-500"
        >
          <BookOpen size={20} />
          <span className="text-xs">Passbook</span>
        </Link>
        <Link
          to="/app/notifications"
          className="relative flex flex-col items-center gap-0.5 p-2 text-gray-500"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
          <span className="text-xs">Alerts</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 p-2 text-gray-500"
        >
          <LogOut size={20} />
          <span className="text-xs">Logout</span>
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-100 p-4">
          <h1 className="text-lg font-bold text-gray-900">Sahakari</h1>
          <p className="mt-1 text-xs text-gray-500">{user.cooperative ?? ""}</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavLink
            to="/app/dashboard"
            icon={<Shield size={18} />}
            label="Dashboard"
          />
          <NavLink
            to="/app/kyc"
            icon={<FileText size={18} />}
            label="KYC"
            badge={kyc?.status}
          />
          <NavLink
            to="/app/loans"
            icon={<CreditCard size={18} />}
            label="My Loans"
          />
          <NavLink
            to="/app/passbook"
            icon={<BookOpen size={18} />}
            label="Passbook"
          />
          <NavLink
            to="/app/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
        </nav>

        <div className="border-t border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-900">
            {user.fullName ?? ""}
          </p>
          <p className="text-xs text-gray-500">{user.phone ?? ""}</p>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 text-sm text-gray-500 hover:text-red-600"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
}

function NavLink({
  to,
  icon,
  label,
  badge,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
      activeProps={{ className: "bg-blue-50 text-blue-700" }}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
