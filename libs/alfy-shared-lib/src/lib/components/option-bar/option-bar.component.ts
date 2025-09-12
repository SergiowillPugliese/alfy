import { CommonModule } from "@angular/common";
import { Component, input, output, ViewEncapsulation } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { ReactiveFormsModule } from "@angular/forms";

export interface Options {
    addButton: boolean
    addButtonLabel: string
    editButton?: boolean
    editButtonLabel?: string
    editMode?: boolean
}


@Component({
    selector: 'app-option-bar',
    templateUrl: './option-bar.component.html',
    styleUrls: ['./option-bar.component.scss'],
    imports: [CommonModule, ButtonModule, ReactiveFormsModule],
    encapsulation: ViewEncapsulation.None,
    
})
export class OptionBarComponent {
    options = input<Options>();
    addItem = output<void>();
    toggleEdit = output<void>();

    onAddItem() {
        this.addItem.emit();
    }

    onToggleEdit() {
        this.toggleEdit.emit();
    }

}