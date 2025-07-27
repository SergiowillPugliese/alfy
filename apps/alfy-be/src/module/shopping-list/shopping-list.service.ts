import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShoppingListDTO } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ShoppingList } from './entities/shopping-list.entity';
import { Model } from 'mongoose';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectModel(ShoppingList.name)
    private shoppingListModel: Model<ShoppingList>,
  ) {}

  async create(
    createShoppingListDto: CreateShoppingListDTO,
  ): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      const shoppingList = new this.shoppingListModel(createShoppingListDto);
      const savedShoppingList = await shoppingList.save();

      return {
        success: true,
        message: 'Shopping list created successfully',
        data: savedShoppingList,
      };
    } catch (error) {
      // Se l'errore è un problema di validazione o altro, lancia un'eccezione esplicita
      console.error('Error creating shopping list:', error);

      // Usa HttpException per restituire un errore con codice HTTP 400 o 500
      throw new HttpException(
        {
          success: false,
          message: 'Shopping list creation failed. ' + error.message,
          data: null,
        },
        HttpStatus.BAD_REQUEST, // O HTTP_STATUS.INTERNAL_SERVER_ERROR a seconda del caso
      );
    }
  }

  async findAll() {
    try {
      const shoppingList = await this.shoppingListModel.find();
      return {
        success: true,
        message: 'Shopping list fetched successfully',
        data: shoppingList,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Shopping list fetching failed. ' + error.message,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} shoppingList`;
  }

  update(id: number, updateShoppingListDto: UpdateShoppingListDto) {
    return `This action updates a #${id} shoppingList`;
  }

  remove(id: number) {
    return `This action removes a #${id} shoppingList`;
  }
}
