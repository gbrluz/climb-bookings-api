import { IsUUID, IsDateString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'UUID of the court to book',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  court_id: string;

  @ApiProperty({
    description: 'Start time of the booking in ISO 8601 format',
    example: '2024-01-15T14:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    description: 'End time of the booking in ISO 8601 format',
    example: '2024-01-15T15:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({
    description: 'Price for the booking (optional)',
    example: 150.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
