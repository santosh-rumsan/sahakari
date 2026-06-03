import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, TrendingUp } from "lucide-react";

import { createLoanApi, createPassbookApi } from "@rs/sdk";

import { AppHeader } from "../../components/app-header";
import { getToken } from "../../lib/storage";

export const Route = createFileRoute("/app/passbook")({
  component: PassbookPage,
});

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLoanPurpose(purpose?: string | null) {
  if (!purpose) return "—";
  return purpose.replaceAll("_", " ");
}

function formatLoanDuration(duration?: string | null) {
  if (!duration) return "—";
  return duration.replaceAll("_", " ");
}

function formatLoanStatus(status?: string | null) {
  if (!status) return "—";
  return status.replaceAll("_", " ");
}

function PassbookPage() {
  const token = getToken();
  const passbookApi = createPassbookApi(apiUrl);
  const loanApi = createLoanApi(apiUrl);

  const { data: passbook, isLoading } = useQuery({
    queryKey: ["passbook", token],
    queryFn: () => passbookApi.getMine(token),
    enabled: !!token,
  });

  const { data: loans, isLoading: loansLoading } = useQuery({
    queryKey: ["my-loans", token],
    queryFn: () => loanApi.listMine(token),
    enabled: !!token,
  });

  const pb = passbook as any;
  const loanList = (loans ?? []) as Array<any>;

  return (
    <div className="bg-surface min-h-screen">
      <AppHeader title="Passbook" />

      <div className="space-y-6 px-6 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Balance Hero Card */}
            <div className="from-primary to-primary-dim text-on-primary rounded-xl bg-linear-to-br p-6 shadow-lg">
              <div className="mb-1 flex items-center gap-2 opacity-80">
                <BookOpen size={14} />
                <span className="text-xs font-medium">Available Balance</span>
              </div>
              <p className="font-headline mb-4 text-3xl font-bold tracking-tight">
                NPR {(pb?.currentBalance || 0).toLocaleString()}
              </p>

              {/* Interest Info */}
              <div className="bg-on-primary/10 mb-3 grid grid-cols-2 gap-3 rounded-lg p-3">
                <div>
                  <div className="mb-1 flex items-center gap-1 opacity-80">
                    <TrendingUp size={12} />
                    <span className="text-xs">Accrued Interest</span>
                  </div>
                  <p className="text-lg font-semibold">
                    NPR {(pb?.accruedInterest || 0).toFixed(2)}
                  </p>
                  <p className="text-xs opacity-70">
                    {pb?.interestPeriodDays || 0} days
                  </p>
                </div>
                <div>
                  <div className="mb-1 opacity-80">
                    <span className="text-xs">Interest Rate</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {pb?.interestRateSavings || 0}%
                  </p>
                  <p className="text-xs opacity-70">per annum</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="flex items-center justify-between border-t border-white/20 pt-3 text-xs opacity-70">
                <span>
                  A/C: {pb?.passbookNumber ?? pb?.id?.slice(-8) ?? "—"}
                </span>
                <span>Since {formatDate(pb?.createdAt)}</span>
              </div>
            </div>

            {/* Passbook Details */}
            {passbook ? (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Passbook Details
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Opening Balance
                    </p>
                    <p className="font-medium text-gray-900">
                      NPR {(pb.openingBalance ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Current Balance
                    </p>
                    <p className="font-medium text-gray-900">
                      NPR {(pb.currentBalance ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Total Savings</p>
                    <p className="font-medium text-gray-900">
                      NPR {(pb.totalSavings ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Total Withdrawals
                    </p>
                    <p className="font-medium text-gray-900">
                      NPR {(pb.totalWithdrawals ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Interest Rate (Savings)
                    </p>
                    <p className="font-medium text-gray-900">
                      {pb.interestRateSavings ?? 0}%
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Interest Rate (Loan)
                    </p>
                    <p className="font-medium text-gray-900">
                      {pb.interestRateLoan ?? 0}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-headline text-on-surface font-semibold">
                    Transaction History
                  </h2>
                  <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 text-xs font-medium">
                    Coming Soon
                  </span>
                </div>

                <div className="bg-surface-container-low rounded-xl p-8 text-center">
                  <div className="bg-surface-container mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <BookOpen size={24} className="text-on-surface-variant" />
                  </div>
                  <p className="text-on-surface text-sm font-semibold">
                    No passbook found
                  </p>
                  <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
                    Contact your cooperative administrator to create a passbook
                    for your account.
                  </p>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-on-surface font-semibold">
                  Your Loans
                </h2>
                <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 text-xs font-medium">
                  {loansLoading
                    ? "Loading"
                    : `${loanList.length} loan${loanList.length === 1 ? "" : "s"}`}
                </span>
              </div>

              {loanList.length > 0 ? (
                <div className="space-y-3">
                  {loanList.map((loan) => (
                    <div
                      key={loan.id}
                      className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            {loan.referenceNumber ?? "Loan"}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-gray-900">
                            NPR {(loan.loanAmount ?? 0).toLocaleString()}
                          </h3>
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {formatLoanStatus(loan.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-gray-500">Purpose</p>
                          <p className="font-medium text-gray-900">
                            {formatLoanPurpose(loan.purpose)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">
                            {formatLoanDuration(loan.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Submitted</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(loan.submittedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reviewed</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(loan.reviewedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Shareholder: {loan.shareholderNumber ?? "—"}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Passbook: {loan.passbookNumber ?? "—"}
                        </span>
                        {loan.rejectionReason ? (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                            Rejected: {loan.rejectionReason}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : loansLoading ? (
                <div className="bg-surface-container-low text-on-surface-variant rounded-xl p-6 text-center text-sm">
                  Loading loans...
                </div>
              ) : (
                <div className="bg-surface-container-low rounded-xl p-6 text-center">
                  <p className="text-on-surface text-sm font-semibold">
                    No loan applications found
                  </p>
                  <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
                    Your submitted loan requests will appear here once they are
                    created.
                  </p>
                </div>
              )}
            </section>

            {/* Upcoming features */}
            <section className="space-y-3">
              <h3 className="font-headline text-on-surface-variant text-xs font-semibold tracking-widest uppercase">
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
                  className="bg-surface-container-lowest flex items-center gap-3 rounded-xl px-5 py-4 shadow-sm"
                >
                  <div className="bg-primary-container h-2 w-2 shrink-0 rounded-full" />
                  <span className="text-on-surface-variant text-sm">
                    {feat}
                  </span>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
