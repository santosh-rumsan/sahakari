import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Upload } from "lucide-react";

import { createKycApi, createUploadApi } from "@rs/sdk";

import { getToken } from "../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const kycApi = createKycApi(apiUrl);
const uploadApi = createUploadApi(apiUrl);

export const Route = createFileRoute("/app/kyc/nominee")({
  component: NomineePage,
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
      <label className="mb-1 block text-sm font-medium text-gray-700">
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
      className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}

function NomineePage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: kyc } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      kycApi.updateNominee(token, kyc!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      navigate({ to: "/app/kyc" });
    },
  });

  const form = useForm({
    defaultValues: {
      nomineeName: kyc?.nomineeName ?? "",
      nomineeDob: kyc?.nomineeDob ? kyc.nomineeDob.split("T")[0] : "",
      nomineeRelation: kyc?.nomineeRelation ?? "",
      nomineeAddress: kyc?.nomineeAddress ?? "",
      nomineeContactNumber: kyc?.nomineeContactNumber ?? "",
      nomineeSignatureUrl: kyc?.nomineeSignatureUrl ?? "",
      nomineePassportPhotoUrl: kyc?.nomineePassportPhotoUrl ?? "",
    },
  });

  if (!kyc) {
    return <div className="p-4 text-center text-gray-500">Loading KYC...</div>;
  }

  const handleUpload = async (
    field: "nomineeSignatureUrl" | "nomineePassportPhotoUrl",
    file: File,
  ) => {
    const { url } = await uploadApi.upload(token, file);
    form.setFieldValue(field, url);
  };

  const handleSave = (data: Record<string, unknown>) => {
    if (data.nomineeDob)
      data.nomineeDob = new Date(data.nomineeDob as string).toISOString();
    saveMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <Link to="/app/kyc" className="flex items-center text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">
          KYC — Nominee
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
          Provide details of the nominee who will receive benefits on your
          behalf.
        </p>

        <Field label="Full Name">
          <form.Field name="nomineeName">
            {(field) => (
              <Input
                placeholder="Nominee's full name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>

        <Field label="Date of Birth">
          <form.Field name="nomineeDob">
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
          <form.Field name="nomineeRelation">
            {(field) => (
              <Input
                placeholder="e.g. Spouse, Child, Parent"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>

        <Field label="Address">
          <form.Field name="nomineeAddress">
            {(field) => (
              <Input
                placeholder="Permanent address"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </Field>

        <Field label="Contact Number">
          <form.Field name="nomineeContactNumber">
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

        {/* Signature upload */}
        <Field label="Nominee's Signature">
          <div className="space-y-2">
            <form.Subscribe selector={(state) => state.values.nomineeSignatureUrl}>
              {(url) => url && (
                <img
                  src={url}
                  alt="Nominee Signature"
                  className="h-16 rounded border object-contain"
                />
              )}
            </form.Subscribe>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50">
              <Upload size={16} />
              Upload Signature
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload("nomineeSignatureUrl", file);
                }}
              />
            </label>
          </div>
        </Field>

        {/* Passport photo upload */}
        <Field label="Nominee's Passport Photo">
          <div className="space-y-2">
            <form.Subscribe selector={(state) => state.values.nomineePassportPhotoUrl}>
              {(url) => url && (
                <img
                  src={url}
                  alt="Nominee Passport Photo"
                  className="h-24 w-20 rounded border object-cover"
                />
              )}
            </form.Subscribe>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50">
              <Upload size={16} />
              Upload Passport Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload("nomineePassportPhotoUrl", file);
                }}
              />
            </label>
          </div>
        </Field>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => handleSave(form.state.values)}
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
