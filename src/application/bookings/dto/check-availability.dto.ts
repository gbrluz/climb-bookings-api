import { IsUUID, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'UUID of the court',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  courtId: string;

  @ApiProperty({
    description: 'Date to check availability (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
