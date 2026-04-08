import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";

import { createKycApi, createUploadApi } from "@rs/sdk";

import { getToken } from "../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const kycApi = createKycApi(apiUrl);
const uploadApi = createUploadApi(apiUrl);

export const Route = createFileRoute("/app/kyc/mandatory")({
  component: MandatoryPage,
});

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-800">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  type = "text",
  placeholder,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}

const TABS = ["Basic Info", "Mandatory", "Nominee", "Signature"] as const;

function MandatoryPage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      kycApi.updateMandatory(token, kyc!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      navigate({ to: "/app/kyc/nominee" });
    },
  });

  const form = useForm({
    defaultValues: {
      mandatoryName: kyc?.mandatoryName ?? "",
      mandatoryDob: kyc?.mandatoryDob ? kyc.mandatoryDob.split("T")[0] : "",
      mandatoryRelation: kyc?.mandatoryRelation ?? "",
      mandatoryAddress: kyc?.mandatoryAddress ?? "",
      mandatoryContactNumber: kyc?.mandatoryContactNumber ?? "",
      mandatorySignatureUrl: kyc?.mandatorySignatureUrl ?? "",
      mandatoryPassportPhotoUrl: kyc?.mandatoryPassportPhotoUrl ?? "",
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
      </div>
    );
  }

  if (!kyc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-center text-gray-600">No KYC data found. Please start KYC first.</p>
        <button
          onClick={() => navigate({ to: "/app/kyc" })}
          className="rounded-lg bg-teal-800 px-6 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleUpload = async (
    field: "mandatorySignatureUrl" | "mandatoryPassportPhotoUrl",
    file: File,
  ) => {
    const { url } = await uploadApi.upload(token, file);
    form.setFieldValue(field, url);
  };

  const handleSave = (data: Record<string, unknown>) => {
    if (data.mandatoryDob)
      data.mandatoryDob = new Date(data.mandatoryDob as string).toISOString();
    saveMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Teal Header */}
      <div className="bg-teal-800 px-5 pt-10 pb-6">
        <button
          onClick={() => navigate({ to: "/app/kyc" })}
          className="mb-3 flex items-center gap-2 text-sm text-teal-200"
        >
          <span className="text-lg">←</span> Dashboard
        </button>
        <h1 className="mb-5 text-2xl font-bold text-white">KYC Verification</h1>
        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === "Basic Info")
                  navigate({ to: "/app/kyc/basic-info" });
                else if (tab === "Nominee")
                  navigate({ to: "/app/kyc/nominee" });
                else if (tab === "Signature")
                  navigate({ to: "/app/kyc/signature" });
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "Mandatory"
                  ? "bg-white text-teal-800"
                  : "bg-teal-700 text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5 p-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Mandatory Nominee Information
          </h2>
          <div className="space-y-4">
            <Field label="Name">
              <form.Field name="mandatoryName">
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

            <Field label="Date of Birth">
              <form.Field name="mandatoryDob">
                {(field) => (
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            <Field label="Relation">
              <form.Field name="mandatoryRelation">
                {(field) => (
                  <Input
                    placeholder="e.g. Spouse, Son, Daughter"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            <Field label="Address">
              <form.Field name="mandatoryAddress">
                {(field) => (
                  <Input
                    placeholder="Full address"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            <Field label="Contact Number">
              <form.Field name="mandatoryContactNumber">
                {(field) => (
                  <Input
                    type="tel"
                    placeholder="+977..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            {/* Signature upload */}
            <Field label="Signature (600x600 px)">
              <div className="space-y-2">
                <form.Subscribe
                  selector={(state) => state.values.mandatorySignatureUrl}
                >
                  {(url) =>
                    url && (
                      <img
                        src={url}
                        alt="Signature"
                        className="h-16 rounded border object-contain"
                      />
                    )
                  }
                </form.Subscribe>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-8 text-sm text-gray-500 hover:bg-gray-50">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto mb-1 text-gray-400" />
                    <span>Tap to upload signature</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload("mandatorySignatureUrl", file);
                    }}
                  />
                </label>
              </div>
            </Field>
          </div>
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={() => handleSave(form.state.values)}
          disabled={saveMutation.isPending}
          className="w-full rounded-2xl bg-teal-800 py-4 text-base font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          {saveMutation.isPending ? "Saving..." : "Continue to Nominee →"}
        </button>

        {/* Save as Draft */}
        <button
          type="button"
          onClick={() => {
            const data = { ...form.state.values };
            if (data.mandatoryDob)
              data.mandatoryDob = new Date(data.mandatoryDob).toISOString();
            saveMutation.mutate(data);
          }}
          disabled={saveMutation.isPending}
          className="w-full rounded-2xl border border-gray-300 py-3 text-sm text-gray-500 transition hover:bg-gray-50"
        >
          Save as Draft
        </button>
      </div>
    </div>
  );
}
