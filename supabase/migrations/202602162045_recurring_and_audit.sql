-- Recurring Templates & Transaction Audit Logs
-- Last migration was 202602161720

-- 1. Recurring Templates Table
CREATE TABLE IF NOT EXISTS recurring_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    next_occurrence DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::JSONB, -- For splits and other data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for recurring_templates
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own templates" ON recurring_templates FOR ALL USING (auth.uid() = user_id);

-- 2. Transaction History (Audit Log)
CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL, -- We don't use FK so history persists even if tx deleted? Actually FK is better for referential integrity if CASCADE.
    changed_by UUID REFERENCES profiles(id),
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for transaction_history
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view relevant history" ON transaction_history FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM transactions t
        WHERE t.id = transaction_id AND (t.user_id = auth.uid() OR public.is_group_member(t.group_id, auth.uid()))
    )
    OR
    changed_by = auth.uid()
);

-- 3. Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_transaction_change()
RETURNS TRIGGER AS $$
DECLARE
    current_uid UUID := auth.uid();
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO transaction_history (transaction_id, changed_by, action, new_data)
        VALUES (NEW.id, current_uid, 'INSERT', to_jsonb(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO transaction_history (transaction_id, changed_by, action, old_data, new_data)
        VALUES (NEW.id, current_uid, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO transaction_history (transaction_id, changed_by, action, old_data)
        VALUES (OLD.id, current_uid, 'DELETE', to_jsonb(OLD));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Set up Trigger
DROP TRIGGER IF EXISTS tr_audit_transactions ON transactions;
CREATE TRIGGER tr_audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION public.log_transaction_change();
