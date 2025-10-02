import { HttpException, HttpStatus, Injectable, ForbiddenException } from '@nestjs/common';
import { CreateShoppingListDTO } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ShoppingList } from './entities/shopping-list.entity';
import { Model, Types } from 'mongoose';
import { BaseResponseDto } from '../../common/dto/baseResponce.dto';
import { ResourceSharingService } from '../../common/services/resource-sharing.service';
import { SharingLevel } from '../../common/enums/roles.enum';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectModel(ShoppingList.name)
    private shoppingListModel: Model<ShoppingList>,
    private resourceSharingService: ResourceSharingService,
  ) {}

  async create(
    createShoppingListDto: CreateShoppingListDTO,
    userId: string,
    familyId: string,
    sharingLevel: SharingLevel = SharingLevel.PRIVATE,
    sharedWithUsers: string[] = []
  ): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      const shoppingListData = {
        ...createShoppingListDto,
        ownerId: new Types.ObjectId(userId),
        familyId: new Types.ObjectId(familyId),
      };

      const shoppingList = new this.shoppingListModel(shoppingListData);
      const savedShoppingList = await shoppingList.save();

      // Create resource sharing entry
      await this.resourceSharingService.createResourceSharing(
        savedShoppingList._id.toString(),
        'shopping-list',
        userId,
        familyId,
        sharingLevel,
        sharedWithUsers
      );

      return {
        success: true,
        message: 'Shopping list created successfully',
        data: savedShoppingList,
      };
    } catch (error) {
      console.error('Error creating shopping list:', error);

      throw new HttpException(
        {
          success: false,
          message: 'Shopping list creation failed. ' + error.message,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(userId: string, familyId: string) {
    try {
      // Get accessible shopping list IDs for the user
      const accessibleIds = await this.resourceSharingService.getAccessibleResources(
        userId,
        familyId,
        'shopping-list'
      );

      const shoppingLists = await this.shoppingListModel.find({
        _id: { $in: accessibleIds.map(id => new Types.ObjectId(id)) }
      }).populate('ownerId', 'firstName lastName email');

      return {
        success: true,
        message: 'Shopping lists fetched successfully',
        data: shoppingLists,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Shopping lists fetching failed. ' + error.message,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, userId: string): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      // Check if user can access this resource
      const canAccess = await this.resourceSharingService.canUserAccessResource(
        userId,
        id,
        'shopping-list'
      );

      if (!canAccess) {
        throw new ForbiddenException('Access denied to this shopping list');
      }

      const shoppingList = await this.shoppingListModel.findById(id)
        .populate('ownerId', 'firstName lastName email');
      
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
      if (error instanceof HttpException || error instanceof ForbiddenException) {
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

  async update(id: string, updateShoppingListDto: UpdateShoppingListDto, userId: string): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      // Check if user can access this resource
      const canAccess = await this.resourceSharingService.canUserAccessResource(
        userId,
        id,
        'shopping-list'
      );

      if (!canAccess) {
        throw new ForbiddenException('Access denied to this shopping list');
      }

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
      if (error instanceof HttpException || error instanceof ForbiddenException) {
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
  async updateItem(id: string, itemId: string, updateItemDto: UpdateShoppingListItemDto, userId: string): Promise<BaseResponseDto<ShoppingList | null>> {
    try {
      // Check if user can access this resource
      const canAccess = await this.resourceSharingService.canUserAccessResource(
        userId,
        id,
        'shopping-list'
      );

      if (!canAccess) {
        throw new ForbiddenException('Access denied to this shopping list');
      }

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

      // Aggiorna solo i campi forniti nell'item specifico
      if (updateItemDto.name !== undefined) {
        shoppingList.list[itemIndex].name = updateItemDto.name;
      }
      if (updateItemDto.quantity !== undefined) {
        shoppingList.list[itemIndex].quantity = updateItemDto.quantity;
      }
      if (updateItemDto.unit !== undefined) {
        shoppingList.list[itemIndex].unit = updateItemDto.unit;
      }
      if (updateItemDto.bought !== undefined) {
        shoppingList.list[itemIndex].bought = updateItemDto.bought;
      }
      
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

  async removeItem(id: string, itemId: string, userId: string): Promise<BaseResponseDto<null>> {
    try {
      // Check if user can access this resource
      const canAccess = await this.resourceSharingService.canUserAccessResource(
        userId,
        id,
        'shopping-list'
      );

      if (!canAccess) {
        throw new ForbiddenException('Access denied to this shopping list');
      }

      const shoppingList = await this.shoppingListModel.findById(id);
      if (!shoppingList) {
        throw new HttpException(
          { success: false, message: 'Shopping list not found', data: null },
          HttpStatus.NOT_FOUND
        );
      }

      // Trova l'item specifico prima di eliminarlo
      const itemToRemove = shoppingList.list.find(item => item._id.toString() === itemId);
      if (!itemToRemove) {
        throw new HttpException(
          { success: false, message: 'Item not found', data: null },
          HttpStatus.NOT_FOUND
        );
      }

      // Controllo: non permettere eliminazione di prodotti acquistati
      if (itemToRemove.bought) {
        throw new HttpException(
          { 
            success: false, 
            message: 'Cannot delete a purchased item. Please mark it as not purchased first.', 
            data: null 
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // Rimuovi l'item dalla lista
      shoppingList.list = shoppingList.list.filter(item => item._id.toString() !== itemId);

      await shoppingList.save();

      return {
        success: true,
        message: 'Item deleted successfully',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Item deletion failed. ' + error.message,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, userId: string): Promise<BaseResponseDto<null>> {
    try {
      // Check if user is the owner of this resource (only owner can delete)
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

      if (shoppingList.ownerId.toString() !== userId) {
        throw new ForbiddenException('Only the owner can delete this shopping list');
      }

      await this.shoppingListModel.findByIdAndDelete(id);

      // Also delete the resource sharing entry
      await this.resourceSharingService.deleteResourceSharing(id, 'shopping-list', userId);

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
