# ReviewSystem

A full-stack web application for submitting store ratings with role-based access control.

## Features

- **System Administrator**: Add stores/users, view dashboards with stats, manage users and stores
- **Normal User**: Sign up, browse stores, submit/modify ratings (1-5 stars)
- **Store Owner**: View dashboard with ratings and customer information

## Tech Stack

- **Backend**: Express.js + TypeScript + Prisma ORM + SQLite
- **Frontend**: React.js + Vite + TypeScript

## Setup

### Backend
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@storereviewer.com | Admin@123 |
| User | john.doe@example.com | User@123 |
| Store Owner | owner1@techstore.com | Owner@123 |
