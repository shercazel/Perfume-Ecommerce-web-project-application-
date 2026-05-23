# Votre Scent Backend API

Run the API:

```powershell
.\server\env.example.ps1
```

Or set the same environment variables yourself and run:

```powershell
npm run api
```

Base URL: `http://localhost:3000/api`

## Authentication

- `POST /auth/signup`
  Body: `{ "firstName": "Sherwin", "lastName": "Castillo", "email": "user@email.com", "password": "secret123" }`
- `POST /auth/login`
  Body: `{ "email": "user@email.com", "password": "secret123" }`
- `GET /auth/me`
  Header: `Authorization: Bearer <token>`
- `PUT /auth/profile`
  Header: `Authorization: Bearer <token>`
  Body: `{ "email": "user@email.com", "address": "Street", "provinceId": 24, "cityId": 1, "phoneNo": "09170000000" }`

## Products

- `GET /products`
  Optional query params: `search`, `genderId`, `brandId`, `accordId`, `occasionId`, `limit`, `offset`
- `GET /products/:id`
- `POST /products` admin only
- `PUT /products/:id` admin only
- `DELETE /products/:id` admin only, archives with `is_active = 0`
- `GET /products/:id/reviews`
- `POST /products/:id/reviews` authenticated

## Cart And Orders

- `GET /cart`
- `POST /cart/items`
  Body: `{ "productId": 1, "quantity": 2 }`
- `PUT /cart/items/:productId`
  Body: `{ "quantity": 3 }`
- `DELETE /cart/items/:productId`
- `DELETE /cart`
- `POST /orders/checkout`
  Body: `{ "methodId": 1 }`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status` admin only
  Body: `{ "status": "shipped" }`

## Lookups

- `GET /lookups/provinces`
- `GET /lookups/cities?provinceId=24`
- `GET /lookups/genders`
- `GET /lookups/brands`
- `GET /lookups/concentrations`
- `GET /lookups/bottle-sizes`
- `GET /lookups/accords`
- `GET /lookups/notes`
- `GET /lookups/occasions`
- `GET /lookups/payment-methods`

## Admin Inventory

- `GET /admin/inventory`
- `POST /admin/inventory/adjustments`
  Body: `{ "productId": 1, "adjustmentType": "RESTOCK", "quantity": 10, "reason": "Supplier delivery" }`
