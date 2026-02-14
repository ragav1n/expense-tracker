-- Run this to add currency to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
