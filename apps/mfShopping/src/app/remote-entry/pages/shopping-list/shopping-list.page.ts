import { Component, inject, signal, OnInit, DestroyRef, model, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
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
    ProgressSpinnerModule,
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
  loading = signal(false);

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

  onOpenaddItem() {
    console.log('addItem');
    this.visible.set(true);
  }

  onAddItem() {
    this.loading.set(true);
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
        complete: () => {
          this.loading.set(false);
          this._toast.showSuccessMessage({
            severity: 'success',
            summary: 'Successo',
            detail: 'Elemento aggiunto con successo',
            life: 3000,
          });
        },
      });
  }

  onToggleBought(product: ShoppingListItemEntity) {
    this.loading.set(true);
    this._shoppingService
      .shoppingListControllerUpdateItem(this.id, product._id, {
        bought: !product.bought,
      })
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this._toast.showErrorMessage({
              severity: 'error',
              summary: 'Errore',
              detail: response.message || 'Errore',
              life: 5000,
            });
          } else {
            this._loadItems(this.id);
          }
        },
        error: (error) => this._toast.showHttpError(error),
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  private _loadItems(id: string) {
    this.loading.set(true);
    this._shoppingService
      .shoppingListControllerFindOne(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data?.list || []);
        },
        error: (error) => this._toast.showHttpError(error),
        complete: () => {
          this.loading.set(false);
        },
      });
  }
}
