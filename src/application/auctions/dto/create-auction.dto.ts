import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsNumber,
  Min,
  Max,
  Matches,
  ArrayMinSize,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuctionDto {
  @ApiProperty({
    description: 'Array of player IDs participating in the auction',
    example: ['user-123', 'user-456'],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty()
  players: string[];

  @ApiProperty({
    description: 'City where the match will be played',
    example: 'São Paulo',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Date of the match (YYYY-MM-DD)',
    example: '2024-01-20',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Time of the match (HH:MM)',
    example: '18:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  })
  time: string;

  @ApiProperty({
    description: 'Player category/skill level',
    example: '4th Category',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Player latitude for finding nearby clubs',
    example: -23.5505,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    description: 'Player longitude for finding nearby clubs',
    example: -46.6333,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  lon: number;
}
