import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
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
    if (!token) throw redirect({ to: "/login" });
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

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.list(token),
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const handleLogout = () => {
    removeStorageItem("token");
    removeStorageItem("user");
    navigate({ to: "/login" });
  };

  return (
    <div className="bg-surface flex min-h-screen">
      {/* Bottom nav — mobile */}
      <nav className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around rounded-t-xl bg-white/70 px-4 pt-3 pb-6 shadow-[0_-12px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:hidden">
        <Link
          to="/app/dashboard"
          className="text-outline hover:text-primary flex flex-col items-center gap-0.5 px-5 py-2 transition-colors"
          activeProps={{
            className:
              "flex flex-col items-center gap-0.5 px-5 py-2 bg-primary-container text-primary rounded-[2rem]",
          }}
        >
          {({ isActive }) => (
            <>
              <Shield size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="font-label text-[10px] font-medium tracking-wide">
                Home
              </span>
            </>
          )}
        </Link>
        <Link
          to="/app/kyc"
          className="text-outline hover:text-primary flex flex-col items-center gap-0.5 px-5 py-2 transition-colors"
          activeProps={{
            className:
              "flex flex-col items-center gap-0.5 px-5 py-2 bg-primary-container text-primary rounded-[2rem]",
          }}
        >
          {({ isActive }) => (
            <>
              <FileText size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="font-label text-[10px] font-medium tracking-wide">
                KYC
              </span>
            </>
          )}
        </Link>
        <Link
          to="/app/loans"
          className="text-outline hover:text-primary flex flex-col items-center gap-0.5 px-5 py-2 transition-colors"
          activeProps={{
            className:
              "flex flex-col items-center gap-0.5 px-5 py-2 bg-primary-container text-primary rounded-[2rem]",
          }}
        >
          {({ isActive }) => (
            <>
              <CreditCard size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="font-label text-[10px] font-medium tracking-wide">
                Loans
              </span>
            </>
          )}
        </Link>
        <Link
          to="/app/passbook"
          className="text-outline hover:text-primary flex flex-col items-center gap-0.5 px-5 py-2 transition-colors"
          activeProps={{
            className:
              "flex flex-col items-center gap-0.5 px-5 py-2 bg-primary-container text-primary rounded-[2rem]",
          }}
        >
          {({ isActive }) => (
            <>
              <BookOpen size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="font-label text-[10px] font-medium tracking-wide">
                Passbook
              </span>
            </>
          )}
        </Link>
        <Link
          to="/app/notifications"
          className="text-outline hover:text-primary relative flex flex-col items-center gap-0.5 px-5 py-2 transition-colors"
          activeProps={{
            className:
              "relative flex flex-col items-center gap-0.5 px-5 py-2 bg-primary-container text-primary rounded-[2rem]",
          }}
        >
          {({ isActive }) => (
            <>
              <Bell size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              {unreadCount > 0 && (
                <span className="bg-error text-on-error absolute top-0 right-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
              <span className="font-label text-[10px] font-medium tracking-wide">
                Alerts
              </span>
            </>
          )}
        </Link>
      </nav>

      {/* Desktop sidebar */}
      <aside className="bg-surface-container-lowest hidden w-64 flex-col border-r-0 shadow-[4px_0_24px_rgba(0,0,0,0.04)] md:flex">
        <div className="p-6 pb-4">
          <h1 className="font-headline text-primary text-xl font-bold">
            Sahakari
          </h1>
          <p className="text-on-surface-variant mt-0.5 text-xs">
            {user.cooperative ?? ""}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <SideNavLink
            to="/app/dashboard"
            icon={<Shield size={18} />}
            label="Dashboard"
          />
          <SideNavLink
            to="/app/kyc"
            icon={<FileText size={18} />}
            label="KYC"
            badge={kyc?.status}
          />
          <SideNavLink
            to="/app/loans"
            icon={<CreditCard size={18} />}
            label="My Loans"
          />
          <SideNavLink
            to="/app/passbook"
            icon={<BookOpen size={18} />}
            label="Passbook"
          />
          <SideNavLink
            to="/app/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
        </nav>

        <div className="p-4 pt-0">
          <div className="bg-surface-container-low rounded-2xl p-4">
            <p className="text-on-surface text-sm font-semibold">
              {user.fullName ?? ""}
            </p>
            <p className="text-on-surface-variant text-xs">
              {user.phone ?? ""}
            </p>
            <button
              onClick={handleLogout}
              className="text-on-surface-variant hover:text-error mt-3 flex items-center gap-2 text-sm transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-28 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
}

function SideNavLink({
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
      className="text-on-surface-variant hover:bg-surface-container-low flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition"
      activeProps={{
        className:
          "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-primary-container text-primary transition",
      }}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="bg-primary text-on-primary flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs">
          {badge}
        </span>
      )}
    </Link>
  );
}
