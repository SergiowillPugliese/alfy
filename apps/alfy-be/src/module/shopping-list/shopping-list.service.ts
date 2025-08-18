import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShoppingListDTO } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
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

  async findOne(id: string): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      const shoppingList = await this.shoppingListModel.findById(id);
      
      if (!shoppingList) {
        throw new HttpException(
          {
            success: false,
            message: 'Shopping list not found',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Shopping list fetched successfully',
        data: shoppingList,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
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

  async update(id: string, updateShoppingListDto: UpdateShoppingListDto): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      const updatedShoppingList = await this.shoppingListModel.findByIdAndUpdate(
        id,
        updateShoppingListDto,
        { new: true, runValidators: true }
      );

      if (!updatedShoppingList) {
        throw new HttpException(
          {
            success: false,
            message: 'Shopping list not found',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Shopping list updated successfully',
        data: updatedShoppingList,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Shopping list update failed. ' + error.message,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //metodo che aggiorna il singolo item e lo setta come acquistato o non acquistato quando dal frontend viene cliccato il checkbox
  async updateItem(id: string, itemId: string, updateItemDto: UpdateShoppingListItemDto): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      // Trova la shopping list
      const shoppingList = await this.shoppingListModel.findById(id);
      if (!shoppingList) {
        throw new HttpException(
          { success: false, message: 'Shopping list not found', data: null },
          HttpStatus.NOT_FOUND
        );
      }

      // Trova l'item specifico
      const itemIndex = shoppingList.list.findIndex(item => item._id.toString() === itemId);
      if (itemIndex === -1) {
        throw new HttpException(
          { success: false, message: 'Item not found', data: null },
          HttpStatus.NOT_FOUND
        );
      }

      // Aggiorna solo l'item specifico
      shoppingList.list[itemIndex].bought = updateItemDto.bought;
      
      // Salva la shopping list aggiornata
      const updatedShoppingList = await shoppingList.save();

      return {
        success: true,
        message: 'Item updated successfully',
        data: updatedShoppingList,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Item update failed. ' + error.message,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<BaseResponseDto<null>> {
    try {
      const deletedShoppingList = await this.shoppingListModel.findByIdAndDelete(id);

      if (!deletedShoppingList) {
        throw new HttpException(
          {
            success: false,
            message: 'Shopping list not found',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Shopping list deleted successfully',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Shopping list deletion failed. ' + error.message,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
