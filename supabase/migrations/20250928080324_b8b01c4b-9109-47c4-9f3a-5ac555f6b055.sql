-- Phase 3: E-Invoicing Tables and Enums (Revised without pgmq)
-- Create necessary enums for e-invoicing
CREATE TYPE einvoice_status AS ENUM ('pending', 'validated', 'sent', 'received', 'failed', 'rejected');
CREATE TYPE einvoice_format AS ENUM ('bis30', 'xrechnung', 'facturx', 'pint');
CREATE TYPE validation_rule_type AS ENUM ('en16931', 'bis30', 'xrechnung', 'facturx', 'country_specific');
CREATE TYPE fraud_flag_type AS ENUM ('duplicate_bank', 'duplicate_tax_id', 'amount_anomaly', 'frequency_anomaly', 'vendor_mismatch');

-- E-Invoice Documents table
CREATE TABLE public.einvoice_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL DEFAULT auth.uid(),
    document_id TEXT NOT NULL,
    format einvoice_format NOT NULL,
    status einvoice_status NOT NULL DEFAULT 'pending',
    xml_content TEXT,
    validation_results JSONB DEFAULT '{}',
    confidence_score INTEGER DEFAULT 0,
    country_code TEXT DEFAULT 'CA',
    sender_id TEXT,
    receiver_id TEXT,
    total_amount NUMERIC,
    currency TEXT DEFAULT 'CAD',
    issue_date DATE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, document_id)
);

-- Peppol Messages table  
CREATE TABLE public.peppol_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL DEFAULT auth.uid(),
    document_id UUID REFERENCES public.einvoice_documents(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL UNIQUE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_participant_id TEXT,
    receiver_participant_id TEXT,
    document_type_id TEXT,
    process_id TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Country Validations table
CREATE TABLE public.country_validations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL DEFAULT auth.uid(),
    document_id UUID REFERENCES public.einvoice_documents(id) ON DELETE CASCADE,
    rule_type validation_rule_type NOT NULL,
    country_code TEXT NOT NULL,
    validation_passed BOOLEAN NOT NULL,
    error_messages JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    validation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Fraud Flags table (extending existing structure)
CREATE TABLE IF NOT EXISTS public.fraud_flags_einvoice (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL DEFAULT auth.uid(),
    document_id UUID REFERENCES public.einvoice_documents(id) ON DELETE CASCADE,
    flag_type fraud_flag_type NOT NULL,
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    details JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Policies table (extending existing structure) 
CREATE TABLE IF NOT EXISTS public.einvoice_policies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL DEFAULT auth.uid(),
    policy_name TEXT NOT NULL,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('validation', 'approval', 'routing', 'fraud')),
    conditions JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, policy_name)
);

-- Model Stats table for AI/ML monitoring
CREATE TABLE public.model_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL DEFAULT auth.uid(),
    model TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('validation', 'classification', 'extraction', 'fraud_detection')),
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
    drift_stat JSONB DEFAULT '{}',
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Manual queue tables (alternative to pgmq)
CREATE TABLE public.queue_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_name TEXT NOT NULL,
    job_data JSONB NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.einvoice_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peppol_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags_einvoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einvoice_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Tenant-scoped access
CREATE POLICY "Users can manage their own einvoice documents" 
ON public.einvoice_documents 
FOR ALL 
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can manage their own peppol messages" 
ON public.peppol_messages 
FOR ALL 
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can manage their own country validations" 
ON public.country_validations 
FOR ALL 
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can manage their own einvoice fraud flags" 
ON public.fraud_flags_einvoice 
FOR ALL 
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can manage their own einvoice policies" 
ON public.einvoice_policies 
FOR ALL 
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can manage their own model stats" 
ON public.model_stats 
FOR ALL 
USING (tenant_id = auth.uid())
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "System can manage queue jobs" 
ON public.queue_jobs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Performance indexes
CREATE INDEX idx_einvoice_documents_tenant_status ON public.einvoice_documents(tenant_id, status);
CREATE INDEX idx_einvoice_documents_document_id ON public.einvoice_documents(document_id);
CREATE INDEX idx_peppol_messages_tenant_status ON public.peppol_messages(tenant_id, status);
CREATE INDEX idx_peppol_messages_scheduled ON public.peppol_messages(scheduled_at) WHERE status = 'queued';
CREATE INDEX idx_country_validations_tenant_doc ON public.country_validations(tenant_id, document_id);
CREATE INDEX idx_fraud_flags_einvoice_tenant_status ON public.fraud_flags_einvoice(tenant_id, status);
CREATE INDEX idx_einvoice_policies_tenant_active ON public.einvoice_policies(tenant_id, is_active);
CREATE INDEX idx_model_stats_tenant_model ON public.model_stats(tenant_id, model, stage);
CREATE INDEX idx_queue_jobs_queue_status ON public.queue_jobs(queue_name, status);
CREATE INDEX idx_queue_jobs_scheduled ON public.queue_jobs(scheduled_at) WHERE status = 'pending';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_einvoice_documents_updated_at
    BEFORE UPDATE ON public.einvoice_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peppol_messages_updated_at
    BEFORE UPDATE ON public.peppol_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_einvoice_policies_updated_at
    BEFORE UPDATE ON public.einvoice_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();