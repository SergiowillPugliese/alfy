import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/baseResponce.dto';
import { ShoppingList } from '../entities/shopping-list.entity';

export class ShoppingListResponseDto extends BaseResponseDto<ShoppingList> {
  @ApiProperty({ type: ShoppingList, required: false })
  data?: ShoppingList;
}

export class ShoppingListArrayResponseDto extends BaseResponseDto<ShoppingList[]> {
  @ApiProperty({ type: [ShoppingList], required: false })
  data?: ShoppingList[];
}

export class DeleteResponseDto extends BaseResponseDto<null> {
  @ApiProperty({ type: 'null', required: false })
  data?: null;
}