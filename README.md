# Haraj Petroly

KFUPM-only marketplace for safe on-campus buying/selling.

## Front-End (React + Vite)
- React Router + TailwindCSS
- Run locally:
  ```bash
  npm i
  npm run dev
  ```

## Back-End (Node.js + Express + MongoDB)
- Requirements: Node 18+, MongoDB URI (Atlas or local)
- Setup:
  1) Copy `server/.env.example` to `server/.env` and fill `MONGODB_URI` + `JWT_SECRET`.
  2) Install deps: `npm install`
  3) Start API: `npm run server` (defaults to port `5000`)
- File uploads: images are saved locally to `server/uploads` and served from `/uploads/<filename>`.
- The API uses JWT Bearer tokens and validation via `express-validator`.

## API Reference (JSON)
Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register` — body `{ name, email, password }` → `{ user, token }`
- `POST /auth/login` — body `{ email, password }` → `{ user, token }` (requires verified user)
- `POST /auth/verify` — body `{ email }` → marks user verified, returns `{ user, token }`
- `GET /auth/me` — Bearer token → `{ user }`

### Listings
- `GET /listings` — optional query: `categoryId`, `zoneId`, `status`, `sellerId`, `q`
- `GET /listings/:id`
- `POST /listings` — Bearer token, body `{ title, description, price, categoryId, condition, zoneId, images? }`
- `PATCH /listings/:id` — seller/admin only; update any of the fields above plus `status`
- `DELETE /listings/:id` — seller/admin only
- `POST /listings/:id/metrics` — body `{ metric: "views" | "saves" | "chats" }`
- `POST /listings/:id/messages` — Bearer token, body `{ text }`
- `POST /listings/:id/offers` — Bearer token, body `{ price }`
- `PATCH /listings/:id/offers/:offerId` — seller/admin only, body `{ status: "Pending" | "Accepted" | "Declined" }`

### Reports
- `POST /reports` — Bearer token, body `{ type: "user" | "listing" | "other", targetId, reason }`
- `GET /reports` — admin only (set `role: "admin"` on a user in MongoDB to review)
- `DELETE /reports/:id` — admin only

### Health
- `GET /health` — returns `{ status: "ok", uptime }`

### Sample cURL
```bash
# Register then create a listing
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \\
  -H \"Content-Type: application/json\" \\
  -d '{\"name\":\"Demo\",\"email\":\"demo@kfupm.edu.sa\",\"password\":\"secret123\"}' | jq -r '.token')

curl -X POST http://localhost:5000/api/auth/verify \\
  -H \"Content-Type: application/json\" \\
  -d '{\"email\":\"demo@kfupm.edu.sa\"}'

curl -X POST http://localhost:5000/api/listings \\
  -H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\" \\
  -d '{\"title\":\"Casio Calculator\",\"description\":\"Like new.\",\"price\":60,\"categoryId\":1,\"condition\":\"Very Good\",\"zoneId\":2}'
```
