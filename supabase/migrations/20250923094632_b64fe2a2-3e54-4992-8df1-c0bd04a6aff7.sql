-- Create storage buckets for invoice documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoice-documents', 'invoice-documents', false);

-- Create storage policies for invoice documents
CREATE POLICY "Authenticated users can view invoice documents" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'invoice-documents');

CREATE POLICY "Operators can upload invoice documents" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'invoice-documents' AND 
  (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  )
);

CREATE POLICY "Operators can update invoice documents" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'invoice-documents' AND 
  (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  )
);

CREATE POLICY "Operators can delete invoice documents" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'invoice-documents' AND 
  (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  )
);

-- Create invoice_documents table to track file metadata
CREATE TABLE IF NOT EXISTS public.invoice_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on invoice_documents table
ALTER TABLE public.invoice_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_documents table
CREATE POLICY "Users can view invoice documents they have access to" 
ON public.invoice_documents
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.invoices 
        WHERE invoices.id = invoice_documents.invoice_id 
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Operators can create invoice documents" 
ON public.invoice_documents
FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    ) AND
    EXISTS (
        SELECT 1 FROM public.invoices 
        WHERE invoices.id = invoice_documents.invoice_id 
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Operators can update invoice documents" 
ON public.invoice_documents
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    ) AND
    EXISTS (
        SELECT 1 FROM public.invoices 
        WHERE invoices.id = invoice_documents.invoice_id 
        AND invoices.user_id = auth.uid()
    )
);

CREATE POLICY "Operators can delete invoice documents" 
ON public.invoice_documents
FOR DELETE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    ) AND
    EXISTS (
        SELECT 1 FROM public.invoices 
        WHERE invoices.id = invoice_documents.invoice_id 
        AND invoices.user_id = auth.uid()
    )
);

-- Add trigger for updated_at
CREATE TRIGGER update_invoice_documents_updated_at
BEFORE UPDATE ON public.invoice_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();