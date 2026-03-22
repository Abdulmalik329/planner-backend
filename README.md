# Task Planner Backend

NestJS + Prisma + PostgreSQL backend.

## Texnologiyalar
- **NestJS** — framework
- **Prisma ORM** — database ORM
- **PostgreSQL** — baza
- **JWT** — authentication
- **bcrypt** — parol shifrlash

## Loyiha tuzilmasi

```
src/
├── main.ts                  # Entry point, CORS config
├── app.module.ts            # Root module
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── tasks/
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   └── tasks.module.ts
├── categories/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── statistics/
│   ├── statistics.controller.ts
│   ├── statistics.service.ts
│   └── statistics.module.ts
└── common/
    └── health.controller.ts
```

## Local ishga tushirish

```bash
# 1. .env fayl yarating
cp .env.example .env
# .env ichida DATABASE_URL va JWT_SECRET ni to'ldiring

# 2. Paketlarni o'rnating
npm install

# 3. Migration ishlatish
npx prisma migrate dev --name init

# 4. Serverni ishga tushiring
npm run start:dev
```

## API Endpoint'lar

Base URL: `https://your-domain.com/api`

### Auth
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /auth/signup | Ro'yxatdan o'tish |
| POST | /auth/login | Kirish |
| GET | /auth/me | Mening ma'lumotlarim (JWT) |

### Tasks (JWT kerak)
| Method | URL | Tavsif |
|--------|-----|--------|
| GET | /tasks | Barcha vazifalar |
| GET | /tasks/:id | Bitta vazifa |
| POST | /tasks | Yangi vazifa |
| PUT | /tasks/:id | Vazifani yangilash |
| DELETE | /tasks/:id | Vazifani o'chirish |
| PATCH | /tasks/:id/complete | Complete toggle |
| PATCH | /tasks/:id/archive | Archive toggle |

### Categories (JWT kerak)
| Method | URL | Tavsif |
|--------|-----|--------|
| GET | /categories | Barcha kategoriyalar |
| GET | /categories/:id | Bitta kategoriya |
| POST | /categories | Yangi kategoriya |
| PUT | /categories/:id | Kategoriyani yangilash |
| DELETE | /categories/:id | Kategoriyani o'chirish |

### Statistics & Health
| Method | URL | Tavsif |
|--------|-----|--------|
| GET | /statistics | Statistika (JWT) |
| GET | /health | Server holati |

## Railway Deploy

1. [railway.app](https://railway.app) ga kiring
2. **New Project → Deploy from GitHub repo**
3. PostgreSQL qo'shing: **New → Database → PostgreSQL**
4. Environment variables qo'shing:
   ```
   DATABASE_URL  = (Railway PostgreSQL dan avtomatik)
   JWT_SECRET    = your-super-secret-key-min-32-chars
   PORT          = 3000
   ```
5. Deploy tugagandan so'ng URL oling

## Render Deploy

1. [render.com](https://render.com) ga kiring
2. **New → Web Service → Connect GitHub**
3. **Environment: Docker** tanlang
4. Environment variables qo'shing:
   ```
   DATABASE_URL  = (Render yoki Neon/Supabase URL)
   JWT_SECRET    = your-super-secret-key-min-32-chars
   PORT          = 3000
   ```

## Neon.tech (Bepul PostgreSQL)

1. [neon.tech](https://neon.tech) ga kiring
2. Yangi project yarating
3. Connection string oling:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Shu URLni `DATABASE_URL` ga qo'ying

## Frontend uchun API ulash

```javascript
// Frontend .env
VITE_API_URL=https://your-backend.railway.app/api

// API chaqiruv namunasi
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { user, token } = await res.json();

// Protected route
const tasks = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```
