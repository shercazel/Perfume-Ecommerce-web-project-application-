import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-all-collection',
  imports: [CollectionProductGrid],
  templateUrl: './all-collection.html',
  styleUrl: './all-collection.css',
})
export class AllCollection {
  readonly title = 'All Categories';
  readonly category = 'all';
}
