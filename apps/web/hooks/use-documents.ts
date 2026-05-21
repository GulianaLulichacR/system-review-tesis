// apps/web/hooks/use-documents.ts
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Document {
  id: string;
  title: string;
  status: string;
  aiScore?: number;
  studentName: string;
  uploadedAt: string;
}

interface UseDocumentsOptions {
  initialData?: Document[];
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>(options.initialData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (filters?: Record<string, string>) => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/documents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching documents');
      }

      const data = await response.json();
      setDocuments(data.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  const uploadDocument = useCallback(async (file: File, metadata: Record<string, string>) => {
    if (!session?.accessToken) return null;

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading document');
      }

      const data = await response.json();
      return data;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir documento');
      return null;
    }
  }, [session?.accessToken]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    setDocuments,
  };
}