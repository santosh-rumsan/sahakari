import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CreditCard } from "lucide-react";

import { getToken } from "../../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

export const Route = createFileRoute("/app/loans/$id/success")({
  component: LoanSuccessPage,
});

function LoanSuccessPage() {
  const { id } = Route.useParams();
  const token = getToken();

  const { data: loan } = useQuery({
    queryKey: ["loan", id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/v1/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Application Submitted!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your loan application has been submitted successfully.
          </p>

          {loan && (
            <div className="mt-6 w-full rounded-xl bg-gray-50 p-4 text-left">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Reference Number
                </span>
              </div>
              <p className="font-mono text-lg font-bold text-gray-900">
                {loan.referenceNumber}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                <div>
                  <span className="block text-xs text-gray-400">Amount</span>
                  <span className="text-sm font-medium">
                    NPR {loan.loanAmount?.toLocaleString() ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Purpose</span>
                  <span className="text-sm font-medium">
                    {loan.purpose?.replace("_", " ") ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Duration</span>
                  <span className="text-sm font-medium">
                    {loan.duration?.replace("_", " ") ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Status</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Submitted
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400">
            You will receive an SMS and in-app notification when your
            application is reviewed.
          </p>

          <div className="mt-6 flex w-full flex-col gap-3">
            <Link
              to="/app/loans"
              className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View My Loans
            </Link>
            <Link
              to="/app/dashboard"
              className="w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
