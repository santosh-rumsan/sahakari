import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";

import { configureSDK } from "@rs/sdk";

import "../styles.css";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
configureSDK({ apiUrl });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-headline text-2xl font-semibold text-on-surface">Page not found</h1>
      <p className="text-sm text-on-surface-variant">
        The page you requested does not exist.
      </p>
      <Link
        to="/"
        className="text-sm font-medium text-primary underline underline-offset-4"
      >
        Back to home
      </Link>
    </main>
  );
}
