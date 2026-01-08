import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimAuctionDto {
  @ApiProperty({
    description: 'ID of the club claiming the auction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  clubId: string;

  @ApiProperty({
    description: 'ID of the court where the match will be played',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  courtId: string;
}
