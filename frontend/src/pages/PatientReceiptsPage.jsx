import React, { useState, useEffect, useCallback } from 'react';
import receiptService from '../services/receiptService';
import { PAYMENT_METHODS, STATUS_OPTIONS } from '../components/PaymentFormModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { FileDown, ChevronLeft, ChevronRight } from 'lucide-react';

const LIMITE = 10;

const METHOD_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.label])
);

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

const STATUS_VARIANTS = {
  COMPLETADO: 'default',
  ANULADO: 'destructive',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function receiptLabel(payment) {
  if (!payment.receipt_number) return '—';
  const year = new Date(payment.paid_at).getFullYear();
  return `REC-${year}-${payment.receipt_number}`;
}

const PatientReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadReceipts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await receiptService.getMine({ pagina: page, limite: LIMITE });
      setReceipts(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReceipts(1);
  }, [loadReceipts]);

  const handleDownload = async (payment) => {
    try {
      setDownloadingId(payment.id);
      const blob = await receiptService.downloadPdf(payment.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobante-${payment.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'No se pudo descargar el comprobante');
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMITE));

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mis comprobantes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis comprobantes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprobantes de consulta emitidos a tu nombre
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Nº</th>
              <th className="text-left font-medium px-4 py-3">Fecha</th>
              <th className="text-left font-medium px-4 py-3">Monto</th>
              <th className="text-left font-medium px-4 py-3">Método</th>
              <th className="text-left font-medium px-4 py-3">Estado</th>
              <th className="text-right font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Cargando comprobantes...
                </td>
              </tr>
            )}
            {!loading && receipts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No tenés comprobantes todavía
                </td>
              </tr>
            )}
            {!loading &&
              receipts.map((payment) => (
                <tr key={payment.id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{receiptLabel(payment)}</td>
                  <td className="px-4 py-3">{formatDate(payment.paid_at)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3">
                    {METHOD_LABELS[payment.payment_method] || payment.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[payment.status] || 'outline'}>
                      {STATUS_LABELS[payment.status] || payment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Descargar comprobante"
                      disabled={downloadingId === payment.id}
                      onClick={() => handleDownload(payment)}
                    >
                      <FileDown className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} comprobante{total !== 1 ? 's' : ''} en total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => {
                setPagina(pagina - 1);
                loadReceipts(pagina - 1);
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {pagina} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagina >= totalPages}
              onClick={() => {
                setPagina(pagina + 1);
                loadReceipts(pagina + 1);
              }}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReceiptsPage;
