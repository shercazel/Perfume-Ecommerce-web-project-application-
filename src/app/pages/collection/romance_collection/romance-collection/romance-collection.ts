import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-romance-collection',
  imports: [CollectionProductGrid],
  templateUrl: './romance-collection.html',
  styleUrl: './romance-collection.css',
})
export class RomanceCollection {
  readonly title = 'Romance Collection';
  readonly category = 'romance';
}
