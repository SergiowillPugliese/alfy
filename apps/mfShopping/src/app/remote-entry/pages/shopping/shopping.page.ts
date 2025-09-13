import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ShoppingList, ShoppingListService } from '@alfy/alfy-shared-lib';
import { Router } from '@angular/router';


@Component({
  selector: 'app-shopping',
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './shopping.page.html',
  styleUrl: './shopping.page.scss',
})
export class ShoppingPage {
  private readonly _shoppingService = inject(ShoppingListService);
  private readonly _router = inject(Router);
  
  lists = signal<ShoppingList[]>([]);

  constructor() {
    this._loadLists();
  }

  protected navigateTo(item: ShoppingList) {
    this._router.navigate(['/mfShopping', item._id, item.name]);
  }


  private _loadLists() {
    this._shoppingService.shoppingListControllerFindAll().subscribe({
      next: (response) => this.lists.set(response.data || []),
      error: (error) => console.error(error),
    }); 
  }
 

}
