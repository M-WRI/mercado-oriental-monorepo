# API reference

Base path: **`/api`**. JSON request bodies and JSON responses unless noted.

Default dev URL: **`http://localhost:8000`** (override with **`PORT`**).

## Authentication

### Public endpoints

No `Authorization` header required:

- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected endpoints

All routes under:

- `/api/shops`
- `/api/attributes`
- `/api/products`
- `/api/dashboard`

require:

```http
Authorization: Bearer <jwt>
```

### Auth-only route on the auth router

- `GET /api/auth/me` — uses **`authMiddleware`** on that route only (still needs Bearer).

### Login response shape

Successful login returns a JWT and user summary, for example:

```json
{
  "user": { "id": "…", "email": "…", "name": "…" },
  "token": "<jwt>"
}
```

Token payload includes **`userId`** and **`email`** (used by **`authMiddleware`** to set **`req.user`**).

---

## Errors

### Application errors (`AppError`)

JSON body:

```json
{
  "case": "machine_readable_case_string",
  "code": "MISSING | INVALID | NOT_FOUND | DUPLICATE | UNAUTHORIZED | FORBIDDEN | SERVER_ERROR"
}
```

HTTP status matches the error (e.g. 400, 401, 404, 409).

### Prisma mapping (in `errorMiddleware`)

| Prisma code | HTTP | Meaning |
|-------------|------|---------|
| `P2025` | 404 | Record not found |
| `P2002` | 409 | Unique constraint violation |

### Unexpected errors

Returns **500** with a generic server error **`code`** (details are not exposed; server logs the error).

---

## Routes

### `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register user |
| POST | `/login` | No | Login; returns `user` + `token` |
| GET | `/me` | Bearer | Current user |

### `/api/shops`

All require Bearer. Shops are scoped to **`req.user.userId`** (list and show enforce ownership).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List current user’s shops |
| GET | `/:id` | Get shop by id (if owned) |
| POST | `/` | Create shop |
| PUT | `/:id` | Update shop |
| DELETE | `/:id` | Delete shop |

### `/api/attributes`

All require Bearer. Attributes are scoped to shops owned by the current user.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List attributes for your shops; optional **`?shopId=<uuid>`** narrows to one shop (must be yours) |
| GET | `/:id` | Get one attribute (with values) |
| POST | `/` | Create attribute |
| PUT | `/:id` | Update attribute |
| DELETE | `/:id` | Delete attribute |
| DELETE | `/:attributeId/values/:valueId` | Delete a specific attribute value |

### `/api/products`

All require Bearer. Products and variants are scoped to shops owned by the current user.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List your products (includes variants and order items for list serialization) |
| GET | `/:id` | Product detail with analytics (variants, sales, customers, etc.) |
| POST | `/` | Create product (body includes `shopId`; optional nested variants) |
| PUT | `/:id` | Update product |
| DELETE | `/:id` | Delete product |

#### Variants (nested under product)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:id/variants` | List variants for that product (must be yours) |
| GET | `/:id/variants/:variantId` | Show variant |
| POST | `/:id/variants` | Create variant |
| PUT | `/:id/variants/:variantId` | Update variant |
| DELETE | `/:id/variants/:variantId` | Delete variant |

### `/api/dashboard`

All require Bearer.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Aggregated dashboard for all shops belonging to the current user (sales snapshot, revenue timeline, recent orders, inventory alerts, top products, customer stats, etc.). Empty payload if the user has no shops. |

---

## Resource access notes

- **Shops:** List and get enforce **user ownership** via `userId` on the shop.
- **Dashboard:** Aggregates only **shops linked to the authenticated user**.
- **Products and variants:** List/read/write are limited to products whose **`shopId`** is one of the current user’s shops. **`shopId`** on create/update must belong to the user; otherwise **403** (`shop_access`). Resources that are not yours return **404** where applicable.
- **Attributes:** Same shop scoping as products; optional **`shopId`** on list must still be one of your shops.

For response field-level detail, inspect **`controller/`** and **`serializers/`** under `src/_modules/`.
