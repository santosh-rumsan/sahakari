import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { Prisma } from '@rs/db';

@Injectable()
export class KycService {
  private readonly requiredFields: Array<{ key: keyof Prisma.KycUncheckedCreateInput; label: string }> = [
    { key: 'fullNameEn', label: 'Full Name (English)' },
    { key: 'fullNameNp', label: 'Full Name (Nepali)' },
    { key: 'passbookNo', label: 'Passbook Number' },
    { key: 'memberType', label: 'Member Type' },
    { key: 'joinDate', label: 'Join Date' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'citizenshipNumber', label: 'Citizenship Number' },
    { key: 'citizenshipIssuedDate', label: 'Citizenship Issued Date' },
    { key: 'citizenshipIssuedDistrict', label: 'Citizenship Issued District' },
    { key: 'ninIdNumber', label: 'NIN ID Number' },
    { key: 'ninIssuedDate', label: 'NIN Issued Date' },
    { key: 'ninIssuedDistrict', label: 'NIN Issued District' },
    { key: 'monthlyIncome', label: 'Monthly Income' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'provinceId', label: 'Province' },
    { key: 'districtId', label: 'District' },
    { key: 'municipalityId', label: 'Municipality' },
    { key: 'wardNumber', label: 'Ward Number' },
    { key: 'tole', label: 'Tole' },
    { key: 'religion', label: 'Religion' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'education', label: 'Education' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'shareholderNumber', label: 'Shareholder Number' },
    { key: 'mandatoryName', label: 'Mandatory Nominee Name' },
    { key: 'mandatoryDob', label: 'Mandatory Nominee Date of Birth' },
    { key: 'mandatoryRelation', label: 'Mandatory Nominee Relation' },
    { key: 'mandatoryAddress', label: 'Mandatory Nominee Address' },
    { key: 'mandatoryContactNumber', label: 'Mandatory Nominee Contact Number' },
    { key: 'mandatorySignatureUrl', label: 'Mandatory Nominee Signature' },
    { key: 'mandatoryPassportPhotoUrl', label: 'Mandatory Nominee Passport Photo' },
    { key: 'nomineeName', label: 'Nominee Name' },
    { key: 'nomineeDob', label: 'Nominee Date of Birth' },
    { key: 'nomineeRelation', label: 'Nominee Relation' },
    { key: 'nomineeAddress', label: 'Nominee Address' },
    { key: 'nomineeContactNumber', label: 'Nominee Contact Number' },
    { key: 'nomineeSignatureUrl', label: 'Nominee Signature' },
    { key: 'nomineePassportPhotoUrl', label: 'Nominee Passport Photo' },
    { key: 'digitalSignatureUrl', label: 'Digital Signature' },
    { key: 'rightThumbUrl', label: 'Right Thumb' },
    { key: 'leftThumbUrl', label: 'Left Thumb' },
    { key: 'passportPhotoUrl', label: 'Passport Photo' },
  ];

  constructor(
    private prisma: PrismaService,
    private notif: NotificationService,
  ) {}

  private getMissingFields(kyc: Record<string, unknown>) {
    return this.requiredFields
      .filter(({ key }) => {
        const value = kyc[key];
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
      })
      .map(({ key, label }) => ({ field: key, label }));
  }

  async getMine(userId: string) {
    return this.prisma.kyc.findUnique({ where: { userId } });
  }

  async create(userId: string) {
    const existing = await this.prisma.kyc.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.kyc.create({ data: { userId } });
  }

  async updateBasicInfo(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async updateMandatory(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async updateNominee(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async updateSignature(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async submit(userId: string, id: string) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    if (!['DRAFT', 'REJECTED'].includes(kyc.status))
      throw new BadRequestException('KYC already submitted');

    const missingFields = this.getMissingFields(kyc as Record<string, unknown>);
    if (missingFields.length > 0) {
      throw new BadRequestException({
        message: 'Please fill all required KYC fields before submitting',
        errors: missingFields,
      });
    }

    return this.prisma.kyc.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });
  }

  async listAdmin(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const where = status ? { status: status as any } : {};
    const [data, total] = await Promise.all([
      this.prisma.kyc.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              fullName: true,
              cooperative: true,
              passbookNumber: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.kyc.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.kyc.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            fullName: true,
            cooperative: true,
            passbookNumber: true,
          },
        },
        district: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
      },
    });
  }

  async review(
    id: string,
    adminId: string,
    action: 'APPROVED' | 'REJECTED',
    reason?: string,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc) throw new NotFoundException('KYC not found');
    if (!['PENDING', 'UNDER_REVIEW'].includes(kyc.status)) {
      throw new BadRequestException('KYC cannot be reviewed in current state');
    }

    const updated = await this.prisma.kyc.update({
      where: { id },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedById: adminId,
        rejectionReason: action === 'REJECTED' ? (reason ?? null) : null,
      },
    });

    const title = action === 'APPROVED' ? 'KYC Approved' : 'KYC Rejected';
    const message =
      action === 'APPROVED'
        ? 'Your KYC has been approved. You can now apply for a loan.'
        : `Your KYC has been rejected.${reason ? ` Reason: ${reason}` : ''}`;

    await this.notif.send(kyc.userId, 'KYC_STATUS', title, message, true);

    return updated;
  }
}
