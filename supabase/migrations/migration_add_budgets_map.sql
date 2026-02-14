-- Migration to add a budgets map to the profiles table
-- This allows storing custom budget limits for different currencies
ALTER TABLE "public"."profiles" ADD COLUMN "budgets" JSONB DEFAULT '{}'::jsonb;

-- Optionally, we could populate it with current currency/budget if we wanted to migrate existing data
-- UPDATE "public"."profiles" SET budgets = jsonb_build_object(currency, monthly_budget);
