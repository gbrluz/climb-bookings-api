import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { Gender, PreferredSide } from '../../../domain/players/entities/player.entity';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Gender',
    enum: ['male', 'female', 'other'],
    example: 'male',
    required: false,
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: Gender;

  @ApiProperty({
    description: 'Birth date (YYYY-MM-DD)',
    example: '1990-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @ApiProperty({
    description: 'Preferred side',
    enum: ['left', 'right', 'both'],
    example: 'right',
    required: false,
  })
  @IsOptional()
  @IsEnum(['left', 'right', 'both'])
  preferred_side?: PreferredSide;

  @ApiProperty({
    description: 'Player category',
    example: '4ª',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'State',
    example: 'Rio Grande do Sul',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'City',
    example: 'Porto Alegre',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Availability schedule',
    example: {
      segunda: ['morning', 'afternoon'],
      terça: ['evening'],
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  availability?: any;

  @ApiProperty({
    description: 'Photo URL',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '(55) 98157-5459',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
