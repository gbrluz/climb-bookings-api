import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlayerDto {
  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    description: 'Player category',
    example: 'advanced',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+5511999999999',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
