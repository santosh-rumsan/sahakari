import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePassbookDto {
  @ApiProperty({
    description: 'User ID for whom the passbook is being created',
    example: 'clx1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Opening balance for the passbook',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  openingBalance?: number;

  @ApiProperty({
    description: 'Current balance (defaults to opening balance)',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentBalance?: number;

  @ApiProperty({
    description: 'Interest rate on savings (percentage)',
    example: 5.0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRateSavings?: number;

  @ApiProperty({
    description: 'Interest rate on loans (percentage)',
    example: 12.0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRateLoan?: number;
}
