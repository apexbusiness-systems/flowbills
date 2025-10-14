-- P10: Support Hotline Integration Tables
-- Tables to support Aircall webhook logs and CRM sync

-- Support call logs (from Aircall)
CREATE TABLE IF NOT EXISTS public.support_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE, -- Aircall call ID
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT,
  to_number TEXT,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  agent_name TEXT,
  agent_email TEXT,
  tags TEXT[] DEFAULT '{}',
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM sync logs
CREATE TABLE IF NOT EXISTS public.crm_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'customer', 'contact')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_data JSONB,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_call_logs
CREATE POLICY "Only admins can view call logs"
  ON public.support_call_logs
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert call logs"
  ON public.support_call_logs
  FOR INSERT
  WITH CHECK (true); -- Webhooks insert without auth

-- RLS Policies for crm_sync_logs
CREATE POLICY "Only admins can view CRM sync logs"
  ON public.crm_sync_logs
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert CRM sync logs"
  ON public.crm_sync_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update CRM sync logs"
  ON public.crm_sync_logs
  FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_call_logs_created ON public.support_call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_call_logs_agent ON public.support_call_logs(agent_email);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_entity ON public.crm_sync_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_status ON public.crm_sync_logs(sync_status, created_at DESC);
