import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
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
    const url = await this.uploadService.upload(body.file);
    return { url };
  }
}
