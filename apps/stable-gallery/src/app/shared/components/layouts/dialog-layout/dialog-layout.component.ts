import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {AbstractControl} from "@angular/forms";
import {ButtonClickEvent} from "../../ui";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-layout',
  standalone: true,
  imports: [],
  templateUrl: './dialog-layout.component.html',
  styleUrl: './dialog-layout.component.scss'
})
export class DialogLayoutComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() submitBtn?: string;
  @Input() cancelBtn?: string;
  @Input() submitClass?: string;
  @Input() cancelClass?: string;
  @Input() showCloseBtn = true;
  @Input() form?: AbstractControl;
  @Input() hideControls = false;

  @Output() onSubmit = new EventEmitter<ButtonClickEvent>();
  @Output() onError = new EventEmitter();
  // Use this event only if you need to handle
  @Output() onCancel = new EventEmitter();

  // ActionType is being set by the BaseDialog.setActionType, or you can call the setActionType from this component directly.
  protected actionType = signal<any | undefined>(undefined);

  constructor(public dialogRef: MatDialogRef<DialogLayoutComponent>) {}

  onCancelClick() {
    this.closeDialog();
    this.onCancel.emit();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  setActionType(actionType: any | undefined) {
    this.actionType.set(actionType);
  }
}
