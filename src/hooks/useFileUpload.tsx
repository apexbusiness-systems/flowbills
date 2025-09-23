import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { validateFile } from '@/lib/security';

export interface InvoiceDocument {
  id: string;
  invoice_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File, invoiceId: string): Promise<InvoiceDocument | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return null;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }

    const fileId = `${Date.now()}-${file.name}`;
    setUploading(true);
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: { progress: 0, status: 'uploading' }
    }));

    try {
      // Generate unique file path
      const fileName = `${invoiceId}/${Date.now()}-${file.name}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoice-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 80, status: 'processing' }
      }));

      // Save file metadata to database
      const { data: documentData, error: dbError } = await supabase
        .from('invoice_documents')
        .insert({
          invoice_id: invoiceId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('invoice-documents')
          .remove([uploadData.path]);
        throw dbError;
      }

      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 100, status: 'completed' }
      }));

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`,
      });

      return documentData as InvoiceDocument;

    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { 
          progress: 0, 
          status: 'error', 
          error: error.message || 'Upload failed' 
        }
      }));

      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to upload file',
        variant: "destructive",
      });

      return null;
    } finally {
      setUploading(false);
      // Clear progress after 3 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 3000);
    }
  };

  const uploadMultipleFiles = async (files: File[], invoiceId: string): Promise<InvoiceDocument[]> => {
    const results: InvoiceDocument[] = [];
    
    for (const file of files) {
      const result = await uploadFile(file, invoiceId);
      if (result) {
        results.push(result);
      }
    }

    return results;
  };

  const getDocuments = async (invoiceId: string): Promise<InvoiceDocument[]> => {
    try {
      const { data, error } = await supabase
        .from('invoice_documents')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as InvoiceDocument[]) || [];
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
      return [];
    }
  };

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    try {
      // First get the document to get the file path
      const { data: document, error: fetchError } = await supabase
        .from('invoice_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('invoice-documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('invoice_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      return false;
    }
  };

  const downloadDocument = async (documentData: InvoiceDocument): Promise<void> => {
    try {
      const { data, error } = await supabase.storage
        .from('invoice-documents')
        .download(documentData.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentData.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getFilePreviewUrl = async (documentData: InvoiceDocument): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('invoice-documents')
        .createSignedUrl(documentData.file_path, 60); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return null;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    getDocuments,
    deleteDocument,
    downloadDocument,
    getFilePreviewUrl,
  };
};