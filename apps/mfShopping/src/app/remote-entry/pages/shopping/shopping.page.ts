import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ShoppingList, ShoppingListService } from '@alfy/alfy-shared-lib';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-shopping',
  imports: [CommonModule, CardModule, ButtonModule, DialogModule, FormsModule],
  templateUrl: './shopping.page.html',
  styleUrl: './shopping.page.scss',
})
export class ShoppingPage {
  private readonly _shoppingService = inject(ShoppingListService);
  private readonly _router = inject(Router);
  
  lists = signal<ShoppingList[]>([]);
  visible = false;
  name = '';

  constructor() {
    this._loadLists();

    effect(() => {
      console.log(this.lists());
    });
  }

  protected navigateTo(item: ShoppingList) {
    this._router.navigate(['/mfShopping', item._id, item.name]);
  }

  protected createShoppingList() {
   this._shoppingService.shoppingListControllerCreate({
    name: this.name,
    bought: false,
    list: [],
   })
  }

  protected openCreateShoppingListDialog() {
    this.visible = !this.visible;
  }


  private _loadLists() {
    this._shoppingService.shoppingListControllerFindAll().subscribe({
      next: (response) => this.lists.set(response.data || []),
      error: (error) => console.error(error),
    }); 
  }
}
