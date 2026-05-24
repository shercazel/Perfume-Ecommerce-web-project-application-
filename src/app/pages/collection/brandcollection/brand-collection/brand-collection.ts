import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';


@Component({
  selector: 'app-brand-collection',
  imports: [CollectionProductGrid],
  templateUrl: './brand-collection.html',
  styleUrl: './brand-collection.css',
})
export class BrandCollection {
  readonly title = 'Brand Collection';
  readonly category = 'brand';
}
