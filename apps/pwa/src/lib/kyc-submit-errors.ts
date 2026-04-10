import { getStorageItem, removeStorageItem, setStorageItem } from "./storage";

export type KycSubmitFieldError = { field: string; label: string };
export type KycRoutePath =
  | "/app/kyc/basic-info"
  | "/app/kyc/mandatory"
  | "/app/kyc/nominee"
  | "/app/kyc/signature";

const KYC_SUBMIT_ERRORS_KEY = "kyc_submit_errors";

const fieldRouteMap: Record<string, KycRoutePath> = {
  fullNameEn: "/app/kyc/basic-info",
  fullNameNp: "/app/kyc/basic-info",
  passbookNo: "/app/kyc/basic-info",
  memberType: "/app/kyc/basic-info",
  joinDate: "/app/kyc/basic-info",
  gender: "/app/kyc/basic-info",
  dob: "/app/kyc/basic-info",
  citizenshipNumber: "/app/kyc/basic-info",
  citizenshipIssuedDate: "/app/kyc/basic-info",
  citizenshipIssuedDistrict: "/app/kyc/basic-info",
  ninIdNumber: "/app/kyc/basic-info",
  ninIssuedDate: "/app/kyc/basic-info",
  ninIssuedDistrict: "/app/kyc/basic-info",
  monthlyIncome: "/app/kyc/basic-info",
  nationality: "/app/kyc/basic-info",
  provinceId: "/app/kyc/basic-info",
  districtId: "/app/kyc/basic-info",
  municipalityId: "/app/kyc/basic-info",
  wardNumber: "/app/kyc/basic-info",
  tole: "/app/kyc/basic-info",
  religion: "/app/kyc/basic-info",
  occupation: "/app/kyc/basic-info",
  education: "/app/kyc/basic-info",
  contactNumber: "/app/kyc/basic-info",
  mobileNumber: "/app/kyc/basic-info",
  shareholderNumber: "/app/kyc/basic-info",
  mandatoryName: "/app/kyc/mandatory",
  mandatoryDob: "/app/kyc/mandatory",
  mandatoryRelation: "/app/kyc/mandatory",
  mandatoryAddress: "/app/kyc/mandatory",
  mandatoryContactNumber: "/app/kyc/mandatory",
  mandatorySignatureUrl: "/app/kyc/mandatory",
  mandatoryPassportPhotoUrl: "/app/kyc/mandatory",
  nomineeName: "/app/kyc/nominee",
  nomineeDob: "/app/kyc/nominee",
  nomineeRelation: "/app/kyc/nominee",
  nomineeAddress: "/app/kyc/nominee",
  nomineeContactNumber: "/app/kyc/nominee",
  nomineeSignatureUrl: "/app/kyc/nominee",
  nomineePassportPhotoUrl: "/app/kyc/nominee",
  digitalSignatureUrl: "/app/kyc/signature",
  rightThumbUrl: "/app/kyc/signature",
  leftThumbUrl: "/app/kyc/signature",
  passportPhotoUrl: "/app/kyc/signature",
};

export function getStoredKycSubmitErrors(): KycSubmitFieldError[] {
  try {
    const raw = getStorageItem(KYC_SUBMIT_ERRORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function storeKycSubmitErrors(errors: KycSubmitFieldError[]) {
  setStorageItem(KYC_SUBMIT_ERRORS_KEY, JSON.stringify(errors));
}

export function clearKycSubmitErrors() {
  removeStorageItem(KYC_SUBMIT_ERRORS_KEY);
}

export function getKycSubmitErrorsForRoute(route: KycRoutePath) {
  return getStoredKycSubmitErrors().filter((error) => fieldRouteMap[error.field] === route);
}

export function getFirstKycErrorRoute(errors: KycSubmitFieldError[]): KycRoutePath {
  const first = errors.find((error) => fieldRouteMap[error.field]);
  return first ? fieldRouteMap[first.field] : "/app/kyc/basic-info";
}
