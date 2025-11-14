## EcoBin API Endpoints

Base URL: `/api`

### Health
- GET `/api/health` — Service heartbeat

### Auth (`/api/auth`)
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/admin/login`

### Pickups (`/api/pickups`)
- POST `/api/pickups` — Create pickup (auth: resident)
- GET `/api/pickups/my` — Get my pickups (auth: any logged-in user)
- GET `/api/pickups/assigned` — Get pickups assigned to current collector (auth: collector)
- PATCH `/api/pickups/:id/status` — Update pickup status (auth: collector)

### Credits (`/api/credits`)
- GET `/api/credits/my` — Get my credits & last transactions (auth)
- POST `/api/credits/redeem` — Redeem credits (auth: resident or collector)

### Admin (`/api/admin`) — All routes require admin auth
- Users
  - GET `/api/admin/users`
  - PATCH `/api/admin/users/:id`
  - POST `/api/admin/users/:id/credits` — Add or deduct credits
- Pickups
  - GET `/api/admin/pickups` — Query params: `status`, `date`, `area` (optional)
  - POST `/api/admin/pickups/schedule`
  - PATCH `/api/admin/pickups/:id/assign`
  - PATCH `/api/admin/pickups/:id/unassign`
- Analytics
  - GET `/api/admin/stats`
- Partners
  - GET `/api/admin/partners`
  - POST `/api/admin/partners`
  - PATCH `/api/admin/partners/:id`
  - DELETE `/api/admin/partners/:id`

### Partners (Public) (`/api/partners`)
- GET `/api/partners` — List active partners

### MinIO Test (`/api/minio`) — Diagnostic
- GET `/api/minio/test-upload` — Test file upload to MinIO

Notes
- All authenticated routes expect a bearer token header: `Authorization: Bearer <token>`.
- Date parameters should be ISO-8601 strings unless specified otherwise.
- For admin credit operations, request body:
  - `credits` (number, multiples of 5), `description` (string), `action` (`add` | `deduct`).*** End Patch*** }#!jsonassistant_在线 to=functions.apply_patch_authenticated code_executorோம் sure thing. Let's *** End Patch to=functions.apply_patch ***!

