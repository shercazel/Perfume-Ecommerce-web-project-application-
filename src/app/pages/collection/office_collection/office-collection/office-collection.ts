import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-office-collection',
  imports: [CollectionProductGrid],
  templateUrl: './office-collection.html',
  styleUrl: './office-collection.css',
})
export class OfficeCollection {
  readonly title = 'Office Collection';
  readonly category = 'office';
}
