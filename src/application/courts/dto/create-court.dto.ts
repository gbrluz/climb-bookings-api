import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourtDto {
  @ApiProperty({
    description: 'Name of the court',
    example: 'Quadra Central',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of court (padel, tenis, areia, beach tennis, etc.)',
    example: 'padel',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Whether the court is indoor',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_indoor: boolean;

  @ApiProperty({
    description: 'Base price per slot',
    example: 150.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  base_price: number;

  @ApiProperty({
    description: 'Duration of each time slot in minutes (must be between 30-180 and multiple of 15)',
    example: 90,
  })
  @IsNumber()
  @Min(30)
  @IsNotEmpty()
  slot_duration: number;

  @ApiProperty({
    description: 'Whether the court is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
