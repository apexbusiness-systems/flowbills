import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface InvoiceDocument {
  id: string;
  invoice_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<InvoiceDocument[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File, invoiceId?: string) => {
    if (!user) return null;
    // Stub implementation
    setUploading(true);
    setTimeout(() => setUploading(false), 1000);
    return null;
  }, [user]);

  const fetchDocuments = useCallback(async (invoiceId?: string) => {
    setDocuments([]);
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    return true;
  }, []);

  return {
    uploading,
    documents,
    uploadFile,
    fetchDocuments,
    deleteDocument,
  };
};