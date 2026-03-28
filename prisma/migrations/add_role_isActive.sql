-- Migration: add_role_and_isActive_to_users
-- Run this if you already have an existing database with users table.
-- If you are running fresh migrations with `npx prisma migrate dev`, 
-- Prisma will generate this automatically from schema.prisma — skip this file.

-- Add Role enum (if not exists)
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'MANAGER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column with default USER
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'USER';

-- Add isActive column with default true
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Add Priority enum (if not exists)  
DO $$ BEGIN
  CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add priority column to tasks (if your tasks table doesn't have it yet)
ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "priority" "Priority" NOT NULL DEFAULT 'MEDIUM';
