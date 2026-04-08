import type { District, Municipality, Province } from "@rs/sdk";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { createGeoApi, createKycApi } from "@rs/sdk";

import { getToken } from "../../../lib/storage";

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";
const kycApi = createKycApi(apiUrl);
const geoApi = createGeoApi(apiUrl);

export const Route = createFileRoute("/app/kyc/basic-info")({
  component: BasicInfoPage,
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

function Select({
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

const TABS = ["Basic Info", "Mandatory", "Nominee", "Signature"] as const;

function BasicInfoPage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  const { data: provinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => geoApi.getProvinces(),
  });

  const provinceId = selectedProvinceId || kyc?.provinceId || "";
  const districtId = selectedDistrictId || kyc?.districtId || "";

  const { data: districts } = useQuery({
    queryKey: ["districts", provinceId],
    queryFn: () => geoApi.getDistricts(provinceId),
    enabled: !!provinceId,
  });

  const { data: municipalities } = useQuery({
    queryKey: ["municipalities", districtId],
    queryFn: () => geoApi.getMunicipalities(districtId),
    enabled: !!districtId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      kycApi.updateBasicInfo(token, kyc!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kyc"] }),
  });

  // Parse existing genealogy JSON
  const existingGenealogy = (() => {
    try {
      const g = kyc?.genealogyJson as unknown as Array<
        Record<string, string>
      > | null;
      return g ?? [];
    } catch {
      return [];
    }
  })();

  const getGenValue = (index: number, key: string) =>
    existingGenealogy[index]?.[key] ?? "";

  const form = useForm({
    defaultValues: {
      fullNameEn: kyc?.fullNameEn ?? "",
      fullNameNp: kyc?.fullNameNp ?? "",
      passbookNo: kyc?.passbookNo ?? "",
      memberType: kyc?.memberType ?? "",
      joinDate: kyc?.joinDate ? kyc.joinDate.split("T")[0] : "",
      gender: kyc?.gender ?? "",
      dob: kyc?.dob ? kyc.dob.split("T")[0] : "",
      citizenshipNumber: kyc?.citizenshipNumber ?? "",
      citizenshipIssuedDate: kyc?.citizenshipIssuedDate
        ? kyc.citizenshipIssuedDate.split("T")[0]
        : "",
      citizenshipIssuedDistrict: kyc?.citizenshipIssuedDistrict ?? "",
      ninIdNumber: kyc?.ninIdNumber ?? "",
      ninIssuedDate: kyc?.ninIssuedDate ? kyc.ninIssuedDate.split("T")[0] : "",
      ninIssuedDistrict: kyc?.ninIssuedDistrict ?? "",
      monthlyIncome: kyc?.monthlyIncome ?? "",
      nationality: kyc?.nationality ?? "Nepali",
      provinceId: kyc?.provinceId ?? "",
      districtId: kyc?.districtId ?? "",
      municipalityId: kyc?.municipalityId ?? "",
      wardNumber: kyc?.wardNumber ?? "",
      tole: kyc?.tole ?? "",
      religion: kyc?.religion ?? "",
      occupation: kyc?.occupation ?? "",
      education: kyc?.education ?? "",
      contactNumber: kyc?.contactNumber ?? "",
      mobileNumber: kyc?.mobileNumber ?? "",
      email: kyc?.email ?? "",
      temporaryAddress: kyc?.temporaryAddress ?? "",
      shareholderNumber: kyc?.shareholderNumber ?? "",
      // Genealogy: single entry (relation + name fields)
      genealogy_relation: getGenValue(0, "relation"),
      genealogy_nameEn: getGenValue(0, "nameEn"),
      genealogy_surnameEn: getGenValue(0, "surnameEn"),
      genealogy_nameNp: getGenValue(0, "nameNp"),
      genealogy_surnameNp: getGenValue(0, "surnameNp"),
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

  const handleSave = (data: Record<string, unknown>) => {
    // Convert empty strings to null for enum and FK fields (Prisma rejects empty strings for these)
    for (const field of ["memberType", "gender", "religion", "education", "provinceId", "districtId", "municipalityId"]) {
      if (data[field] === "") data[field] = null;
    }

    // Convert numeric fields from string to proper types
    data.wardNumber = data.wardNumber !== "" && data.wardNumber != null
      ? (parseInt(data.wardNumber as string, 10) || null)
      : null;
    data.monthlyIncome = data.monthlyIncome !== "" && data.monthlyIncome != null
      ? (parseFloat(data.monthlyIncome as string) || null)
      : null;

    // Convert date strings to ISO (set null for empty)
    data.joinDate = data.joinDate ? new Date(data.joinDate as string).toISOString() : null;
    data.dob = data.dob ? new Date(data.dob as string).toISOString() : null;
    data.citizenshipIssuedDate = data.citizenshipIssuedDate
      ? new Date(data.citizenshipIssuedDate as string).toISOString()
      : null;
    data.ninIssuedDate = data.ninIssuedDate
      ? new Date(data.ninIssuedDate as string).toISOString()
      : null;

    // Build genealogy JSON from individual fields
    const genealogyEntry = {
      relation: data.genealogy_relation,
      nameEn: data.genealogy_nameEn,
      surnameEn: data.genealogy_surnameEn,
      nameNp: data.genealogy_nameNp,
      surnameNp: data.genealogy_surnameNp,
    };
    data.genealogyJson = [genealogyEntry];

    // Remove flat genealogy fields before sending
    delete data.genealogy_relation;
    delete data.genealogy_nameEn;
    delete data.genealogy_surnameEn;
    delete data.genealogy_nameNp;
    delete data.genealogy_surnameNp;

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
                if (tab === "Mandatory") navigate({ to: "/app/kyc/mandatory" });
                else if (tab === "Nominee")
                  navigate({ to: "/app/kyc/nominee" });
                else if (tab === "Signature")
                  navigate({ to: "/app/kyc/signature" });
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "Basic Info"
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
        {/* Basic Information */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Basic Information
          </h2>
          <div className="space-y-4">
            {/* Full Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name (English)">
                <form.Field name="fullNameEn">
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
              <Field label="Full Name (Nepali)">
                <form.Field name="fullNameNp">
                  {(field) => (
                    <Input
                      placeholder="नाम थर"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
            </div>

            {/* Alias + Type of Member */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Alias (Passbook No.)">
                <form.Field name="passbookNo">
                  {(field) => (
                    <Input
                      placeholder="Passbook number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="Type of Member">
                <form.Field name="memberType">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select Type</option>
                      <option value="ORDINARY">Ordinary</option>
                      <option value="SHAREHOLDER">Shareholder</option>
                    </Select>
                  )}
                </form.Field>
              </Field>
            </div>

            {/* Join Date */}
            <Field label="Join Date">
              <form.Field name="joinDate">
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

            {/* Gender + DOB */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gender">
                <form.Field name="gender">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  )}
                </form.Field>
              </Field>
              <Field label="Date of Birth">
                <form.Field name="dob">
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
            </div>

            {/* Citizenship Number + Issued Date */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Citizenship Number">
                <form.Field name="citizenshipNumber">
                  {(field) => (
                    <Input
                      placeholder="e.g. 123-456-789"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="Citizenship Issued Date">
                <form.Field name="citizenshipIssuedDate">
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
            </div>

            {/* Citizenship Issued District */}
            <Field label="Citizenship Issued District">
              <form.Field name="citizenshipIssuedDistrict">
                {(field) => (
                  <Input
                    placeholder="District name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            {/* NIN Number + NIN Issued Date */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="NIN Number">
                <form.Field name="ninIdNumber">
                  {(field) => (
                    <Input
                      placeholder="National ID Number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="NIN Issued Date">
                <form.Field name="ninIssuedDate">
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
            </div>

            {/* NIN Issued District */}
            <Field label="NIN Issued District">
              <form.Field name="ninIssuedDistrict">
                {(field) => (
                  <Input
                    placeholder="District name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            {/* Monthly Income + Nationality */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Monthly Income (NPR)">
                <form.Field name="monthlyIncome">
                  {(field) => (
                    <Input
                      type="number"
                      placeholder="0"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="Nationality">
                <form.Field name="nationality">
                  {(field) => (
                    <Input
                      placeholder="Nationality"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
            </div>

            {/* Province + District */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Province">
                <form.Field name="provinceId">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setSelectedProvinceId(e.target.value);
                        // Reset district and municipality
                        form.setFieldValue("districtId", "");
                        form.setFieldValue("municipalityId", "");
                        setSelectedDistrictId("");
                      }}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select Province</option>
                      {provinces?.map((p: Province) => (
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
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setSelectedDistrictId(e.target.value);
                        // Reset municipality
                        form.setFieldValue("municipalityId", "");
                      }}
                      onBlur={field.handleBlur}
                      disabled={!provinceId}
                    >
                      <option value="">Select District</option>
                      {districts?.map((d: District) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </form.Field>
              </Field>
            </div>

            {/* Municipality */}
            <Field label="Municipality / Rural Municipality">
              <form.Field name="municipalityId">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!districtId}
                  >
                    <option value="">Municipality name</option>
                    {municipalities?.map((m: Municipality) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                )}
              </form.Field>
            </Field>

            {/* Ward Number + Street/Tole */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ward Number">
                <form.Field name="wardNumber">
                  {(field) => (
                    <Input
                      type="number"
                      placeholder="Ward No."
                      min={1}
                      max={35}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="Street / Tole">
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

            {/* Religion + Occupation */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Religion">
                <form.Field name="religion">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select Religion</option>
                      {[
                        "HINDU",
                        "MUSLIM",
                        "BUDDHIST",
                        "CHRISTIAN",
                        "OTHER",
                      ].map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0) + r.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </Select>
                  )}
                </form.Field>
              </Field>
              <Field label="Occupation">
                <form.Field name="occupation">
                  {(field) => (
                    <Input
                      placeholder="Occupation"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
            </div>

            {/* Education */}
            <Field label="Education">
              <form.Field name="education">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select Education</option>
                    {[
                      "ILLITERATE",
                      "LITERATE",
                      "PRIMARY",
                      "SECONDARY",
                      "SLC_SEE",
                      "INTERMEDIATE",
                      "BACHELOR",
                      "DIPLOMA",
                      "MASTER",
                      "DOCTORATE",
                    ].map((e) => (
                      <option key={e} value={e}>
                        {e.replace(/_/g, " ")}
                      </option>
                    ))}
                  </Select>
                )}
              </form.Field>
            </Field>

            {/* Contact + Mobile */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact Number">
                <form.Field name="contactNumber">
                  {(field) => (
                    <Input
                      type="tel"
                      placeholder="Contact number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="Mobile Number">
                <form.Field name="mobileNumber">
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
            </div>

            {/* Email */}
            <Field label="Email">
              <form.Field name="email">
                {(field) => (
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            {/* Temporary Address */}
            <Field label="Temporary Address">
              <form.Field name="temporaryAddress">
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
          </div>
        </div>

        {/* Genealogy Information */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-gray-900">
            Genealogy Information
          </h2>
          <div className="space-y-4">
            {/* Relation */}
            <Field label="Relation">
              <form.Field name="genealogy_relation">
                {(field) => (
                  <Input
                    placeholder="Father, Mother, etc."
                    value={field.state.value as string}
                    onChange={(e) =>
                      field.handleChange(e.target.value as never)
                    }
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>

            {/* Name + Surname (English) */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name (English)">
                <form.Field name="genealogy_nameEn">
                  {(field) => (
                    <Input
                      placeholder="Name"
                      value={field.state.value as string}
                      onChange={(e) =>
                        field.handleChange(e.target.value as never)
                      }
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="Surname (English)">
                <form.Field name="genealogy_surnameEn">
                  {(field) => (
                    <Input
                      placeholder="Surname"
                      value={field.state.value as string}
                      onChange={(e) =>
                        field.handleChange(e.target.value as never)
                      }
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
            </div>

            {/* नाम + थर (Nepali) */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="नाम (Nepali)">
                <form.Field name="genealogy_nameNp">
                  {(field) => (
                    <Input
                      placeholder="नाम"
                      value={field.state.value as string}
                      onChange={(e) =>
                        field.handleChange(e.target.value as never)
                      }
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
              <Field label="थर (Nepali)">
                <form.Field name="genealogy_surnameNp">
                  {(field) => (
                    <Input
                      placeholder="थर"
                      value={field.state.value as string}
                      onChange={(e) =>
                        field.handleChange(e.target.value as never)
                      }
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={() => {
            handleSave(form.state.values as Record<string, unknown>);
            navigate({ to: "/app/kyc/mandatory" });
          }}
          disabled={saveMutation.isPending}
          className="w-full rounded-2xl bg-teal-800 py-4 text-base font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          {saveMutation.isPending ? "Saving..." : "Continue to Mandatory →"}
        </button>

        {/* Save as Draft */}
        <button
          type="button"
          onClick={() =>
            handleSave(form.state.values as Record<string, unknown>)
          }
          disabled={saveMutation.isPending}
          className="w-full rounded-2xl border border-gray-300 py-3 text-sm text-gray-500 transition hover:bg-gray-50"
        >
          {saveMutation.isPending ? "Saving..." : "Save as Draft"}
        </button>
      </div>
    </div>
  );
}
