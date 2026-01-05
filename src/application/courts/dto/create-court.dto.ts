import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SurfaceType } from '../../../domain/courts/entities/court.entity';

export class CreateCourtDto {
  @ApiProperty({
    description: 'Name of the court',
    example: 'Court 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of surface',
    enum: SurfaceType,
    example: SurfaceType.GLASS,
  })
  @IsEnum(SurfaceType)
  @IsNotEmpty()
  surface_type: SurfaceType;

  @ApiProperty({
    description: 'Whether the court is indoor',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_indoor: boolean;

  @ApiProperty({
    description: 'Base price per hour',
    example: 150.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  base_price: number;

  @ApiProperty({
    description: 'Whether the court is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
