import { createFileRoute, redirect } from "@tanstack/react-router";

import { getStorageItem } from "../lib/storage";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const token = getStorageItem("token");
    if (token) {
      throw redirect({ to: "/app/dashboard" });
    }
    throw redirect({ to: "/login" });
  },
});
