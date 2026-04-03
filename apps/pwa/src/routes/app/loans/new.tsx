import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, ChevronRight, Upload } from "lucide-react";

import { createGeoApi, createLoanApi } from "@rs/sdk";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const loanApi = createLoanApi(apiUrl);
const geoApi = createGeoApi(apiUrl);
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

function getToken() {
  return localStorage.getItem("token") ?? "";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  type = "text",
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}

function Select({
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${className}`}
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

  const { data: loan } = useQuery({
    queryKey: ["current-loan"],
    queryFn: async () => {
      const existing = await loanApi.listMine(token);
      if (existing.length > 0 && existing[0].status === "DRAFT")
        return existing[0];
      return loanApi.create(token);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      data,
      endpoint,
    }: {
      data: Record<string, unknown>;
      endpoint: string;
    }) => {
      switch (endpoint) {
        case "personal-info":
          return loanApi.updatePersonalInfo(token, loan!.id, data);
        case "loan-details":
          return loanApi.updateLoanDetails(token, loan!.id, data);
        case "address":
          return loanApi.updateAddress(token, loan!.id, data);
        case "terms-guarantor":
          return loanApi.updateTermsGuarantor(token, loan!.id, data);
        case "documents":
          return loanApi.updateDocuments(token, loan!.id, data);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["loans", "current-loan"] }),
  });

  const submitMutation = useMutation({
    mutationFn: () => loanApi.submit(token, loan!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      navigate({ to: `/app/loans/${loan?.id}/success` });
    },
  });

  const { data: provinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => geoApi.getProvinces(),
  });
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

  if (!loan)
    return <div className="p-4 text-center text-gray-500">Loading...</div>;

  const handleSave = (endpoint: string, data: Record<string, unknown>) => {
    saveMutation.mutate({ data, endpoint });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <Link to="/app/loans" className="text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">
          Loan Application
        </h1>
      </div>

      {/* Progress */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white px-4 py-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium whitespace-nowrap ${step === i + 1 ? "text-blue-600" : "text-gray-400"}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${step > i + 1 ? "bg-blue-600 text-white" : step === i + 1 ? "border border-blue-600 text-blue-600" : ""}`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </span>
            {s}
          </div>
        ))}
      </div>

      <div className="space-y-4 p-4">
        {step === 1 && (
          <PersonalInfo
            loan={loan}
            onSave={(d) => handleSave("personal-info", d)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <LoanDetails
            loan={loan}
            onSave={(d) => handleSave("loan-details", d)}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <LoanAddress
            loan={loan}
            provinces={provinces}
            districts={districts}
            municipalities={municipalities}
            onSave={(d) => handleSave("address", d)}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <TermsGuarantor
            loan={loan}
            onSave={(d) => handleSave("terms-guarantor", d)}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
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

function PersonalInfo({
  loan,
  onSave,
  onNext,
}: {
  loan: any;
  onSave: (d: Record<string, unknown>) => void;
  onNext: () => void;
}) {
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form.state.values);
        onNext();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Grandfather Name (Nepali)">
        <form.Field name="grandfatherNameNp">
          {(field) => (
            <Input
              placeholder="हरिबहादुर"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
        <Field label="Grandfather Name (English)">
        <form.Field name="grandfatherNameEn">
          {(field) => (
            <Input
              placeholder="Haribahadur"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Father Name (Nepali)">
        <form.Field name="fatherNameNp">
          {(field) => (
            <Input
              placeholder="पदमबहादुर"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
        <Field label="Father Name (English)">
        <form.Field name="fatherNameEn">
          {(field) => (
            <Input
              placeholder="Padam Bahadur"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name (Nepali)">
        <form.Field name="fullNameNp">
          {(field) => (
            <Input placeholder="जोन डो" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
          )}
        </form.Field>
        </Field>
        <Field label="Full Name (English)">
        <form.Field name="fullNameEn">
          {(field) => (
            <Input placeholder="John Doe" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
          )}
        </form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
        <form.Field name="age">
          {(field) => (
            <Input
              type="number"
              placeholder="30"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
        <Field label="Shareholder No.">
        <form.Field name="shareholderNumber">
          {(field) => (
            <Input
              placeholder="SH001"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Passbook No.">
        <form.Field name="passbookNumber">
          {(field) => (
            <Input
              placeholder="PASS1"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
        <Field label="Contact No.">
        <form.Field name="contactNumber">
          {(field) => (
            <Input
              type="tel"
              placeholder="9779810223471"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        </Field>
      </div>
      <Field label="Citizenship No.">
        <form.Field name="citizenshipNumber">
        {(field) => (
          <Input
            placeholder="12-34-56789"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
      </Field>
      <Field label="NIN ID No.">
        <form.Field name="ninIdNumber">
        {(field) => (
          <Input
            placeholder="1234567890123"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
      </Field>
      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
      >
        Continue <ChevronRight size={14} className="ml-1 inline" />
      </button>
    </form>
  );
}

function LoanDetails({
  loan,
  onSave,
  onNext,
  onBack,
}: {
  loan: any;
  onSave: (d: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form.state.values);
        onNext();
      }}
      className="space-y-4"
    >
      <Field label="Loan Amount (NPR)">
        <form.Field name="loanAmount">
          {(field) => (
            <Input
              type="number"
              placeholder="50000"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </Field>
      <Field label="Amount in Words">
        <form.Field name="loanAmountInWords">
          {(field) => (
            <Input
              placeholder="Fifty thousand only"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </Field>
      <Field label="Purpose">
        <form.Field name="purpose">
          {(field) => (
            <Select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              <option value="">Select Purpose</option>
              {[
                "AGRICULTURE",
                "SMALL_BUSINESS",
                "PERSONAL",
                "EDUCATION",
                "HEALTH",
                "HOUSE_REPAIR",
              ].map((p) => (
                <option key={p} value={p}>
                  {p.replace("_", " ")}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </Field>
      <Field label="Duration">
        <form.Field name="duration">
          {(field) => (
            <Select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              <option value="">Select Duration</option>
              {[
                "SIX_MONTHS",
                "ONE_YEAR",
                "TWO_YEARS",
                "THREE_YEARS",
                "FOUR_YEARS_PLUS",
              ].map((d) => (
                <option key={d} value={d}>
                  {d.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </Field>
      <Field label="Collateral">
        <form.Field name="collateralType">
          {(field) => (
            <div className="flex gap-3">
              {[
                ["WITH", "With Collateral"],
                ["WITHOUT", "Without Collateral"],
              ].map(([v, l]) => (
                <label
                  key={v}
                  className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 has-checked:border-blue-600 has-checked:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="collateralType"
                    value={v}
                    checked={field.state.value === v}
                    onChange={() => field.handleChange(v)}
                    onBlur={field.handleBlur}
                    className="sr-only"
                  />
                  <span className="text-sm">{l}</span>
                </label>
              ))}
            </div>
          )}
        </form.Field>
      </Field>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
        >
          Continue <ChevronRight size={14} className="ml-1 inline" />
        </button>
      </div>
    </form>
  );
}

function LoanAddress({
  loan,
  provinces,
  districts,
  municipalities,
  onSave,
  onNext,
  onBack,
}: {
  loan: any;
  provinces: any[];
  districts: any[];
  municipalities: any[];
  onSave: (d: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form.state.values);
        onNext();
      }}
      className="space-y-4"
    >
      <Field label="Province">
        <form.Field name="province">
          {(field) => (
            <Select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              <option value="">Select Province</option>
              {provinces?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </Field>
      <Field label="District">
        <form.Field name="districtId">
          {(field) => (
            <Select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              <option value="">Select District</option>
              {districts?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </Field>
      <Field label="Municipality">
        <form.Field name="municipalityId">
          {(field) => (
            <Select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              <option value="">Select Municipality</option>
              {municipalities?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ward No.">
          <form.Field name="wardNumber">
            {(field) => (
              <Select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              >
                <option value="">Select</option>
                {Array.from({ length: 35 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            )}
          </form.Field>
        </Field>
        <Field label="Tole">
          <form.Field name="tole">
            {(field) => (
              <Input
                placeholder="Tole name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
        >
          Continue <ChevronRight size={14} className="ml-1 inline" />
        </button>
      </div>
    </form>
  );
}

function TermsGuarantor({
  loan,
  onSave,
  onNext,
  onBack,
}: {
  loan: any;
  onSave: (d: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form.state.values, termsAccepted: accepted });
        onNext();
      }}
      className="space-y-4"
    >
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-700">
          Terms & Conditions
        </p>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-xs text-gray-600">
            I confirm that all information provided is accurate and I agree to
            the cooperative's terms and conditions.
          </span>
        </label>
      </div>
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-700">
          Guarantor Information
        </p>
        <Field label="Guarantor Name">
          <form.Field name="guarantorName">
            {(field) => (
              <Input
                placeholder="Full name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>
        <Field label="Guarantor Address">
          <form.Field name="guarantorAddress">
            {(field) => (
              <Input
                placeholder="District, Municipality, Ward, Tole"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>
        <Field label="Guarantor Shareholder No.">
          <form.Field name="guarantorShareholderNumber">
            {(field) => (
              <Input
                placeholder="SH001"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>
        <Field label="Guarantee Amount (NPR)">
          <form.Field name="guaranteeAmount">
            {(field) => (
              <Input
                type="number"
                placeholder="50000"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!accepted}
          className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Continue <ChevronRight size={14} className="ml-1 inline" />
        </button>
      </div>
    </form>
  );
}

function Documents({
  loan,
  onSave,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  loan: any;
  onSave: (d: Record<string, unknown>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [docs, setDocs] = useState({
    passportPhotoUrl: loan?.passportPhotoUrl ?? "",
    citizenshipFrontUrl: loan?.citizenshipFrontUrl ?? "",
    citizenshipBackUrl: loan?.citizenshipBackUrl ?? "",
    ninIdCardUrl: loan?.ninIdCardUrl ?? "",
    propertyDocumentUrl: loan?.propertyDocumentUrl ?? "",
  });

  const handleFileChange = (field: string, url: string) => {
    setDocs((prev) => ({ ...prev, [field]: url }));
    onSave({ [field]: url });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700">
        Upload Required Documents
      </p>
      {[
        ["passportPhotoUrl", "Passport Photo *"],
        ["citizenshipFrontUrl", "Citizenship (Front) *"],
        ["citizenshipBackUrl", "Citizenship (Back) *"],
        ["ninIdCardUrl", "NIN ID Card *"],
        ["propertyDocumentUrl", "Property Document (if collateral)"],
      ].map(([field, label]) => (
        <div
          key={field}
          className="rounded-xl border border-gray-200 bg-white p-4"
        >
          <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
          {docs[field as keyof typeof docs] ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={16} />
              <span className="text-sm">Uploaded</span>
              <button
                type="button"
                onClick={() => handleFileChange(field, "")}
                className="ml-auto text-xs text-red-500"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-6 text-gray-400 hover:border-blue-400 hover:text-blue-600">
              <Upload size={16} />
              <span className="text-sm">Tap to upload</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const url = reader.result as string;
                      handleFileChange(field, url);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          )}
        </div>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={
            isSubmitting ||
            !docs.passportPhotoUrl ||
            !docs.citizenshipFrontUrl ||
            !docs.citizenshipBackUrl ||
            !docs.ninIdCardUrl
          }
          className="flex-[2] rounded-xl bg-green-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
