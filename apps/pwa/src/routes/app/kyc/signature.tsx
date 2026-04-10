import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";

import { createKycApi, createUploadApi } from "@rs/sdk";

import { getKycSubmitErrorsForRoute } from "../../../lib/kyc-submit-errors";
import { getToken } from "../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const kycApi = createKycApi(apiUrl);
const uploadApi = createUploadApi(apiUrl);

export const Route = createFileRoute("/app/kyc/signature")({
  component: SignaturePage,
});

function Field({
  label,
  children,
  fieldKey,
  hasError = false,
}: {
  label: string;
  children: React.ReactNode;
  fieldKey?: string;
  hasError?: boolean;
}) {
  return (
    <div
      id={fieldKey ? `kyc-field-${fieldKey}` : undefined}
      className={hasError ? "rounded-2xl border border-red-300 bg-red-50 p-3" : ""}
    >
      <label className={`mb-1 block text-sm font-semibold ${hasError ? "text-red-700" : "text-gray-800"}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function UploadField({
  label,
  value,
  onUpload,
  aspectClass = "h-24",
  fieldKey,
  hasError = false,
}: {
  label: string;
  value: string;
  onUpload: (file: File) => void;
  aspectClass?: string;
  fieldKey?: string;
  hasError?: boolean;
}) {
  return (
    <Field label={label} fieldKey={fieldKey} hasError={hasError}>
      <div className="space-y-2">
        {value && (
          <img
            src={value}
            alt={label}
            className={`${aspectClass} w-full rounded-xl border object-contain`}
          />
        )}
        <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-8 text-sm text-gray-500 hover:bg-gray-50">
          <div className="text-center">
            <Upload size={24} className="mx-auto mb-1 text-gray-400" />
            <span>
              {value ? "Replace" : "Tap to upload"} {label}
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
    </Field>
  );
}

const TABS = ["Basic Info", "Mandatory", "Nominee", "Signature"] as const;

function SignaturePage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      kycApi.updateSignature(token, kyc!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      navigate({ to: "/app/kyc" });
    },
  });
  const routeErrors = getKycSubmitErrorsForRoute("/app/kyc/signature");
  const errorFields = new Set(routeErrors.map((error) => error.field));

  const form = useForm({
    defaultValues: {
      digitalSignatureUrl: kyc?.digitalSignatureUrl ?? "",
      rightThumbUrl: kyc?.rightThumbUrl ?? "",
      leftThumbUrl: kyc?.leftThumbUrl ?? "",
      passportPhotoUrl: kyc?.passportPhotoUrl ?? "",
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

  useEffect(() => {
    if (routeErrors.length === 0) return;
    const element = document.getElementById(`kyc-field-${routeErrors[0].field}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [routeErrors]);

  const handleUpload = async (
    field:
      | "digitalSignatureUrl"
      | "rightThumbUrl"
      | "leftThumbUrl"
      | "passportPhotoUrl",
    file: File,
  ) => {
    const { url } = await uploadApi.upload(token, file);
    form.setFieldValue(field, url);
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
                else if (tab === "Mandatory")
                  navigate({ to: "/app/kyc/mandatory" });
                else if (tab === "Nominee")
                  navigate({ to: "/app/kyc/nominee" });
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "Signature"
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
        {routeErrors.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Complete the highlighted required fields first.
          </div>
        )}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Signature & Photos
          </h2>
          <div className="space-y-5">
            <form.Subscribe selector={(s) => s.values.digitalSignatureUrl}>
              {(val) => (
                <UploadField
                  label="Digital Signature"
                  value={val}
                  onUpload={(f) => handleUpload("digitalSignatureUrl", f)}
                  aspectClass="h-16"
                  fieldKey="digitalSignatureUrl"
                  hasError={errorFields.has("digitalSignatureUrl")}
                />
              )}
            </form.Subscribe>

            <div className="grid grid-cols-2 gap-4">
              <form.Subscribe selector={(s) => s.values.rightThumbUrl}>
                {(val) => (
                  <UploadField
                    label="Right Thumb"
                    value={val}
                    onUpload={(f) => handleUpload("rightThumbUrl", f)}
                    aspectClass="h-20"
                    fieldKey="rightThumbUrl"
                    hasError={errorFields.has("rightThumbUrl")}
                  />
                )}
              </form.Subscribe>
              <form.Subscribe selector={(s) => s.values.leftThumbUrl}>
                {(val) => (
                  <UploadField
                    label="Left Thumb"
                    value={val}
                    onUpload={(f) => handleUpload("leftThumbUrl", f)}
                    aspectClass="h-20"
                    fieldKey="leftThumbUrl"
                    hasError={errorFields.has("leftThumbUrl")}
                  />
                )}
              </form.Subscribe>
            </div>

            <form.Subscribe selector={(s) => s.values.passportPhotoUrl}>
              {(val) => (
                <UploadField
                  label="Passport Photo"
                  value={val}
                  onUpload={(f) => handleUpload("passportPhotoUrl", f)}
                  aspectClass="h-32"
                  fieldKey="passportPhotoUrl"
                  hasError={errorFields.has("passportPhotoUrl")}
                />
              )}
            </form.Subscribe>
          </div>
        </div>

        {/* Save & Submit */}
        <button
          type="button"
          onClick={() => saveMutation.mutate(form.state.values)}
          disabled={saveMutation.isPending}
          className="w-full rounded-2xl bg-teal-800 py-4 text-base font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          {saveMutation.isPending ? "Saving..." : "Save & Finish →"}
        </button>
      </div>
    </div>
  );
}
