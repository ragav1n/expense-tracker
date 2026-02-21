-- Run this command in your Supabase SQL Editor to add the currency column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';
