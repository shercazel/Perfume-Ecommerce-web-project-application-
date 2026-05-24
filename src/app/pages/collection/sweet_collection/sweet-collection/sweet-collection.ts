import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-sweet-collection',
  imports: [CollectionProductGrid],
  templateUrl: './sweet-collection.html',
  styleUrl: './sweet-collection.css',
})
export class SweetCollection {
  readonly title = 'Sweet Collection';
  readonly category = 'sweet';
}
