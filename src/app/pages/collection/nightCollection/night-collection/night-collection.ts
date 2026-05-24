import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-night-collection',
  imports: [CollectionProductGrid],
  templateUrl: './night-collection.html',
  styleUrl: './night-collection.css',
})
export class NightCollection {
  readonly title = 'Night Party Collection';
  readonly category = 'night';
}
