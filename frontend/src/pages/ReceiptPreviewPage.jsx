import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import receiptService from '../services/receiptService';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

const ReceiptPreviewPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido');
      setLoading(false);
      return;
    }

    let objectUrl = null;

    receiptService
      .fetchPreviewBlob(token)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(() => setError('Comprobante no disponible o vencido'))
      .finally(() => setLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'comprobante.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Comprobante de consulta</h1>
        {pdfUrl && (
          <Button size="sm" onClick={handleDownload}>
            <FileDown className="size-4 mr-1" />
            Descargar
          </Button>
        )}
      </header>

      <main className="flex-1 p-4">
        {loading && (
          <p className="text-center text-muted-foreground py-20">Cargando comprobante...</p>
        )}
        {error && (
          <p className="text-center text-destructive py-20">{error}</p>
        )}
        {pdfUrl && !error && (
          <iframe
            src={pdfUrl}
            title="Comprobante"
            className="w-full h-[calc(100vh-5rem)] rounded-lg border border-border"
          />
        )}
      </main>
    </div>
  );
};

export default ReceiptPreviewPage;
