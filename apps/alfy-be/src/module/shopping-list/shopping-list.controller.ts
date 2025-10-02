import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { CreateShoppingListDTO } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { 
  ShoppingListResponseDto, 
  ShoppingListArrayResponseDto, 
  DeleteResponseDto 
} from './dto/shopping-list-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SharingLevel } from '../../common/enums/roles.enum';

@ApiTags('Shopping List')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
  create(
    @Body() createShoppingListDto: CreateShoppingListDTO,
    @Request() req,
    @Query('familyId') familyId: string,
    @Query('sharingLevel') sharingLevel?: SharingLevel,
    @Query('sharedWithUsers') sharedWithUsers?: string,
  ) {
    const sharedUsers = sharedWithUsers ? sharedWithUsers.split(',') : [];
    return this.shoppingListService.create(
      createShoppingListDto,
      req.user.sub,
      familyId,
      sharingLevel || SharingLevel.PRIVATE,
      sharedUsers
    );
  }

  @ApiOperation({ summary: 'Get all shopping lists' })
  @ApiResponse({
    status: 200,
    description: 'List of all shopping lists',
    type: ShoppingListArrayResponseDto,
  })
  @Get()
  findAll(@Request() req, @Query('familyId') familyId: string) {
    return this.shoppingListService.findAll(req.user.sub, familyId);
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
  findOne(@Param('id') id: string, @Request() req) {
    return this.shoppingListService.findOne(id, req.user.sub);
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
    @Request() req,
  ) {
    return this.shoppingListService.update(id, updateShoppingListDto, req.user.sub);
  }

  @ApiOperation({ summary: 'Update a specific item in a shopping list' })
  @ApiResponse({
    status: 200,
    description: 'Item successfully updated',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Shopping list or item not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateShoppingListItemDto,
    @Request() req,
  ) {
    return this.shoppingListService.updateItem(id, itemId, updateItemDto, req.user.sub);
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
  remove(@Param('id') id: string, @Request() req) {
    return this.shoppingListService.remove(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Delete a specific item in a shopping list' })
  @ApiResponse({
    status: 200,
    description: 'Item successfully deleted',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Shopping list or item not found',
  })
  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string, @Request() req) {
    return this.shoppingListService.removeItem(id, itemId, req.user.sub);
  }
}
