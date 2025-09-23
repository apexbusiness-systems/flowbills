-- Create leads table for lead capture and conversion
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('demo', 'roi_calculator', 'contact')),
  message TEXT,
  lead_source TEXT DEFAULT 'website',
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies - Leads are sensitive, only allow insert for anonymous users (lead capture)
-- and full access for authenticated admin users
CREATE POLICY "Allow anonymous lead capture" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Create policy for authenticated users to view and manage leads (admin functionality)
CREATE POLICY "Authenticated users can manage leads" 
ON public.leads 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create index for better performance on common queries
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(lead_status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();