import {
  Component,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  OptionBarComponent,
  Options,
  ShoppingListItemDTO,
  ShoppingListItemDTOUnit,
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
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { firstValueFrom } from 'rxjs';


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
    TooltipModule,
    ProgressSpinnerModule,
    SelectModule,
  ],
  templateUrl: './shopping-list.page.html',
  styleUrl: './shopping-list.page.scss',
})
export class ShoppingListPage implements OnInit {
  private readonly _shoppingService = inject(ShoppingListService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _toast = inject(ToastService);
  private readonly _destroyRef = inject(DestroyRef);
  protected readonly _router = inject(Router);
  
  optionsBar = signal<Options>({
    addButton: true,
    addButtonLabel: 'Aggiungi elemento',
    editButton: true,
    editButtonLabel: 'Modalità Modifica',
    editMode: false,
  });

  items = signal<ShoppingListItemEntity[]>([]);
  selectedItems = signal<ShoppingListItemEntity[]>([]);
  visible = signal(false);
  loading = signal(false);
  editMode = signal(false);
  editingItem = signal<ShoppingListItemEntity | null>(null);
  units = signal<string[]>(['pz', 'g', 'hg', 'kg', 'ml', 'cl', 'l']);

  id = this._route.snapshot.params['id'];

  addItemForm = new FormGroup({
    elementName: new FormControl('', [Validators.required]),
    elementQuantity: new FormControl('', [Validators.required]),
    elementUnit: new FormControl('pz', [Validators.required]),
  });

  ngOnInit() {
    if (this.id) {
      this._loadItems(this.id);
    }
  }

  protected onOpenaddItem() {
    console.log('addItem');
    this.visible.set(true);
  }

  protected onAddItem() {
    this.loading.set(true);
    const unit = this.addItemForm.value.elementUnit as ShoppingListItemDTOUnit;
    const item: ShoppingListItemDTO = {
      name: this.addItemForm.value.elementName || '',
      quantity: Number(this.addItemForm.get('elementQuantity')?.value) || 0,
      unit: unit || 'pz',
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

  protected onToggleBought(product: ShoppingListItemEntity) {
    this.loading.set(true);
    
    // Invertiamo lo stato prima di inviare la richiesta
    const newBoughtStatus = !product.bought;
    product.bought = newBoughtStatus; // Aggiorniamo immediatamente l'UI
    
    this._shoppingService
      .shoppingListControllerUpdateItem(this.id, product._id, {
        bought: newBoughtStatus,
      })
      .subscribe({
        next: (response) => {
          if (!response.success) {
            // Se fallisce, ripristiniamo lo stato precedente
            product.bought = !newBoughtStatus;
            this._toast.showErrorMessage({
              severity: 'error',
              summary: 'Errore',
              detail: response.message || 'Errore',
              life: 5000,
            });
          }
        },
        error: (error) => {
          // Se c'è un errore, ripristiniamo lo stato precedente
          product.bought = !newBoughtStatus;
          this._toast.showHttpError(error);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  protected onDeleteItem(product: ShoppingListItemEntity) {
    // Controllo: non permettere eliminazione di prodotti acquistati
    if (product.bought) {
      this._toast.showErrorMessage({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Non puoi eliminare un prodotto già acquistato',
        life: 3000,
      });
      return;
    }

    this.loading.set(true);
    this._shoppingService
      .shoppingListControllerRemoveItem(this.id, product._id)
      .subscribe({
        next: () => {
          this._loadItems(this.id);
        },
        error: (error) => {
          this._toast.showHttpError(error);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        }
      });
  }

  protected onToggleEditMode() {
    const newEditMode = !this.editMode();
    this.editMode.set(newEditMode);
    
    // Aggiorna anche l'optionsBar per riflettere il nuovo stato
    this.optionsBar.update(options => ({
      ...options,
      editMode: newEditMode
    }));
    
    if (!newEditMode) {
      this.selectedItems.set([]);
      this.editingItem.set(null);
    }
  }

  protected onEditItem(product: ShoppingListItemEntity) {
    this.editingItem.set(product);
  }

  protected onSaveItem(product: ShoppingListItemEntity, newName: string, newQuantity: number, newUnit: string) {
    this.loading.set(true);
    const unit = newUnit as ShoppingListItemDTOUnit;
    this._shoppingService.shoppingListControllerUpdateItem(this.id, product._id, {
      name: newName,
      quantity: newQuantity,
      unit: unit,
      bought: product.bought
    }).subscribe({
      next: () => {
        this._loadItems(this.id);
        this.editingItem.set(null);
      },
      error: (error) => this._toast.showHttpError(error),
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  protected onCancelEdit() {
    this.editingItem.set(null);
  }

  protected onSelectAll() {
    // Filtra solo i prodotti non acquistati per la selezione
    const selectableItems = this.items().filter(item => !item.bought);
    
    if (this.selectedItems().length === selectableItems.length) {
      // Se tutti i selezionabili sono selezionati, deseleziona tutto
      this.selectedItems.set([]);
    } else {
      // Altrimenti seleziona tutti i prodotti non acquistati
      this.selectedItems.set([...selectableItems]);
    }
  }

  protected onItemSelect(product: ShoppingListItemEntity) {
    // Non permettere selezione di prodotti acquistati
    if (product.bought) {
      return;
    }

    const currentSelected = this.selectedItems();
    const index = currentSelected.findIndex(item => item._id === product._id);
    
    if (index > -1) {
      // Rimuovi l'elemento se già selezionato
      this.selectedItems.set(currentSelected.filter(item => item._id !== product._id));
    } else {
      // Aggiungi l'elemento se non selezionato
      this.selectedItems.set([...currentSelected, product]);
    }
  }

  protected isItemSelected(product: ShoppingListItemEntity): boolean {
    return this.selectedItems().some(item => item._id === product._id);
  }

  protected isAllSelected(): boolean {
    const selectableItems = this.items().filter(item => !item.bought);
    return selectableItems.length > 0 && this.selectedItems().length === selectableItems.length;
  }

  protected isPartialSelected(): boolean {
    const selectableItems = this.items().filter(item => !item.bought);
    return this.selectedItems().length > 0 && this.selectedItems().length < selectableItems.length;
  }

  protected onDeleteSelected() {
    if (this.selectedItems().length === 0) {
      this._toast.showErrorMessage({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Nessun elemento selezionato',
        life: 3000,
      });
      return;
    }

    this.loading.set(true);
    const selectedIds = this.selectedItems().map(item => item._id);
    
    // Elimina tutti gli elementi selezionati uno per uno
    const deletePromises = selectedIds.map(id => 
      firstValueFrom(this._shoppingService.shoppingListControllerRemoveItem(this.id, id))
    );

    Promise.all(deletePromises)
      .then(() => {
        this._loadItems(this.id);
        this.selectedItems.set([]);
        this._toast.showSuccessMessage({
          severity: 'success',
          summary: 'Successo',
          detail: `${selectedIds.length} elementi eliminati con successo`,
          life: 3000,
        });
      })
      .catch(error => {
        this._toast.showHttpError(error);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  protected onMarkSelectedAsBought() {
    if (this.selectedItems().length === 0) {
      this._toast.showErrorMessage({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Nessun elemento selezionato',
        life: 3000,
      });
      return;
    }

    this.loading.set(true);
    const selectedItems = this.selectedItems();
    
    // Marca tutti gli elementi selezionati come acquistati
    const updatePromises = selectedItems.map(item => 
      firstValueFrom(this._shoppingService.shoppingListControllerUpdateItem(this.id, item._id, {
        bought: true
      }))
    );

    Promise.all(updatePromises)
      .then(() => {
        this._loadItems(this.id);
        this.selectedItems.set([]);
        this._toast.showSuccessMessage({
          severity: 'success',
          summary: 'Successo',
          detail: `${selectedItems.length} elementi marcati come acquistati`,
          life: 3000,
        });
      })
      .catch(error => {
        this._toast.showHttpError(error);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  protected onGoBack() {
    this._router.navigate(['/mfShopping'], { relativeTo: this._route })
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
