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
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-gray-900">Passbook</h1>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-lg">
            <div className="mb-1 flex items-center gap-2">
              <BookOpen size={16} className="opacity-70" />
              <span className="text-xs opacity-70">Available Balance</span>
            </div>
            <p className="text-3xl font-black">
              NPR {(passbook?.balance ?? 0).toLocaleString()}
            </p>
            <p className="mt-3 text-xs opacity-70">
              Account: {passbook?.accountNumber ?? "—"}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Transaction History
            </h2>
            <span className="text-xs text-gray-400">
              V2 Feature — Coming Soon
            </span>
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              Passbook features are under development
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Transaction history, mini-statements, and digital passbook will be
              available soon.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <TrendingUp size={12} /> LA-011 Placeholder
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-gray-400">
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
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                <span className="text-sm text-gray-600">{feat}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
