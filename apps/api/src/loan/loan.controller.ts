import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('loans')
@Controller('loans')
export class LoanController {
  constructor(private loan: LoanService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  listMine(@Request() req: any) {
    return this.loan.listMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  getOne(@Param('id') id: string, @Request() req: any) {
    return this.loan.getByIdForMember(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  create(@Request() req: any) {
    return this.loan.create(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/personal-info')
  @ApiBearerAuth()
  updatePersonalInfo(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.loan.updatePersonalInfo(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/loan-details')
  @ApiBearerAuth()
  updateLoanDetails(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.loan.updateLoanDetails(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/address')
  @ApiBearerAuth()
  updateAddress(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.loan.updateAddress(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/terms-guarantor')
  @ApiBearerAuth()
  updateTermsGuarantor(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.loan.updateTermsGuarantor(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/documents')
  @ApiBearerAuth()
  updateDocuments(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.loan.updateDocuments(req.user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  @ApiBearerAuth()
  submit(@Param('id') id: string, @Request() req: any) {
    return this.loan.submit(req.user.sub, id);
  }
}
