import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, ChevronRight, Upload } from "lucide-react";

import { createGeoApi, createKycApi, createLoanApi, createUploadApi } from "@rs/sdk";

import { getToken } from "../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const loanApi = createLoanApi(apiUrl);
const geoApi = createGeoApi(apiUrl);
const kycApi = createKycApi(apiUrl);
const uploadApi = createUploadApi(apiUrl);
const LOAN_ELIGIBLE_KYC_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED"] as const;
const STEPS = [
  "Personal Info",
  "Loan Details",
  "Address",
  "Terms & Guarantor",
  "Documents",
] as const;

export const Route = createFileRoute("/app/loans/new")({
  component: NewLoanPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-on-surface-variant font-headline">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ type = "text", className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={`w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50 ${className}`}
      {...props}
    />
  );
}

function Select({ children, className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary/40 transition ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function NewLoanPage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { data: kyc, isLoading: isKycLoading, error: kycError } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });
  const loanEligible = !!kyc?.status && LOAN_ELIGIBLE_KYC_STATUSES.includes(kyc.status as (typeof LOAN_ELIGIBLE_KYC_STATUSES)[number]);

  const { data: loan, isLoading: isLoanLoading, error: loanError } = useQuery({
    queryKey: ["current-loan"],
    queryFn: async () => {
      const existing = await loanApi.listMine(token);
      if (existing.length > 0 && existing[0].status === "DRAFT") return existing[0];
      return loanApi.create(token);
    },
    enabled: loanEligible,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ data, endpoint }: { data: Record<string, unknown>; endpoint: string }) => {
      switch (endpoint) {
        case "personal-info": return loanApi.updatePersonalInfo(token, loan!.id, data);
        case "loan-details": return loanApi.updateLoanDetails(token, loan!.id, data);
        case "address": return loanApi.updateAddress(token, loan!.id, data);
        case "terms-guarantor": return loanApi.updateTermsGuarantor(token, loan!.id, data);
        case "documents": return loanApi.updateDocuments(token, loan!.id, data);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans", "current-loan"] }),
  });

  const submitMutation = useMutation({
    mutationFn: () => loanApi.submit(token, loan!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      navigate({ to: `/app/loans/${loan?.id}/success` });
    },
  });

  const { data: provinces } = useQuery({ queryKey: ["provinces"], queryFn: () => geoApi.getProvinces() });
  const { data: districts } = useQuery({
    queryKey: ["districts", loan?.province],
    queryFn: () => geoApi.getDistricts(loan?.province),
    enabled: !!loan?.province,
  });
  const { data: municipalities } = useQuery({
    queryKey: ["municipalities", loan?.districtId],
    queryFn: () => geoApi.getMunicipalities(loan?.districtId),
    enabled: !!loan?.districtId,
  });

  if (isKycLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (kycError) {
    return (
      <RouteMessage
        title="Unable to load KYC"
        message={kycError instanceof Error ? kycError.message : "Please try again."}
        actionLabel="Back to Loans"
        actionTo="/app/loans"
      />
    );
  }

  if (!loanEligible) {
    return (
      <RouteMessage
        title="Submit KYC First"
        message="You can apply for a loan after your KYC has been submitted. Approval is not required."
        actionLabel="Go to KYC"
        actionTo="/app/kyc"
      />
    );
  }

  if (loanError) {
    return (
      <RouteMessage
        title="Unable to load loan application"
        message={loanError instanceof Error ? loanError.message : "Please try again."}
        actionLabel="Back to Loans"
        actionTo="/app/loans"
      />
    );
  }

  if (isLoanLoading || !loan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSave = (endpoint: string, data: Record<string, unknown>) => {
    saveMutation.mutate({ data, endpoint });
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-6 h-14 bg-surface/80 backdrop-blur-xl">
        <Link to="/app/loans" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="font-headline text-base font-semibold text-on-surface">Loan Application</h1>
      </header>

      {/* Step progress */}
      <div className="flex gap-1.5 px-6 py-3 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 shrink-0">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
                step > i + 1
                  ? "bg-primary text-on-primary"
                  : step === i + 1
                    ? "bg-primary-container text-primary ring-2 ring-primary/30"
                    : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${step === i + 1 ? "text-primary" : "text-on-surface-variant"}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 ${step > i + 1 ? "bg-primary" : "bg-surface-container-high"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="px-6 pt-2 space-y-5">
        {step === 1 && (
          <PersonalInfo loan={loan} onSave={(d) => handleSave("personal-info", d)} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <LoanDetails loan={loan} onSave={(d) => handleSave("loan-details", d)} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <LoanAddress
            loan={loan}
            provinces={provinces ?? []}
            districts={districts ?? []}
            municipalities={municipalities ?? []}
            onSave={(d) => handleSave("address", d)}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <TermsGuarantor loan={loan} onSave={(d) => handleSave("terms-guarantor", d)} onNext={() => setStep(5)} onBack={() => setStep(3)} />
        )}
        {step === 5 && (
          <Documents
            loan={loan}
            onSave={(d) => handleSave("documents", d)}
            onSubmit={() => submitMutation.mutate()}
            onBack={() => setStep(4)}
            isSubmitting={submitMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  submitLabel = "Continue",
  disabled = false,
}: {
  onBack?: () => void;
  submitLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`flex gap-3 pt-2 ${onBack ? "" : ""}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg bg-surface-container-high py-3 text-sm font-medium text-on-surface transition hover:bg-surface-container active:scale-95"
        >
          Back
        </button>
      )}
      <button
        type="submit"
        disabled={disabled}
        className={`rounded-lg bg-primary py-3 text-sm font-semibold text-on-primary transition active:scale-95 disabled:opacity-50 ${onBack ? "flex-2" : "w-full"}`}
      >
        {submitLabel} {!disabled && <ChevronRight size={14} className="inline ml-1" />}
      </button>
    </div>
  );
}

function PersonalInfo({ loan, onSave, onNext }: { loan: any; onSave: (d: Record<string, unknown>) => void; onNext: () => void }) {
  const form = useForm({
    defaultValues: {
      grandfatherNameNp: loan?.grandfatherNameNp ?? "",
      grandfatherNameEn: loan?.grandfatherNameEn ?? "",
      fatherNameNp: loan?.fatherNameNp ?? "",
      fatherNameEn: loan?.fatherNameEn ?? "",
      fullNameNp: loan?.fullNameNp ?? "",
      fullNameEn: loan?.fullNameEn ?? "",
      age: loan?.age ?? "",
      shareholderNumber: loan?.shareholderNumber ?? "",
      passbookNumber: loan?.passbookNumber ?? "",
      contactNumber: loan?.contactNumber ?? "",
      citizenshipNumber: loan?.citizenshipNumber ?? "",
      ninIdNumber: loan?.ninIdNumber ?? "",
    },
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form.state.values); onNext(); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Grandfather Name (Nepali)">
          <form.Field name="grandfatherNameNp">{(f) => <Input placeholder="हरिबहादुर" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Grandfather Name (English)">
          <form.Field name="grandfatherNameEn">{(f) => <Input placeholder="Haribahadur" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Father Name (Nepali)">
          <form.Field name="fatherNameNp">{(f) => <Input placeholder="पदमबहादुर" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Father Name (English)">
          <form.Field name="fatherNameEn">{(f) => <Input placeholder="Padam Bahadur" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name (Nepali)">
          <form.Field name="fullNameNp">{(f) => <Input placeholder="जोन डो" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Full Name (English)">
          <form.Field name="fullNameEn">{(f) => <Input placeholder="John Doe" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
          <form.Field name="age">{(f) => <Input type="number" placeholder="30" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Shareholder No.">
          <form.Field name="shareholderNumber">{(f) => <Input placeholder="SH001" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Passbook No.">
          <form.Field name="passbookNumber">{(f) => <Input placeholder="PASS1" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Contact No.">
          <form.Field name="contactNumber">{(f) => <Input type="tel" placeholder="9779810223471" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
      </div>
      <Field label="Citizenship No.">
        <form.Field name="citizenshipNumber">{(f) => <Input placeholder="12-34-56789" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
      </Field>
      <Field label="NIN ID No.">
        <form.Field name="ninIdNumber">{(f) => <Input placeholder="1234567890123" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
      </Field>
      <NavButtons />
    </form>
  );
}

function LoanDetails({ loan, onSave, onNext, onBack }: { loan: any; onSave: (d: Record<string, unknown>) => void; onNext: () => void; onBack: () => void }) {
  const form = useForm({
    defaultValues: {
      loanAmount: loan?.loanAmount ?? "",
      loanAmountInWords: loan?.loanAmountInWords ?? "",
      purpose: loan?.purpose ?? "",
      duration: loan?.duration ?? "",
      collateralType: loan?.collateralType ?? "",
    },
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form.state.values); onNext(); }} className="space-y-4">
      <Field label="Loan Amount (NPR)">
        <form.Field name="loanAmount">{(f) => <Input type="number" placeholder="50000" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
      </Field>
      <Field label="Amount in Words">
        <form.Field name="loanAmountInWords">{(f) => <Input placeholder="Fifty thousand only" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
      </Field>
      <Field label="Purpose">
        <form.Field name="purpose">
          {(f) => (
            <Select value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}>
              <option value="">Select Purpose</option>
              {["AGRICULTURE", "SMALL_BUSINESS", "PERSONAL", "EDUCATION", "HEALTH", "HOUSE_REPAIR"].map((p) => (
                <option key={p} value={p}>{p.replace("_", " ")}</option>
              ))}
            </Select>
          )}
        </form.Field>
      </Field>
      <Field label="Duration">
        <form.Field name="duration">
          {(f) => (
            <Select value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}>
              <option value="">Select Duration</option>
              {["SIX_MONTHS", "ONE_YEAR", "TWO_YEARS", "THREE_YEARS", "FOUR_YEARS_PLUS"].map((d) => (
                <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
              ))}
            </Select>
          )}
        </form.Field>
      </Field>
      <Field label="Collateral">
        <form.Field name="collateralType">
          {(f) => (
            <div className="flex gap-3">
              {[["WITH", "With Collateral"], ["WITHOUT", "Without Collateral"]].map(([v, l]) => (
                <label key={v} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl px-4 py-3 transition ${f.state.value === v ? "bg-primary-container text-primary ring-2 ring-primary/30" : "bg-surface-container-lowest ring-1 ring-outline-variant/50"}`}>
                  <input type="radio" name="collateralType" value={v} checked={f.state.value === v} onChange={() => f.handleChange(v)} onBlur={f.handleBlur} className="sr-only" />
                  <span className="text-sm font-medium">{l}</span>
                </label>
              ))}
            </div>
          )}
        </form.Field>
      </Field>
      <NavButtons onBack={onBack} />
    </form>
  );
}

