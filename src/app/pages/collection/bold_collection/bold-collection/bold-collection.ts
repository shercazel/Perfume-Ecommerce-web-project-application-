import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-bold-collection',
  imports: [CollectionProductGrid],
  templateUrl: './bold-collection.html',
  styleUrl: './bold-collection.css',
})
export class BoldCollection {
  readonly title = 'Bold Collection';
  readonly category = 'bold';
}
