import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/types';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private kyc: KycService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  getMine(@Request() req: AuthRequest) {
    return this.kyc.getMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  create(@Request() req: AuthRequest) {
    return this.kyc.create(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/basic-info')
  @ApiBearerAuth()
  updateBasicInfo(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.kyc.updateBasicInfo(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/mandatory')
  @ApiBearerAuth()
  updateMandatory(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.kyc.updateMandatory(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/nominee')
  @ApiBearerAuth()
  updateNominee(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.kyc.updateNominee(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/signature')
  @ApiBearerAuth()
  updateSignature(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.kyc.updateSignature(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  @ApiBearerAuth()
  submit(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.kyc.submit(req.user.sub, id);
  }
}
