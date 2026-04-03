import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadService {
  private s3?: S3Client;
  private bucket = process.env.R2_BUCKET_NAME ?? 'sahakari-uploads';
  private publicUrl = process.env.R2_PUBLIC_URL ?? '';

  constructor() {
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

  async upload(base64Data: string): Promise<string> {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid base64 data');

    const ext = matches[1].split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');
    const key = `uploads/${randomBytes(16).toString('hex')}.${ext}`;

    if (!this.s3) {
      return `${this.publicUrl}/${key}`;
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: matches[1],
      }),
    );

    return `${this.publicUrl}/${key}`;
  }
}
