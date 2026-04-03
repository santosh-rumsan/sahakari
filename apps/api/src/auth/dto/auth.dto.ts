import { IsString, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '9779810223471' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'Surpana Surkheti' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'Chandragiri Saving & Credit Cooperatives Limited' })
  @IsString()
  cooperative!: string;

  @ApiProperty({ example: 'PASS1' })
  @IsString()
  @MinLength(5)
  passbookNumber!: string;

  @ApiProperty({ example: 'Pass@1234' })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must have 1 capital, 1 digit, 1 special char',
  })
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: '9779810223471' })
  @IsString()
  phone!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class AdminSendOtpDto {
  @ApiProperty({ example: 'admin@cooperative.com' })
  @IsEmail()
  email!: string;
}

export class AdminVerifyOtpDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  @Matches(/^[0-9]{6}$/)
  otp!: string;
}
