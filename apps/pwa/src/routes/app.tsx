import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Bell, BookOpen, CreditCard, LogOut, Shield } from "lucide-react";

import { createKycApi, createLoanApi, createNotificationApi } from "@rs/sdk";

import { MobileSidebar } from "../components/mobile-sidebar";
import { SidebarProvider, useSidebar } from "../components/sidebar-context";
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
  component: () => (
    <SidebarProvider>
      <AppLayout />
    </SidebarProvider>
  ),
});

export { getToken };

function AppLayout() {
  const token = getToken();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = JSON.parse(getStorageItem("user") ?? "{}");
  const cooperativeName =
    typeof user.cooperative === "string"
      ? user.cooperative
      : (user.cooperative?.name ?? "");
  const { isOpen, closeSidebar } = useSidebar();

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
    queryClient.clear();
    navigate({ to: "/login" });
  };

  return (
    <div className="bg-surface flex min-h-screen">
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isOpen} onClose={closeSidebar}>
        <div className="p-6 pb-4">
          <h1 className="font-headline text-primary text-xl font-bold">
            Sahakari
          </h1>
          <p className="text-on-surface-variant mt-0.5 text-xs">
            {cooperativeName}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <SideNavLink
            to="/app/dashboard"
            icon={<Shield size={18} />}
            label="Dashboard"
            onClick={closeSidebar}
          />
          {/* <SideNavLink
            to="/app/kyc"
            icon={<FileText size={18} />}
            label="KYC"
            badge={kyc?.status}
            onClick={closeSidebar}
          /> */}
          <SideNavLink
            to="/app/loans"
            icon={<CreditCard size={18} />}
            label="My Loans"
            onClick={closeSidebar}
          />
          <SideNavLink
            to="/app/passbook"
            icon={<BookOpen size={18} />}
            label="Passbook"
            onClick={closeSidebar}
          />
          <SideNavLink
            to="/app/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            badge={unreadCount > 0 ? unreadCount : undefined}
            onClick={closeSidebar}
          />
        </nav>

        <div className="p-4">
          <div className="bg-surface-container-low rounded-2xl p-4">
            <p className="text-on-surface text-sm font-semibold">
              {user.fullName ?? ""}
            </p>
            <p className="text-on-surface-variant text-xs">
              {user.phone ?? ""}
            </p>
            <button
              onClick={() => {
                closeSidebar();
                handleLogout();
              }}
              className="text-on-surface-variant hover:text-error mt-3 flex items-center gap-2 text-sm transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </MobileSidebar>

      {/* Desktop sidebar */}
      <aside className="bg-surface-container-lowest hidden w-64 flex-col border-r-0 shadow-[4px_0_24px_rgba(0,0,0,0.04)] md:flex">
        <div className="p-6 pb-4">
          <h1 className="font-headline text-primary text-xl font-bold">
            Sahakari
          </h1>
          <p className="text-on-surface-variant mt-0.5 text-xs">
            {cooperativeName}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <SideNavLink
            to="/app/dashboard"
            icon={<Shield size={18} />}
            label="Dashboard"
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
      <div className="flex-1 overflow-auto">
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
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
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
