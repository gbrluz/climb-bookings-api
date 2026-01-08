import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsPhoneNumber,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({
    description: 'Name of the club',
    example: 'Padel Club São Paulo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'City where the club is located',
    example: 'São Paulo',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State where the club is located',
    example: 'SP',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Opening time (HH:mm format)',
    example: '08:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Opening time must be in HH:mm format (e.g., "08:00")',
  })
  opening_time: string;

  @ApiProperty({
    description: 'Closing time (HH:mm format)',
    example: '22:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Closing time must be in HH:mm format (e.g., "22:00")',
  })
  closing_time: string;

  @ApiProperty({
    description: 'ZIP code (CEP) - Format: XXXXX-XXX or XXXXXXXX',
    example: '01310-100',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{5}-\d{3}|\d{8})$/, {
    message: 'ZIP code must be in format XXXXX-XXX or XXXXXXXX',
  })
  zip_code?: string;

  @ApiProperty({
    description: 'Whether the club has parking available',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  has_parking?: boolean;

  @ApiProperty({
    description: 'Full address of the club',
    example: 'Rua das Flores, 123 - Jardins',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+5511999999999',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Array of image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Latitude coordinate',
    example: -23.5505,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -46.6333,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
