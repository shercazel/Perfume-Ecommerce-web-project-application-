import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirm-pass',
  imports: [RouterLink],
  templateUrl: './confirm-pass.html',
  styleUrl: './confirm-pass.css',
})
export class ConfirmPass {
  @Output() closeModal = new EventEmitter<void>();
}
