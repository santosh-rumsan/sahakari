import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, TrendingUp } from "lucide-react";

import { createPassbookApi } from "@rs/sdk";

import { getToken } from "../../lib/storage";

export const Route = createFileRoute("/app/passbook")({
  component: PassbookPage,
});

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

function PassbookPage() {
  const token = getToken();
  const passbookApi = createPassbookApi(apiUrl);

  const { data: passbook, isLoading } = useQuery({
    queryKey: ["passbook"],
    queryFn: () => passbookApi.getMine(token),
    enabled: !!token,
  });

  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="sticky top-0 z-40 flex items-center px-6 h-16 bg-surface/80 backdrop-blur-xl">
        <h1 className="font-headline text-xl font-bold text-on-surface">Passbook</h1>
      </header>

      <div className="px-6 pt-2 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Balance Hero Card */}
            <div className="rounded-xl bg-linear-to-br from-primary to-primary-dim p-8 text-on-primary shadow-lg flex flex-col justify-between aspect-4/3">
              <div>
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <BookOpen size={16} />
                  <span className="text-xs font-medium">Available Balance</span>
                </div>
                <p className="font-headline text-4xl font-bold tracking-tight">
                  NPR {(passbook?.balance ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-70">
                  Account: {passbook?.accountNumber ?? "—"}
                </p>
              </div>
            </div>

            {/* Transaction History placeholder */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-semibold text-on-surface">Transaction History</h2>
                <span className="text-xs bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 font-medium">
                  Coming Soon
                </span>
              </div>

              <div className="rounded-xl bg-surface-container-low p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
                  <BookOpen size={24} className="text-on-surface-variant" />
                </div>
                <p className="text-sm font-semibold text-on-surface">
                  Passbook features are under development
                </p>
                <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                  Transaction history, mini-statements, and digital passbook will be available soon.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-tertiary-container px-4 py-1.5 text-xs font-medium text-on-tertiary-container">
                  <TrendingUp size={12} /> LA-011 Placeholder
                </div>
              </div>
            </section>

            {/* Upcoming features */}
            <section className="space-y-3">
              <h3 className="font-headline text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                Upcoming Features
              </h3>
              {[
                "Digital passbook with transaction history",
                "Mini statement generation",
                "Interest calculation display",
                "Downloadable account summary",
              ].map((feat) => (
                <div
                  key={feat}
                  className="flex items-center gap-3 rounded-xl bg-surface-container-lowest px-5 py-4 shadow-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-primary-container shrink-0" />
                  <span className="text-sm text-on-surface-variant">{feat}</span>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
