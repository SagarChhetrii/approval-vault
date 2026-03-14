# ApprovalVault — Setup & Deployment Guide

## Folder Structure
```
approval-vault/
├── server/            ← Node.js + Express backend
├── client/            ← React (Vite) frontend
└── docker-compose.yml ← Production Docker orchestration
```

---

## Quick Start (Local Development)

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MongoDB Atlas URI and a strong JWT_SECRET
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
cp .env.example .env   # optional — Vite proxy handles /api in dev
npm run dev            # starts on http://localhost:3000
```

### 3. Create Your First Admin User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@company.com",
  "password": "yourpassword",
  "role": "admin"
}
```

Then log in at `http://localhost:3000/login`.

---

## Deployment with Docker

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) installed
- MongoDB Atlas cluster (or any accessible MongoDB instance)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/SagarChhetrii/approval-vault.git
cd approval-vault

# 2. Create a root .env file with production secrets
cat > .env << 'EOF'
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/approvalportal
JWT_SECRET=your_very_long_random_secret_here
CLIENT_ORIGIN=http://your-domain.com
EOF

# 3. Build and start all containers
docker-compose up --build -d

# 4. Check running containers
docker-compose ps
```

The app will be available at:
- **Frontend**: `http://localhost` (port 80)
- **Backend API**: `http://localhost:5000`

### Stop / Restart

```bash
docker-compose down        # stop and remove containers
docker-compose restart     # restart all services
docker-compose logs -f     # follow logs
```

### Uploaded Files

File uploads are stored in a Docker named volume (`uploads_data`) so they persist across container restarts.

---

## Environment Variables

### Server (`server/.env`)

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `MONGO_URI`     | ✅       | MongoDB connection string |
| `JWT_SECRET`    | ✅       | Secret key for JWT signing (use a long random string) |
| `PORT`          | —        | Server port (default: `5000`) |
| `NODE_ENV`      | —        | `development` or `production` |
| `CLIENT_ORIGIN` | —        | Frontend origin for CORS (default: `http://localhost:3000`) |

### Client (`client/.env`)

| Variable      | Description |
|---------------|-------------|
| `VITE_API_URL`| Backend API base URL (default: proxied via Vite dev server) |

---

## Core Workflow

1. **Admin logs in** → creates a project (also creates a client account)
2. **Admin uploads file** → SHA-256 hash auto-generated and stored
3. **Client logs in** → sees their project, reviews the file
4. **Client approves** → version locked, approval certificate generated
5. **Both can view** the Approval Certificate with full cryptographic proof

---

## Key Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs (12 rounds) |
| Auth tokens | JWT (8hr expiry) |
| File integrity | SHA-256 via Node crypto stream |
| Role separation | Middleware guard on all routes |
| Immutable locking | `locked: true` on Version doc after approval |
| Audit trail | Every action logged to AuditLog collection |
| IP capture | Captured at approval time from request headers |
| CORS | Configurable via `CLIENT_ORIGIN` env var |

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create user |
| POST | /api/auth/login | Public | Get JWT token |
| GET | /api/auth/users | Admin | List all clients |
| POST | /api/projects | Admin | Create project |
| GET | /api/projects | Any | List projects |
| GET | /api/projects/:id | Any | Get project |
| POST | /api/projects/:id/upload | Admin | Upload new file version |
| GET | /api/projects/:id/versions | Any | Get all versions |
| POST | /api/projects/:id/request-changes | Client | Request changes |
| GET | /api/projects/:id/audit | Any | Get audit log |
| POST | /api/versions/:id/comment | Any | Add comment |
| GET | /api/versions/:id/comments | Any | Get comments |
| POST | /api/versions/:id/approve | Client | Approve + lock version |
| GET | /api/versions/:id/approval | Any | Get approval certificate |

