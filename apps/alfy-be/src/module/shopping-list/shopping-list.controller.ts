import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { CreateShoppingListDTO } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { 
  ShoppingListResponseDto, 
  ShoppingListArrayResponseDto, 
  DeleteResponseDto 
} from './dto/shopping-list-response.dto';

@ApiTags('Shopping List')
@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @ApiOperation({ summary: 'Create a new shopping list' })
  @ApiResponse({
    status: 201,
    description: 'Shopping list successfully created',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @Post()
  create(@Body() createShoppingListDto: CreateShoppingListDTO) {
    return this.shoppingListService.create(createShoppingListDto);
  }

  @ApiOperation({ summary: 'Get all shopping lists' })
  @ApiResponse({
    status: 200,
    description: 'List of all shopping lists',
    type: ShoppingListArrayResponseDto,
  })
  @Get()
  findAll() {
    return this.shoppingListService.findAll();
  }

  @ApiOperation({ summary: 'Get a shopping list by id' })
  @ApiResponse({
    status: 200,
    description: 'Shopping list found',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Shopping list not found',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shoppingListService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a shopping list by id' })
  @ApiResponse({
    status: 200,
    description: 'Shopping list successfully updated',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Shopping list not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShoppingListDto: UpdateShoppingListDto,
  ) {
    return this.shoppingListService.update(id, updateShoppingListDto);
  }

  @ApiOperation({ summary: 'Delete a shopping list by id' })
  @ApiResponse({
    status: 200,
    description: 'Shopping list successfully deleted',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Shopping list not found',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shoppingListService.remove(id);
  }
}
