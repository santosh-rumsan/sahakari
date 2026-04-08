import { z } from "zod/v4";

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

export const phoneRegex = /^\+?[0-9]{10,15}$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
export const citizenshipRegex = /^[0-9-/\\_]+$/;

export const registerSchema = z.object({
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  fullName: z.string().min(1, "Full name required"),
  cooperative: z.string().min(1, "Cooperative name required"),
  passbookNumber: z.string().min(5, "Min 5 characters"),
  password: z
    .string()
    .regex(passwordRegex, "≥8 chars, 1 capital, 1 digit, 1 special"),
});

export const loginSchema = z.object({
  phone: z.string().regex(phoneRegex),
  password: z.string().min(1),
});

export const adminSendOtpSchema = z.object({
  email: z.string().email(),
});

export const adminVerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const genealogyEntrySchema = z.object({
  nameEn: z.string().optional(),
  surnameEn: z.string().optional(),
  nameNp: z.string().optional(),
  surnameNp: z.string().optional(),
  relation: z.string().optional(),
});

export const kycBasicInfoSchema = z.object({
  fullNameEn: z.string().optional(),
  fullNameNp: z.string().optional(),
  passbookNo: z.string().optional(),
  memberType: z.enum(MEMBER_TYPE).optional(),
  joinDate: z.string().optional(),
  gender: z.enum(GENDER).optional(),
  dob: z.string().optional(),
  citizenshipNumber: z.string().regex(citizenshipRegex).optional(),
  citizenshipIssuedDate: z.string().optional(),
  citizenshipIssuedDistrict: z.string().optional(),
  ninIdNumber: z.string().regex(citizenshipRegex).optional(),
  ninIssuedDate: z.string().optional(),
  ninIssuedDistrict: z.string().optional(),
  monthlyIncome: z.number().optional(),
  nationality: z.string().optional(),
  provinceId: z.string().optional(),
  districtId: z.string().optional(),
  municipalityId: z.string().optional(),
  wardNumber: z.number().int().min(1).max(35).optional(),
  tole: z.string().optional(),
  religion: z.enum(RELIGION).optional(),
  occupation: z.string().optional(),
  education: z.enum(EDUCATION).optional(),
  contactNumber: z.string().regex(phoneRegex).optional(),
  mobileNumber: z.string().regex(phoneRegex).optional(),
  email: z.string().email().optional(),
  temporaryAddress: z.string().optional(),
  shareholderNumber: z.string().optional(),
  genealogyJson: z.array(genealogyEntrySchema).optional(),
});

export const kycMandatorySchema = z.object({
  mandatoryName: z.string().optional(),
  mandatoryDob: z.string().optional(),
  mandatoryRelation: z.string().optional(),
  mandatoryAddress: z.string().optional(),
  mandatoryContactNumber: z.string().regex(phoneRegex).optional(),
  mandatorySignatureUrl: z.string().optional(),
  mandatoryPassportPhotoUrl: z.string().optional(),
});

export const kycNomineeSchema = z.object({
  nomineeName: z.string().optional(),
  nomineeDob: z.string().optional(),
  nomineeRelation: z.string().optional(),
  nomineeAddress: z.string().optional(),
  nomineeContactNumber: z.string().regex(phoneRegex).optional(),
  nomineeSignatureUrl: z.string().optional(),
  nomineePassportPhotoUrl: z.string().optional(),
});

export const kycSignatureSchema = z.object({
  digitalSignatureUrl: z.string().optional(),
  rightThumbUrl: z.string().optional(),
  leftThumbUrl: z.string().optional(),
  passportPhotoUrl: z.string().optional(),
});

export const loanPersonalInfoSchema = z.object({
  grandfatherNameNp: z.string().optional(),
  grandfatherNameEn: z.string().optional(),
  fatherNameNp: z.string().optional(),
  fatherNameEn: z.string().optional(),
  fullNameNp: z.string().optional(),
  fullNameEn: z.string().optional(),
  age: z.number().int().optional(),
  shareholderNumber: z.string().optional(),
  passbookNumber: z.string().optional(),
  contactNumber: z.string().regex(phoneRegex).optional(),
  citizenshipNumber: z.string().regex(citizenshipRegex).optional(),
  ninIdNumber: z.string().regex(citizenshipRegex).optional(),
});

export const loanDetailsSchema = z.object({
  loanAmount: z.number().positive().optional(),
  loanAmountInWords: z.string().optional(),
  purpose: z.enum(LOAN_PURPOSE).optional(),
  duration: z.enum(LOAN_DURATION).optional(),
  collateralType: z.enum(COLLATERAL_TYPE).optional(),
});

export const loanAddressSchema = z.object({
  province: z.string().optional(),
  districtId: z.string().optional(),
  municipalityId: z.string().optional(),
  wardNumber: z.number().int().min(1).max(35).optional(),
  tole: z.string().optional(),
});

export const loanTermsGuarantorSchema = z.object({
  termsAccepted: z.boolean().optional(),
  guarantorName: z.string().optional(),
  guarantorAddress: z.string().optional(),
  guarantorShareholderNumber: z.string().optional(),
  guaranteeAmount: z.number().optional(),
});

export const loanDocumentsSchema = z.object({
  passportPhotoUrl: z.string().optional(),
  citizenshipFrontUrl: z.string().optional(),
  citizenshipBackUrl: z.string().optional(),
  ninIdCardUrl: z.string().optional(),
  propertyDocumentUrl: z.string().optional(),
  salarySheetUrl: z.string().optional(),
});

export const reviewSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().optional(),
});
