ALTER TABLE transactions
ADD COLUMN exclude_from_allowance BOOLEAN DEFAULT false;

ALTER TABLE recurring_templates
ADD COLUMN exclude_from_allowance BOOLEAN DEFAULT false;
