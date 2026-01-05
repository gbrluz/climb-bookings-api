import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Username (unique)',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Player category',
    example: 'intermediate',
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
