# Haraj Petroly

KFUPM-only marketplace for safe on-campus buying/selling.

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- npm
- A MongoDB instance (Atlas or local)

### 2. Install dependencies
From the project root:
```bash
npm install
```

### 3. Configure the API
1. Copy the example env file and edit it:
   ```bash
   cd server
   # if .env does not exist yet
   cp .env.example .env   # or create .env manually
   ```
2. In `server/.env`, set at least:
   ```env
   MONGODB_URI="your-mongodb-connection-string"
   JWT_SECRET="some-long-random-secret"
   PORT=5000
   ```

### 4. Run the backend
From the project root:
```bash
npm run server
```
The API will be available at `http://localhost:5000/api`.

### 5. Run the frontend
In another terminal, from the project root:
```bash
npm run dev
```
By default Vite serves the app on `http://localhost:5173`.

### 6. Create an admin account (optional)
1. In the UI, sign up and verify a normal user.
2. In MongoDB, open the `users` collection and update that document:
   ```js
   db.users.updateOne(
     { email: "your-admin@kfupm.edu.sa" },
     { $set: { role: "admin", verified: true, status: "active" } }
   )
   ```
3. Log in with that email/password and open `/admin` to access the admin dashboard.

## Front-End (React + Vite)
- React Router + TailwindCSS
- Local dev:
  ```bash
  npm run dev
  ```

## Back-End (Node.js + Express + MongoDB)
- Requirements: Node 18+, MongoDB URI (Atlas or local). Images are stored in MongoDB GridFS, so Mongo must be reachable at startup.
- Setup:
  1) Copy `server/.env.example` to `server/.env` and fill `MONGODB_URI` + `JWT_SECRET` (do not commit real secrets).
  2) Install deps: `npm install`
  3) Start API: `npm run server` (defaults to port `5000`)
- File uploads: `POST /api/uploads` accepts `multipart/form-data` field `image` (max 5 MB, image/*). Stored in GridFS; response `{ url: "/uploads/<fileId>", id: "<fileId>" }`. Files stream from `/uploads/:id`.
- Auth: JWT Bearer; requests validated with `express-validator`.

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
- `PATCH /listings/:id` — seller/admin only; update any of the above plus `status`
- `DELETE /listings/:id` — seller/admin only
- `POST /listings/:id/metrics` — body `{ metric: "views" | "saves" | "chats" }`
- `GET /listings/:id/messages` — Bearer token; seller can pass `?buyerId=` to scope to a buyer thread; buyers see only their own thread. Messages are stored in the `messages` collection.
- `POST /listings/:id/messages` — Bearer token, body `{ text, to? }`; buyer messages go to seller; seller must specify `to` (buyer id).
- `POST /listings/:id/offers` — Bearer token, body `{ price }`
- `PATCH /listings/:id/offers/:offerId` — seller/admin only, body `{ status: "Pending" | "Accepted" | "Declined" }`

### Saved
- `GET /saved` — Bearer token; returns `{ saved: [{ listingId }] }`
- `POST /saved/:listingId` — Bearer token; saves listing and increments `metrics.saves`
- `DELETE /saved/:listingId` — Bearer token; unsaves and decrements `metrics.saves`

### Reports
- `POST /reports` — Bearer token, body `{ type: "user" | "listing" | "other", targetId, reason }`
- `GET /reports` — admin only
- `DELETE /reports/:id` — admin only

### Health
- `GET /health` — returns `{ status: "ok", uptime }`

## Sample cURL
```bash
# Register then create a listing
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","email":"demo@kfupm.edu.sa","password":"secret123"}' | jq -r '.token')

curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@kfupm.edu.sa"}'

curl -X POST http://localhost:5000/api/listings \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Casio Calculator","description":"Like new.","price":60,"categoryId":1,"condition":"Very Good","zoneId":2}'

# Upload an image (GridFS) and use its URL
FILE_ID=$(curl -s -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/photo.jpg" | jq -r '.id')
echo "Image served at http://localhost:5000/uploads/$FILE_ID"

# Save/unsave a listing
curl -X POST http://localhost:5000/api/saved/$LISTING_ID -H "Authorization: Bearer $TOKEN"
curl -X DELETE http://localhost:5000/api/saved/$LISTING_ID -H "Authorization: Bearer $TOKEN"

# Send a message to seller (buyer flow)
curl -X POST http://localhost:5000/api/listings/$LISTING_ID/messages \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"text":"Is this available?"}'

# Seller replying to a buyer thread (needs buyerId)
curl -X POST http://localhost:5000/api/listings/$LISTING_ID/messages \
  -H "Authorization: Bearer $SELLER_TOKEN" -H "Content-Type: application/json" \
  -d '{"text":"Still available.","to":"<buyerId>"}'
```

## 👥 Team Members
- NAIF ALHAMMAD — Frontend (React, Vite, Tailwind)
- KHALED MATHBAQ — Backend (Node.js, Express, MongoDB, Authentication)
- ABDULAZIZ ALKATHIRI — Database & API Integration (MongoDB Models, Validation)



## 🌐 Live Links
- Frontend (Vercel): [https://haraj-wheat.vercel.app/](https://haraj-wheat.vercel.app/)
- Backend (Render): [https://haraj-ljc9.onrender.com](https://haraj-ljc9.onrender.com)
- Demo Video: [Google Drive Link](https://drive.google.com/file/d/1WoYC7LHU2hdBT0yPtwEeGdnop0suqlbR/view?usp=drive_link)

## 🧪 Demo Account
You can log in using the following demo credentials:
- Email: admin@kfupm.edu.sa
- Password: qwe12345
- or
- Email: test@kfupm.edu.sa
- Password: kfupm123
