-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('ORDINARY', 'SHAREHOLDER');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('HINDU', 'MUSLIM', 'BUDDHIST', 'CHRISTIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "Education" AS ENUM ('ILLITERATE', 'LITERATE', 'PRIMARY', 'SECONDARY', 'SLC_SEE', 'INTERMEDIATE', 'BACHELOR', 'DIPLOMA', 'MASTER', 'DOCTORATE');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('GRANDFATHER', 'GRANDMOTHER', 'FATHER', 'MOTHER', 'HUSBAND', 'WIFE', 'SON', 'DAUGHTER');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LoanPurpose" AS ENUM ('AGRICULTURE', 'SMALL_BUSINESS', 'PERSONAL', 'EDUCATION', 'HEALTH', 'HOUSE_REPAIR');

-- CreateEnum
CREATE TYPE "LoanDuration" AS ENUM ('SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS', 'FOUR_YEARS_PLUS');

-- CreateEnum
CREATE TYPE "CollateralType" AS ENUM ('WITH', 'WITHOUT');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PassbookTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'LOAN_DISBURSEMENT', 'INTEREST_CREDIT', 'FEE_DEDUCTION', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('KYC_STATUS', 'LOAN_STATUS', 'GENERAL');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT 'Lead',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "avatar" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "website" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooperative" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "provinceId" TEXT,
    "districtId" TEXT,
    "municipalityId" TEXT,
    "wardNumber" INTEGER,
    "tole" TEXT,
    "address" TEXT,
    "establishedYear" TIMESTAMP(3),
    "panNumber" TEXT,
    "registrationNumber" TEXT,
    "logoUrl" TEXT,
    "email" TEXT,
    "contactNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNp" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MUNICIPALITY',
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "passbookNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kyc" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullNameEn" TEXT,
    "fullNameNp" TEXT,
    "passbookNo" TEXT,
    "memberType" "MemberType",
    "joinDate" TIMESTAMP(3),
    "gender" "Gender",
    "dob" TIMESTAMP(3),
    "citizenshipNumber" TEXT,
    "citizenshipIssuedDate" TIMESTAMP(3),
    "citizenshipIssuedDistrict" TEXT,
    "ninIdNumber" TEXT,
    "ninIssuedDate" TIMESTAMP(3),
    "ninIssuedDistrict" TEXT,
    "monthlyIncome" DOUBLE PRECISION,
    "nationality" TEXT,
    "provinceId" TEXT,
    "districtId" TEXT,
    "municipalityId" TEXT,
    "wardNumber" INTEGER,
    "tole" TEXT,
    "religion" "Religion",
    "occupation" TEXT,
    "education" "Education",
    "contactNumber" TEXT,
    "mobileNumber" TEXT,
    "email" TEXT,
    "temporaryAddress" TEXT,
    "shareholderNumber" TEXT,
    "genealogyJson" JSONB,
    "mandatoryName" TEXT,
    "mandatoryDob" TIMESTAMP(3),
    "mandatoryRelation" TEXT,
    "mandatoryAddress" TEXT,
    "mandatoryContactNumber" TEXT,
    "mandatorySignatureUrl" TEXT,
    "mandatoryPassportPhotoUrl" TEXT,
    "nomineeName" TEXT,
    "nomineeDob" TIMESTAMP(3),
    "nomineeRelation" TEXT,
    "nomineeAddress" TEXT,
    "nomineeContactNumber" TEXT,
    "nomineeSignatureUrl" TEXT,
    "nomineePassportPhotoUrl" TEXT,
    "digitalSignatureUrl" TEXT,
    "rightThumbUrl" TEXT,
    "leftThumbUrl" TEXT,
    "passportPhotoUrl" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "grandfatherNameNp" TEXT,
    "grandfatherNameEn" TEXT,
    "fatherNameNp" TEXT,
    "fatherNameEn" TEXT,
    "fullNameNp" TEXT,
    "fullNameEn" TEXT,
    "age" INTEGER,
    "shareholderNumber" TEXT,
    "passbookNumber" TEXT,
    "contactNumber" TEXT,
    "citizenshipNumber" TEXT,
    "ninIdNumber" TEXT,
    "loanAmount" DOUBLE PRECISION,
    "loanAmountInWords" TEXT,
    "purpose" "LoanPurpose",
    "duration" "LoanDuration",
    "collateralType" "CollateralType",
    "paymentFrequency" "PaymentFrequency",
    "numberOfInstallments" INTEGER,
    "province" TEXT,
    "districtId" TEXT,
    "municipalityId" TEXT,
    "wardNumber" INTEGER,
    "tole" TEXT,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "guarantorName" TEXT,
    "guarantorAddress" TEXT,
    "guarantorShareholderNumber" TEXT,
    "guaranteeAmount" DOUBLE PRECISION,
    "passportPhotoUrl" TEXT,
    "citizenshipFrontUrl" TEXT,
    "citizenshipBackUrl" TEXT,
    "ninIdCardUrl" TEXT,
    "propertyDocumentUrl" TEXT,
    "salarySheetUrl" TEXT,
    "status" "LoanStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "isDisbursed" BOOLEAN NOT NULL DEFAULT false,
    "disbursedAmount" DOUBLE PRECISION,
    "disbursedDate" TIMESTAMP(3),
    "interestRate" DOUBLE PRECISION,
    "outstandingBalance" DOUBLE PRECISION,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lateFeePercentage" DOUBLE PRECISION DEFAULT 2,
    "gracePeriodDays" INTEGER DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanInstallment" (
    "id" TEXT NOT NULL,
    "loanApplicationId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "principalAmount" DOUBLE PRECISION NOT NULL,
    "interestAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidDate" TIMESTAMP(3),
    "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysPastDue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "cooperativeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminOtp" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userId" TEXT,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passbook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWithdrawals" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interestRateSavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interestRateLoan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastInterestCreditedAt" TIMESTAMP(3),
    "lastInterestMonth" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Passbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassbookTransaction" (
    "id" TEXT NOT NULL,
    "passbookId" TEXT NOT NULL,
    "type" "PassbookTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "loanApplicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PassbookTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_name_key" ON "Cooperative"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_code_key" ON "Cooperative"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_panNumber_key" ON "Cooperative"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_registrationNumber_key" ON "Cooperative"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_email_key" ON "Cooperative"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_provinceId_name_key" ON "District"("provinceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_districtId_name_key" ON "Municipality"("districtId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_passbookNumber_key" ON "User"("passbookNumber");

-- CreateIndex
CREATE INDEX "User_cooperativeId_idx" ON "User"("cooperativeId");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_userId_key" ON "Kyc"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_citizenshipNumber_key" ON "Kyc"("citizenshipNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_ninIdNumber_key" ON "Kyc"("ninIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LoanApplication_referenceNumber_key" ON "LoanApplication"("referenceNumber");

-- CreateIndex
CREATE INDEX "LoanInstallment_loanApplicationId_idx" ON "LoanInstallment"("loanApplicationId");

-- CreateIndex
CREATE INDEX "LoanInstallment_dueDate_idx" ON "LoanInstallment"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "LoanInstallment_loanApplicationId_installmentNumber_key" ON "LoanInstallment"("loanApplicationId", "installmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_cooperativeId_idx" ON "AdminUser"("cooperativeId");

-- CreateIndex
CREATE UNIQUE INDEX "Passbook_userId_key" ON "Passbook"("userId");

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipality" ADD CONSTRAINT "Municipality_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanInstallment" ADD CONSTRAINT "LoanInstallment_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminOtp" ADD CONSTRAINT "AdminOtp_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminOtp" ADD CONSTRAINT "AdminOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passbook" ADD CONSTRAINT "Passbook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassbookTransaction" ADD CONSTRAINT "PassbookTransaction_passbookId_fkey" FOREIGN KEY ("passbookId") REFERENCES "Passbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassbookTransaction" ADD CONSTRAINT "PassbookTransaction_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
