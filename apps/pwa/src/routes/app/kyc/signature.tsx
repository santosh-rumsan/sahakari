import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Upload } from "lucide-react";

import { createKycApi, createUploadApi } from "@rs/sdk";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const kycApi = createKycApi(apiUrl);
const uploadApi = createUploadApi(apiUrl);

export const Route = createFileRoute("/app/kyc/signature")({
  component: SignaturePage,
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

function UploadField({
  label,
  value,
  onUpload,
  aspectClass = "h-24",
}: {
  label: string;
  value: string;
  onUpload: (file: File) => void;
  aspectClass?: string;
}) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {value && (
          <img
            src={value}
            alt={label}
            className={`${aspectClass} w-full rounded border object-contain`}
          />
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50">
          <Upload size={16} />
          {value ? "Replace" : "Upload"} {label}
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

function SignaturePage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: kyc } = useQuery({
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

  const form = useForm({
    defaultValues: {
      digitalSignatureUrl: kyc?.digitalSignatureUrl ?? "",
      rightThumbUrl: kyc?.rightThumbUrl ?? "",
      leftThumbUrl: kyc?.leftThumbUrl ?? "",
      passportPhotoUrl: kyc?.passportPhotoUrl ?? "",
    },
  });

  if (!kyc) {
    return <div className="p-4 text-center text-gray-500">Loading KYC...</div>;
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <Link to="/app/kyc" className="flex items-center text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">
          KYC — Signature & Photo
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4 p-4"
      >
        <p className="text-sm text-gray-500">
          Upload your digital signature, thumb impressions, and passport-size
          photo.
        </p>

        <UploadField
          label="Digital Signature"
          value={form.getFieldValue("digitalSignatureUrl")}
          onUpload={(f) => handleUpload("digitalSignatureUrl", f)}
          aspectClass="h-16"
        />

        <div className="grid grid-cols-2 gap-4">
          <UploadField
            label="Right Thumb"
            value={form.getFieldValue("rightThumbUrl")}
            onUpload={(f) => handleUpload("rightThumbUrl", f)}
            aspectClass="h-20"
          />
          <UploadField
            label="Left Thumb"
            value={form.getFieldValue("leftThumbUrl")}
            onUpload={(f) => handleUpload("leftThumbUrl", f)}
            aspectClass="h-20"
          />
        </div>

        <UploadField
          label="Passport Photo"
          value={form.getFieldValue("passportPhotoUrl")}
          onUpload={(f) => handleUpload("passportPhotoUrl", f)}
          aspectClass="h-32"
        />

        <div className="pt-4">
          <button
            type="button"
            onClick={() => saveMutation.mutate(form.state.values)}
            disabled={saveMutation.isPending}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