function LoanAddress({ loan, provinces, districts, municipalities, onSave, onNext, onBack }: { loan: any; provinces: any[]; districts: any[]; municipalities: any[]; onSave: (d: Record<string, unknown>) => void; onNext: () => void; onBack: () => void }) {
  const form = useForm({
    defaultValues: {
      province: loan?.province ?? "",
      districtId: loan?.districtId ?? "",
      municipalityId: loan?.municipalityId ?? "",
      wardNumber: loan?.wardNumber ?? "",
      tole: loan?.tole ?? "",
    },
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form.state.values); onNext(); }} className="space-y-4">
      <Field label="Province">
        <form.Field name="province">{(f) => <Select value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}><option value="">Select Province</option>{provinces?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>}</form.Field>
      </Field>
      <Field label="District">
        <form.Field name="districtId">{(f) => <Select value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}><option value="">Select District</option>{districts?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>}</form.Field>
      </Field>
      <Field label="Municipality">
        <form.Field name="municipalityId">{(f) => <Select value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}><option value="">Select Municipality</option>{municipalities?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select>}</form.Field>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ward No.">
          <form.Field name="wardNumber">{(f) => <Select value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}><option value="">Select</option>{Array.from({ length: 35 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</Select>}</form.Field>
        </Field>
        <Field label="Tole">
          <form.Field name="tole">{(f) => <Input placeholder="Tole name" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
      </div>
      <NavButtons onBack={onBack} />
    </form>
  );
}

function TermsGuarantor({ loan, onSave, onNext, onBack }: { loan: any; onSave: (d: Record<string, unknown>) => void; onNext: () => void; onBack: () => void }) {
  const form = useForm({
    defaultValues: {
      guarantorName: loan?.guarantorName ?? "",
      guarantorAddress: loan?.guarantorAddress ?? "",
      guarantorShareholderNumber: loan?.guarantorShareholderNumber ?? "",
      guaranteeAmount: loan?.guaranteeAmount ?? "",
    },
  });
  const [accepted, setAccepted] = useState(loan?.termsAccepted ?? false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form.state.values, termsAccepted: accepted }); onNext(); }} className="space-y-4">
      <div className="rounded-xl bg-surface-container-low p-5 space-y-3">
        <p className="text-sm font-semibold text-on-surface font-headline">Terms & Conditions</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition ${accepted ? "bg-primary" : "bg-surface-container-highest ring-1 ring-outline-variant"}`}>
            {accepted && <CheckCircle2 size={14} className="text-on-primary" />}
          </div>
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="sr-only" />
          <span className="text-xs text-on-surface-variant leading-relaxed">
            I confirm that all information provided is accurate and I agree to the cooperative's terms and conditions.
          </span>
        </label>
      </div>
      <div className="rounded-xl bg-surface-container-low p-5 space-y-4">
        <p className="text-sm font-semibold text-on-surface font-headline">Guarantor Information</p>
        <Field label="Guarantor Name">
          <form.Field name="guarantorName">{(f) => <Input placeholder="Full name" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Guarantor Address">
          <form.Field name="guarantorAddress">{(f) => <Input placeholder="District, Municipality, Ward, Tole" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Guarantor Shareholder No.">
          <form.Field name="guarantorShareholderNumber">{(f) => <Input placeholder="SH001" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
        <Field label="Guarantee Amount (NPR)">
          <form.Field name="guaranteeAmount">{(f) => <Input type="number" placeholder="50000" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />}</form.Field>
        </Field>
      </div>
      <NavButtons onBack={onBack} disabled={!accepted} />
    </form>
  );
}

function Documents({ loan, onSave, onSubmit, onBack, isSubmitting }: { loan: any; onSave: (d: Record<string, unknown>) => void; onSubmit: () => void; onBack: () => void; isSubmitting: boolean }) {
  const [docs, setDocs] = useState({
    passportPhotoUrl: loan?.passportPhotoUrl ?? "",
    citizenshipFrontUrl: loan?.citizenshipFrontUrl ?? "",
    citizenshipBackUrl: loan?.citizenshipBackUrl ?? "",
    ninIdCardUrl: loan?.ninIdCardUrl ?? "",
    propertyDocumentUrl: loan?.propertyDocumentUrl ?? "",
  });
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const token = getToken();

  const handleFileChange = (field: string, url: string) => {
    setDocs((prev) => ({ ...prev, [field]: url }));
    onSave({ [field]: url });
  };

  const handleUpload = async (field: string, file: File) => {
    setUploadingField(field);
    try {
      const { url } = await uploadApi.upload(token, file);
      handleFileChange(field, url);
    } finally {
      setUploadingField(null);
    }
  };

  const requiredUploaded =
    docs.passportPhotoUrl && docs.citizenshipFrontUrl && docs.citizenshipBackUrl && docs.ninIdCardUrl;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-on-surface font-headline">Upload Required Documents</p>
      {[
        ["passportPhotoUrl", "Passport Photo *", "image/*"],
        ["citizenshipFrontUrl", "Citizenship (Front) *", "image/*,application/pdf"],
        ["citizenshipBackUrl", "Citizenship (Back) *", "image/*,application/pdf"],
        ["ninIdCardUrl", "NIN ID Card *", "image/*,application/pdf"],
        ["propertyDocumentUrl", "Property Document (if collateral)", "image/*,application/pdf"],
      ].map(([field, label, accept]) => (
        <div key={field} className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-on-surface-variant">{label}</p>
          {docs[field as keyof typeof docs] ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container">
                <CheckCircle2 size={16} className="text-primary" />
              </div>
              <span className="text-sm text-on-surface font-medium">Uploaded</span>
              <button
                type="button"
                onClick={() => handleFileChange(field, "")}
                className="ml-auto text-xs text-error font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-surface-container-low py-7 text-on-surface-variant hover:bg-surface-container transition">
              <Upload size={20} />
              <span className="text-sm font-medium">
                {uploadingField === field ? "Uploading..." : "Tap to upload"}
              </span>
              <span className="text-xs text-on-surface-variant/80">
                {accept.includes("application/pdf") ? "Images or PDF" : "Images only"}
              </span>
              <input
                type="file"
                accept={accept}
                className="sr-only"
                disabled={uploadingField === field}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUpload(field, file);
                  }
                }}
              />
            </label>
          )}
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg bg-surface-container-high py-3 text-sm font-medium text-on-surface transition hover:bg-surface-container active:scale-95"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !requiredUploaded}
          className="flex-2 rounded-lg bg-primary py-3 text-sm font-semibold text-on-primary transition active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

function RouteMessage({
  title,
  message,
  actionLabel,
  actionTo,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionTo: "/app/kyc" | "/app/loans";
}) {
  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-6 h-14 bg-surface/80 backdrop-blur-xl">
        <Link to="/app/loans" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="font-headline text-base font-semibold text-on-surface">Loan Application</h1>
      </header>
      <div className="px-6 pt-8">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-headline text-lg font-semibold text-on-surface">{title}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{message}</p>
          <Link
            to={actionTo}
            className="mt-5 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-dim active:scale-95"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
