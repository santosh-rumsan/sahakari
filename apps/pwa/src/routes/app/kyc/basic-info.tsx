import type { District, Municipality, Province } from "@rs/sdk";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function BasicInfoPage() {
  const token = getToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const { data: kyc } = useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycApi.getMine(token),
  });

  const { data: provinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => geoApi.getProvinces(),
  });

  const { data: districts } = useQuery({
    queryKey: ["districts", kyc?.provinceId],
    queryFn: () => geoApi.getDistricts(kyc?.provinceId),
    enabled: !!kyc?.provinceId,
  });

  const { data: municipalities } = useQuery({
    queryKey: ["municipalities", kyc?.districtId],
    queryFn: () => geoApi.getMunicipalities(kyc?.districtId),
    enabled: !!kyc?.districtId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      kycApi.updateBasicInfo(token, kyc!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kyc"] }),
  });

  const submitMutation = useMutation({
    mutationFn: () => kycApi.submit(token, kyc!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      navigate({ to: "/app/kyc" });
    },
  });

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
    },
  });

  if (!kyc) {
    return <div className="p-4 text-center text-gray-500">Loading KYC...</div>;
  }

  const handleSave = (data: Record<string, unknown>) => {
    if (data.joinDate)
      data.joinDate = new Date(data.joinDate as string).toISOString();
    if (data.dob) data.dob = new Date(data.dob as string).toISOString();
    if (data.citizenshipIssuedDate)
      data.citizenshipIssuedDate = new Date(
        data.citizenshipIssuedDate as string,
      ).toISOString();
    if (data.ninIssuedDate)
      data.ninIssuedDate = new Date(data.ninIssuedDate as string).toISOString();
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
          KYC — Basic Info
        </h1>
      </div>

      {/* Progress */}
      <div className="flex border-b border-gray-200 bg-white px-4 py-2">
        {["Personal", "Address", "Genealogy"].map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i + 1)}
            className={`flex-1 py-1 text-xs font-medium ${step === i + 1 ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4 p-4"
      >
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name (English)">
                <form.Field name="fullNameEn">
                  {(field) => (
                    <Input
                      placeholder="John Doe"
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
                      placeholder="जोन डो"
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
                <form.Field name="passbookNo">
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
              <Field label="Member Type">
                <form.Field name="memberType">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select</option>
                      <option value="ORDINARY">Ordinary</option>
                      <option value="SHAREHOLDER">Shareholder</option>
                    </Select>
                  )}
                </form.Field>
              </Field>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gender">
                <form.Field name="gender">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select</option>
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
            <div className="grid grid-cols-2 gap-3">
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
            <Field label="Citizenship Issued District">
              <form.Field name="citizenshipIssuedDistrict">
                {(field) => (
                  <Input
                    placeholder="Kathmandu"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>
            <div className="grid grid-cols-2 gap-3">
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
            <Field label="NIN Issued District">
              <form.Field name="ninIssuedDistrict">
                {(field) => (
                  <Input
                    placeholder="Kathmandu"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Monthly Income (NPR)">
                <form.Field name="monthlyIncome">
                  {(field) => (
                    <Input
                      type="number"
                      placeholder="25000"
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
                      readOnly
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Province">
              <form.Field name="provinceId">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
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
            <Field label="Municipality / Rural Municipality">
              <form.Field name="municipalityId">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select Municipality</option>
                    {municipalities?.map((m: Municipality) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                )}
              </form.Field>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ward Number">
                <form.Field name="wardNumber">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select Ward</option>
                      {Array.from({ length: 35 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </Select>
                  )}
                </form.Field>
              </Field>
              <Field label="Tole / Street">
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Religion">
                <form.Field name="religion">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select</option>
                      {["HINDU", "MUSLIM", "BUDDHIST", "CHRISTIAN", "OTHER"].map(
                        (r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ),
                      )}
                    </Select>
                  )}
                </form.Field>
              </Field>
              <Field label="Education">
                <form.Field name="education">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    >
                      <option value="">Select</option>
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
            </div>
            <Field label="Occupation">
              <form.Field name="occupation">
                {(field) => (
                  <Input
                    placeholder="Farmer / Business"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>
            <Field label="Contact Number">
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
            <Field label="Mobile Number">
              <form.Field name="mobileNumber">
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
            <Field label="Email">
              <form.Field name="email">
                {(field) => (
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>
            <Field label="Temporary Address">
              <form.Field name="temporaryAddress">
                {(field) => (
                  <Input
                    placeholder="Temporary address"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm font-medium text-gray-700">
              Genealogy Information — Fill 3 generations
            </p>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="text-xs font-medium text-gray-500">
                  {i === 0
                    ? "Grandfather/Grandmother"
                    : i === 1
                      ? "Father/Mother"
                      : "Husband/Wife"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name (English)">
                    <form.Field name={`genealogy_${i}_nameEn` as never}>
                      {(field) => (
                        <Input
                          placeholder="Name in English"
                          value={field.state.value as string}
                          onChange={(e) => field.handleChange(e.target.value as never)}
                          onBlur={field.handleBlur}
                        />
                      )}
                    </form.Field>
                  </Field>
                  <Field label="Name (Nepali)">
                    <form.Field name={`genealogy_${i}_nameNp` as never}>
                      {(field) => (
                        <Input
                          placeholder="नाम नेपालीमा"
                          value={field.state.value as string}
                          onChange={(e) => field.handleChange(e.target.value as never)}
                          onBlur={field.handleBlur}
                        />
                      )}
                    </form.Field>
                  </Field>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={() => {
                handleSave(form.state.values);
                setStep(step + 1);
              }}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Continue <ChevronRight size={16} />
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={() => {
                handleSave(form.state.values);
                submitMutation.mutate();
              }}
              disabled={submitMutation.isPending || saveMutation.isPending}
              className="flex-[2] rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {submitMutation.isPending ? "Submitting..." : "Save & Continue"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleSave(form.state.values)}
          disabled={saveMutation.isPending}
          className="w-full rounded-xl border border-gray-300 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
        >
          {saveMutation.isPending ? "Saving..." : "Save as Draft"}
        </button>
      </form>
    </div>
  );
}
