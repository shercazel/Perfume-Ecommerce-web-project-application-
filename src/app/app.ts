import { Component, NgModule, signal } from '@angular/core';
import { HeaderApp } from './Layout/header-app/header-app';
import { FooterApp } from './Layout/footer-app/footer-app';
import { RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Perfume-Collection-Eccomerce');
}
