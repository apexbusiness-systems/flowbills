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

export interface UploadProgress {
  fileName: string;
  progress: number;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<InvoiceDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
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

  const getDocuments = useCallback(async (invoiceId?: string) => {
    return fetchDocuments(invoiceId);
  }, [fetchDocuments]);

  const downloadDocument = useCallback(async (documentId: string) => {
    // Stub implementation
    toast({
      title: "Download",
      description: "Document download not yet implemented",
    });
    return null;
  }, [toast]);

  const getFilePreviewUrl = useCallback(async (documentId: string) => {
    // Stub implementation - return placeholder URL
    return '/placeholder.svg';
  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[], invoiceId?: string) => {
    if (!user) return [];
    
    setUploading(true);
    const results = [];
    
    for (const file of files) {
      setUploadProgress(prev => [...prev, { fileName: file.name, progress: 0 }]);
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        setUploadProgress(prev => 
          prev.map(p => p.fileName === file.name ? { ...p, progress: i } : p)
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      results.push(await uploadFile(file, invoiceId));
    }
    
    setUploadProgress([]);
    setUploading(false);
    return results;
  }, [user, uploadFile]);

  return {
    uploading,
    documents,
    uploadProgress,
    uploadFile,
    fetchDocuments,
    deleteDocument,
    getDocuments,
    downloadDocument,
    getFilePreviewUrl,
    uploadMultipleFiles,
  };
};