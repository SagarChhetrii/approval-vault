# ApprovalVault — Setup Guide

## Folder Structure
```
approval-portal/
├── server/   ← Node.js + Express backend
└── client/   ← React (Vite) frontend
```

---

## 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MongoDB Atlas URI
npm run dev        # starts on http://localhost:5000
```

**Install deps:** express, mongoose, bcryptjs, jsonwebtoken, multer, cors, dotenv

---

## 2. Frontend Setup

```bash
cd client
npm install
# .env already set to http://localhost:5000/api
npm run dev        # starts on http://localhost:3000
```

---

## 3. Create your first admin user

Use any REST client (Postman, Thunder Client, curl):

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

## Core Flow

1. **Admin logs in** → creates a project (also creates client account)
2. **Admin uploads file** → SHA-256 hash auto-generated + stored
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
