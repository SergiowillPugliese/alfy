import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateShoppingListItemDto {
  @ApiProperty({
    description: 'Whether the item has been bought',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  bought: boolean;
}
