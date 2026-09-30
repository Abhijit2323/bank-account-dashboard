import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {

  @Input() title = 'Confirm Action';

  @Input() message = 'Are you sure you want to continue?';

  @Input() confirmText = 'Confirm';

  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();

  @Output() cancelled = new EventEmitter<void>();


  confirm(): void {
    this.confirmed.emit();
  }


  cancel(): void {
    this.cancelled.emit();
  }

}