import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { createNotificationApi } from "@rs/sdk";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

function getToken() {
  return localStorage.getItem("token") ?? "";
}

function NotificationsPage() {
  const token = getToken();
  const notifApi = createNotificationApi(apiUrl);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.list(token),
    refetchInterval: 10000,
  });

  if (isLoading)
    return <div className="p-4 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-bold text-gray-900">Notifications</h1>

      {!notifications || notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-xl border p-4 ${notif.isRead ? "border-gray-100 bg-white" : "border-blue-200 bg-blue-50"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {notif.title}
                </p>
                <p className="mt-0.5 text-sm text-gray-600">{notif.message}</p>
              </div>
              <span className="text-xs whitespace-nowrap text-gray-400">
                {new Date(notif.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
