import { PartialType } from '@nestjs/swagger';
import { CreateShoppingListDTO } from './create-shopping-list.dto';

export class UpdateShoppingListDto extends PartialType(CreateShoppingListDTO) {}
