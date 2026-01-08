import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourtDto {
  @ApiProperty({
    description: 'Court name',
    example: 'Court 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Base price per hour',
    example: 150.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  base_price?: number;

  @ApiProperty({
    description: 'Whether the court is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
