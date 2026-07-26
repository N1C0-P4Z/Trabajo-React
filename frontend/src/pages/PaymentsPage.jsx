import React, { useState, useEffect, useCallback } from 'react';
import paymentService from '../services/paymentService';
import patientService from '../services/patientService';
import PaymentFormModal, { PAYMENT_METHODS, STATUS_OPTIONS } from '../components/PaymentFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { Plus, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ALL = '__ALL__';
const LIMITE = 10;

const METHOD_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.label])
);

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

const STATUS_VARIANTS = {
  COMPLETADO: 'default',
  PENDIENTE: 'outline',
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

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState(ALL);
  const [paymentMethod, setPaymentMethod] = useState(ALL);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const loadPayments = useCallback(async (filters = {}, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await paymentService.getAll({
        ...filters,
        pagina: page,
        limite: LIMITE,
      });
      setPayments(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    patientService
      .getAll({ limite: 200, estado: 'active' })
      .then((res) => setPatients(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPayments({}, 1);
  }, [loadPayments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = useCallback(
    (overrides = {}) => {
      const raw = {
        search: overrides.search !== undefined ? overrides.search : searchInput,
        status: overrides.status !== undefined ? overrides.status : status,
        payment_method:
          overrides.paymentMethod !== undefined ? overrides.paymentMethod : paymentMethod,
        desde: overrides.desde !== undefined ? overrides.desde : desde,
        hasta: overrides.hasta !== undefined ? overrides.hasta : hasta,
      };

      const filters = {};
      for (const [key, val] of Object.entries(raw)) {
        if (val !== ALL && val !== '') {
          filters[key] = val;
        }
      }

      setPagina(1);
      loadPayments(filters, 1);
    },
    [searchInput, status, paymentMethod, desde, hasta, loadPayments]
  );

  const handleFilterChange = (key, value) => {
    const overrides = { [key]: value };
    switch (key) {
      case 'status':
        setStatus(value);
        break;
      case 'paymentMethod':
        setPaymentMethod(value);
        break;
      case 'desde':
        setDesde(value);
        break;
      case 'hasta':
        setHasta(value);
        break;
      default:
        break;
    }
    applyFilters(overrides);
  };

  const goToPage = (page) => {
    const filters = {};
    if (searchInput) filters.search = searchInput;
    if (status !== ALL) filters.status = status;
    if (paymentMethod !== ALL) filters.payment_method = paymentMethod;
    if (desde) filters.desde = desde;
    if (hasta) filters.hasta = hasta;
    setPagina(page);
    loadPayments(filters, page);
  };

  const handleSuccess = () => {
    toast.success(editingPayment ? 'Pago actualizado' : 'Pago registrado');
    setEditingPayment(null);
    goToPage(pagina);
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
            <BreadcrumbPage>Pagos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro y seguimiento de cobros
          </p>
        </div>
        <Button
          size="default"
          className="px-5 py-5 text-base font-semibold"
          onClick={() => {
            setEditingPayment(null);
            setFormModalOpen(true);
          }}
        >
          <Plus className="size-5 mr-1.5" />
          Registrar pago
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-xs"
            placeholder="Buscar por paciente o nota..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={(v) => handleFilterChange('status', v)}>
          <SelectTrigger className="min-w-32 h-8 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={paymentMethod}
          onValueChange={(v) => handleFilterChange('paymentMethod', v)}
        >
          <SelectTrigger className="min-w-36 h-8 text-xs">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los métodos</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="h-8 text-xs w-32"
          value={desde}
          onChange={(e) => handleFilterChange('desde', e.target.value)}
          title="Desde"
        />
        <Input
          type="date"
          className="h-8 text-xs w-32"
          value={hasta}
          onChange={(e) => handleFilterChange('hasta', e.target.value)}
          title="Hasta"
        />
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
              <th className="text-left font-medium px-4 py-3">Fecha</th>
              <th className="text-left font-medium px-4 py-3">Paciente</th>
              <th className="text-left font-medium px-4 py-3">Monto</th>
              <th className="text-left font-medium px-4 py-3">Método</th>
              <th className="text-left font-medium px-4 py-3">Estado</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Notas</th>
              <th className="text-right font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  Cargando pagos...
                </td>
              </tr>
            )}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No hay pagos registrados
                </td>
              </tr>
            )}
            {!loading &&
              payments.map((payment) => (
                <tr key={payment.id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3">{formatDate(payment.paid_at)}</td>
                  <td className="px-4 py-3">
                    {payment.patient?.first_name} {payment.patient?.last_name}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3">
                    {METHOD_LABELS[payment.payment_method] || payment.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[payment.status] || 'outline'}>
                      {STATUS_LABELS[payment.status] || payment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                    {payment.notes || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPayment(payment);
                        setFormModalOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
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
            {total} pago{total !== 1 ? 's' : ''} en total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => goToPage(pagina - 1)}
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
              onClick={() => goToPage(pagina + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <PaymentFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSuccess={handleSuccess}
        payment={editingPayment}
        patients={patients}
      />
    </div>
  );
};

export default PaymentsPage;
