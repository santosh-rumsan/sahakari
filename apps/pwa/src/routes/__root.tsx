import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";

import { configureSDK } from "@rs/sdk";

import appCss from "../styles.css?url";

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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      },
      { name: "theme-color", content: "#2563eb" },
      { title: "Sahakari App" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ne" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full bg-gray-50 font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-gray-500">
        The page you requested does not exist.
      </p>
      <Link
        to="/"
        className="text-sm text-blue-600 underline underline-offset-4"
      >
        Back to home
      </Link>
    </main>
  );
}
