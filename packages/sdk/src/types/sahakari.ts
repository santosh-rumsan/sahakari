export const GENDER = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDER)[number];

export const MEMBER_TYPE = ["ORDINARY", "SHAREHOLDER"] as const;
export type MemberType = (typeof MEMBER_TYPE)[number];

export const RELIGION = [
  "HINDU",
  "MUSLIM",
  "BUDDHIST",
  "CHRISTIAN",
  "OTHER",
] as const;
export type Religion = (typeof RELIGION)[number];

export const EDUCATION = [
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
] as const;
export type Education = (typeof EDUCATION)[number];

export const RELATION_TYPE = [
  "GRANDFATHER",
  "GRANDMOTHER",
  "FATHER",
  "MOTHER",
  "HUSBAND",
  "WIFE",
  "SON",
  "DAUGHTER",
] as const;
export type RelationType = (typeof RELATION_TYPE)[number];

export const KYC_STATUS = [
  "DRAFT",
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;
export type KycStatus = (typeof KYC_STATUS)[number];

export const LOAN_PURPOSE = [
  "AGRICULTURE",
  "SMALL_BUSINESS",
  "PERSONAL",
  "EDUCATION",
  "HEALTH",
  "HOUSE_REPAIR",
] as const;
export type LoanPurpose = (typeof LOAN_PURPOSE)[number];

export const LOAN_DURATION = [
  "SIX_MONTHS",
  "ONE_YEAR",
  "TWO_YEARS",
  "THREE_YEARS",
  "FOUR_YEARS_PLUS",
] as const;
export type LoanDuration = (typeof LOAN_DURATION)[number];

export const COLLATERAL_TYPE = ["WITH", "WITHOUT"] as const;
export type CollateralType = (typeof COLLATERAL_TYPE)[number];

export const LOAN_STATUS = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;
export type LoanStatus = (typeof LOAN_STATUS)[number];

export const ADMIN_ROLE = ["ADMIN", "SUPER_ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLE)[number];

export const NOTIFICATION_TYPE = [
  "KYC_STATUS",
  "LOAN_STATUS",
  "GENERAL",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE)[number];

export interface GenealogyEntry {
  nameEn: string;
  nameNp: string;
  relation: RelationType;
}

export interface Province {
  id: string;
  name: string;
  nameNp: string;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  id: string;
  name: string;
  nameNp: string;
  provinceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Municipality {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  districtId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  phone: string;
  fullName: string;
  cooperative: string;
  passbookNumber: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Kyc {
  id: string;
  userId: string;
  fullNameEn?: string;
  fullNameNp?: string;
  passbookNo?: string;
  memberType?: MemberType;
  joinDate?: string;
  gender?: Gender;
  dob?: string;
  citizenshipNumber?: string;
  citizenshipIssuedDate?: string;
  citizenshipIssuedDistrict?: string;
  ninIdNumber?: string;
  ninIssuedDate?: string;
  ninIssuedDistrict?: string;
  monthlyIncome?: number;
  nationality?: string;
  provinceId?: string;
  districtId?: string;
  municipalityId?: string;
  wardNumber?: number;
  tole?: string;
  religion?: Religion;
  occupation?: string;
  education?: Education;
  contactNumber?: string;
  mobileNumber?: string;
  email?: string;
  temporaryAddress?: string;
  shareholderNumber?: string;
  genealogyJson?: GenealogyEntry[];
  mandatoryName?: string;
  mandatoryDob?: string;
  mandatoryRelation?: string;
  mandatoryAddress?: string;
  mandatoryContactNumber?: string;
  mandatorySignatureUrl?: string;
  mandatoryPassportPhotoUrl?: string;
  nomineeName?: string;
  nomineeDob?: string;
  nomineeRelation?: string;
  nomineeAddress?: string;
  nomineeContactNumber?: string;
  nomineeSignatureUrl?: string;
  nomineePassportPhotoUrl?: string;
  digitalSignatureUrl?: string;
  rightThumbUrl?: string;
  leftThumbUrl?: string;
  passportPhotoUrl?: string;
  status: KycStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedById?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  referenceNumber: string;
  grandfatherNameNp?: string;
  grandfatherNameEn?: string;
  fatherNameNp?: string;
  fatherNameEn?: string;
  fullNameNp?: string;
  fullNameEn?: string;
  age?: number;
  shareholderNumber?: string;
  passbookNumber?: string;
  contactNumber?: string;
  citizenshipNumber?: string;
  ninIdNumber?: string;
  loanAmount?: number;
  loanAmountInWords?: string;
  purpose?: LoanPurpose;
  duration?: LoanDuration;
  collateralType?: CollateralType;
  province?: string;
  districtId?: string;
  municipalityId?: string;
  wardNumber?: number;
  tole?: string;
  termsAccepted?: boolean;
  guarantorName?: string;
  guarantorAddress?: string;
  guarantorShareholderNumber?: string;
  guaranteeAmount?: number;
  passportPhotoUrl?: string;
  citizenshipFrontUrl?: string;
  citizenshipBackUrl?: string;
  ninIdCardUrl?: string;
  propertyDocumentUrl?: string;
  salarySheetUrl?: string;
  status: LoanStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedById?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Passbook {
  id: string;
  userId: string;
  currentBalance: number;
  totalSavings: number;
  totalWithdrawals: number;
  interestRateSavings: number;
  interestRateLoan: number;
  createdAt: string;
  updatedAt: string;
}

export interface PassbookTransaction {
  id: string;
  passbookId: string;
  type: string;
  amount: number;
  description?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  user: User;
}

export interface AdminAuthToken {
  accessToken: string;
  admin: AdminUser;
}
