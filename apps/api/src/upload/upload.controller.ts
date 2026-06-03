import {
  BadRequestException,
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  async upload(@Request() req: any, @Body() body: { file: string }) {
    const contentType =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (req.headers['content-type'] as string | undefined) ?? '';

    if (
      typeof contentType === 'string' &&
      contentType.includes('multipart/form-data')
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const uploadedFile = await req.file();
      if (!uploadedFile) throw new BadRequestException('File is required');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const buffer = await uploadedFile.toBuffer();

      const url = await this.uploadService.uploadBuffer(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        buffer,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        uploadedFile.mimetype,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        uploadedFile.filename,
      );
      return { url };
    }

    if (!body?.file) throw new BadRequestException('File is required');

    const url = await this.uploadService.upload(body.file);
    return { url };
  }
}
