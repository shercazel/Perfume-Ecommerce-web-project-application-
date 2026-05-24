import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-men-collection',
  imports: [CollectionProductGrid],
  templateUrl: './men-collection.html',
  styleUrl: './men-collection.css',
})
export class MenCollection {
  readonly title = 'Men Collection';
  readonly category = 'men';
}
