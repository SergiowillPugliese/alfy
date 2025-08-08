import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  OptionBarComponent,
  Options,
  ShoppingListItemDTO,
  ShoppingListItemEntity,
  ShoppingListService,
  ToastService,
} from '@alfy/alfy-shared-lib';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-shopping-list',
  imports: [
    CommonModule,
    ButtonModule,
    OptionBarComponent,
    CheckboxModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
  ],
  templateUrl: './shopping-list.page.html',
  styleUrl: './shopping-list.page.scss',
})
export class ShoppingListPage implements OnInit {
  private readonly _shoppingService = inject(ShoppingListService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _toast = inject(ToastService);
  private readonly _destroyRef = inject(DestroyRef);

  optionsBar = signal<Options>({
    addButton: true,
    addButtonLabel: 'Aggiungi elemento',
  });

  items = signal<ShoppingListItemEntity[]>([]);
  visible = signal(false);
  selectedItems!: ShoppingListItemEntity;
  id = this._route.snapshot.params['id'];

  addItemForm = new FormGroup({
    elementName: new FormControl('', [Validators.required]),
    elementQuantity: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    if (this.id) {
      this._loadItems(this.id);
    }
  }

  onItemBoughtChange(itemIndex: number, bought: boolean) {
    const currentItems = this.items();
    const updatedItems = currentItems.map((item, index) => {
      if (index === itemIndex) {
        return { name: item.name, quantity: item.quantity, bought };
      } else {
        return { name: item.name, quantity: item.quantity, bought: item.bought };
      }
    });

    this._shoppingService
      .shoppingListControllerUpdate(this.id, {
        list: updatedItems,
      })
      .subscribe({
        next: (response) => {
          if (response.data?.list) {
            this.items.set(response.data.list);
          }
        },
        error: (error) => this._toast.showHttpError(error),
      });
  }

  onOpenaddItem() {
    console.log('addItem');
    this.visible.set(true);
  }

  onAddItem() {
    const item: ShoppingListItemDTO = {
      name: this.addItemForm.value.elementName || '',
      quantity: Number(this.addItemForm.get('elementQuantity')?.value) || 0,
      bought: false,
    };
    this.visible.set(false);
    this._shoppingService
      .shoppingListControllerUpdate(this.id, {
        list: [...this.items(), item],
      })
      .subscribe({
        next: (response) => {
          if (response.data?.list) {
            this.items.set(response.data.list);
          }
          this.addItemForm.reset();
        },
        error: (error) => this._toast.showHttpError(error),
        complete: () =>
          this._toast.showSuccessMessage({
            severity: 'success',
            summary: 'Successo',
            detail: 'Elemento aggiunto con successo',
            life: 3000,
          }),
      });
  }

  private _loadItems(id: string) {
    this._shoppingService
      .shoppingListControllerFindOne(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data?.list || []);
        },
        error: (error) => this._toast.showHttpError(error),
      });
  }
}
