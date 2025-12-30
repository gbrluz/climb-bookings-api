import { IsString, IsNotEmpty, IsISO8601, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  court_id: string;

  @IsISO8601() // Garante formato de data válido (ex: 2025-12-30T20:00:00Z)
  @IsNotEmpty()
  start_time: string;

  @IsISO8601()
  @IsNotEmpty()
  end_time: string;
}