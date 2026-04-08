import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { createNotificationApi } from "@rs/sdk";

import { getToken } from "../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const token = getToken();
  const notifApi = createNotificationApi(apiUrl);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.list(token),
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="sticky top-0 z-40 flex items-center px-6 h-16 bg-surface/80 backdrop-blur-xl">
        <h1 className="font-headline text-xl font-bold text-on-surface">Notifications</h1>
      </header>

      <div className="px-6 pt-2 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="mt-8 rounded-xl bg-surface-container-low p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">No notifications yet</p>
            <p className="mt-1 text-xs text-on-surface-variant">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl p-5 transition ${
                notif.isRead
                  ? "bg-surface-container-lowest shadow-sm"
                  : "bg-secondary-container"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {!notif.isRead && (
                    <span className="mb-1.5 inline-block h-2 w-2 rounded-full bg-secondary" />
                  )}
                  <p className={`text-sm font-semibold ${notif.isRead ? "text-on-surface" : "text-on-secondary-container"}`}>
                    {notif.title}
                  </p>
                  <p className={`mt-1 text-sm leading-relaxed ${notif.isRead ? "text-on-surface-variant" : "text-on-secondary-container"}`}>
                    {notif.message}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-on-surface-variant whitespace-nowrap">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
