import {
  BadRequestException,
  Injectable,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { extname, join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';

@Injectable()
export class UploadService {
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]);

  private s3?: S3Client;
  private bucket = process.env.R2_BUCKET_NAME ?? 'sahakari-uploads';
  private r2PublicUrl = process.env.R2_PUBLIC_URL ?? '';
  private r2UploadPath = process.env.R2_UPLOAD_PATH ?? 'uploads';
  private maxUploadBytes = parseInt(process.env.MAX_UPLOAD_SIZE_BYTES ?? String(1 * 1024 * 1024), 10);

  /** Absolute path on disk. When set, files are stored locally instead of R2. */
  private localUploadPath = process.env.UPLOAD_LOCAL_PATH ?? '';
  private apiBaseUrl = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;

  constructor() {
    if (this.localUploadPath) {
      mkdirSync(this.localUploadPath, { recursive: true });
      return;
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  private getExtension(contentType: string, filename?: string): string {
    if (contentType === 'application/pdf') return 'pdf';
    if (contentType === 'image/jpeg' || contentType === 'image/jpg') return 'jpg';
    if (contentType === 'image/png') return 'png';
    if (contentType === 'image/webp') return 'webp';

    const fileExt = filename ? extname(filename).replace('.', '').toLowerCase() : '';
    return fileExt || 'bin';
  }

  private async saveLocally(buffer: Buffer, filename: string): Promise<string> {
    const filePath = join(this.localUploadPath, filename);
    writeFileSync(filePath, buffer);
    return `${this.apiBaseUrl}/v1/uploads/${filename}`;
  }

  async uploadBuffer(
    buffer: Buffer,
    contentType: string,
    filename?: string,
  ): Promise<string> {
    if (!this.allowedMimeTypes.has(contentType)) {
      throw new UnsupportedMediaTypeException(
        'Only JPG, PNG, WEBP, and PDF files are supported',
      );
    }

    if (buffer.byteLength > this.maxUploadBytes) {
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${this.maxUploadBytes} bytes`,
      );
    }

    const ext = this.getExtension(contentType, filename);
    const name = `${randomBytes(16).toString('hex')}.${ext}`;

    if (this.localUploadPath) {
      return this.saveLocally(buffer, name);
    }

    const key = `${this.r2UploadPath}/${name}`;

    if (!this.s3) {
      return `${this.r2PublicUrl}/${key}`;
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `${this.r2PublicUrl}/${key}`;
  }

  async upload(base64Data: string): Promise<string> {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new BadRequestException('Invalid base64 data');

    const buffer = Buffer.from(matches[2], 'base64');
    return this.uploadBuffer(buffer, matches[1]);
  }
}
