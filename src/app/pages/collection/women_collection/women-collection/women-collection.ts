import { Component } from '@angular/core';
import { CollectionProductGrid } from '../../collection-product-grid/collection-product-grid';

@Component({
  selector: 'app-women-collection',
  imports: [CollectionProductGrid],
  templateUrl: './women-collection.html',
  styleUrl: './women-collection.css',
})
export class WomenCollection {
  readonly title = 'Women Collection';
  readonly category = 'women';
}
