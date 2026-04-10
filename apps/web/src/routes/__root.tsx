import {
  Link,
  Outlet,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureSDK } from '@rs/sdk'

import '../styles.css'

configureSDK({ apiUrl: import.meta.env['VITE_API_URL'] ?? '' })

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </QueryClientProvider>
  )
}

function NotFound() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground text-sm">
        The page you requested does not exist.
      </p>
      <Link to="/" className="text-primary text-sm underline underline-offset-4">
        Back to home
      </Link>
    </main>
  )
}
