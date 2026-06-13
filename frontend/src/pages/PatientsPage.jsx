import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import userService from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import PatientFormModal from '../components/PatientFormModal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Eye,
  Pencil,
  CalendarDays,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// --- Constants ---

const ALL = '__ALL__';

const OBRA_SOCIAL_OPTIONS = [
  { value: ALL, label: 'Todas las obras sociales' },
  { value: 'OSDE', label: 'OSDE' },
  { value: 'Swiss Medical', label: 'Swiss Medical' },
  { value: 'Galeno', label: 'Galeno' },
  { value: 'Medicus', label: 'Medicus' },
  { value: 'Prevención Salud', label: 'Prevención Salud' },
];

const ESTADO_OPTIONS = [
  { value: ALL, label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

const LIMITE = 10;

// --- Helpers ---

function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// --- Page Component ---

const PatientsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER';
  const isSecretary = user?.role === 'SECRETARY';
  const canEdit = isAdmin || isSecretary;
  const canDelete = isAdmin;

  // Data
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);

  // Filters
  const [searchInput, setSearchInput] = useState('');

  // Debounced search: fires applyFilters 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const [obraSocial, setObraSocial] = useState(ALL);
  const [estado, setEstado] = useState(ALL);
  const [doctorId, setDoctorId] = useState(ALL);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Pagination
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // --- Data fetching ---

  const loadPatients = useCallback(
    async (filters = {}, page = 1) => {
      try {
        setLoading(true);
        setError(null);
        const result = await patientService.getAll({
          ...filters,
          pagina: page,
          limite: LIMITE,
        });
        setPatients(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load doctors once for the dropdown
  useEffect(() => {
    userService
      .getDoctors()
      .then(setDoctors)
      .catch(() => {}); // fail silently — dropdown stays empty
  }, []);

  // Initial patient load
  useEffect(() => {
    loadPatients({}, 1);
  }, [loadPatients]);

  // --- Filter handlers ---

  const applyFilters = useCallback(
    (overrides = {}) => {
      const raw = {
        search:
          overrides.search !== undefined ? overrides.search : searchInput,
        obra_social:
          overrides.obraSocial !== undefined ? overrides.obraSocial : obraSocial,
        estado:
          overrides.estado !== undefined ? overrides.estado : estado,
        doctor_id:
          overrides.doctorId !== undefined ? overrides.doctorId : doctorId,
        desde:
          overrides.desde !== undefined ? overrides.desde : desde,
        hasta:
          overrides.hasta !== undefined ? overrides.hasta : hasta,
      };
      // Remove "ALL" sentinel values — they mean "no filter"
      const filters = {};
      for (const [key, val] of Object.entries(raw)) {
        if (val !== ALL && val !== '') {
          filters[key] = val;
        }
      }
      setPagina(1);
      loadPatients(filters, 1);
    },
    [searchInput, obraSocial, estado, doctorId, desde, hasta, loadPatients]
  );

  const handleFilterChange = (key, value) => {
    // Update the corresponding state
    switch (key) {
      case 'obraSocial':
        setObraSocial(value);
        break;
      case 'estado':
        setEstado(value);
        break;
      case 'doctorId':
        setDoctorId(value);
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
    applyFilters({ [key]: value });
  };

  function buildFilters() {
    const raw = { search: searchInput, obra_social: obraSocial, estado, doctor_id: doctorId, desde, hasta };
    const f = {};
    for (const [key, val] of Object.entries(raw)) {
      if (val !== ALL && val !== '') f[key] = val;
    }
    return f;
  }

  const handlePageChange = (newPage) => {
    setPagina(newPage);
    loadPatients(buildFilters(), newPage);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadPatients(buildFilters(), pagina);
  };

  // --- Pagination helpers ---

  const totalPages = Math.ceil(total / LIMITE) || 1;
  const from = total === 0 ? 0 : (pagina - 1) * LIMITE + 1;
  const to = Math.min(pagina * LIMITE, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagina - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pacientes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Directorio de Pacientes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná la información administrativa de los pacientes de la clínica
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 h-7 text-xs w-44"
              placeholder="Nombre, DNI, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => applyFilters({ search: searchInput })}
          >
            <Search className="size-3.5" />
          </Button>
        </div>

        {/* Obra Social */}
        <Select
          value={obraSocial}
          onValueChange={(v) => handleFilterChange('obraSocial', v)}
        >
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="Obra social" />
          </SelectTrigger>
          <SelectContent>
            {OBRA_SOCIAL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={estado}
          onValueChange={(v) => handleFilterChange('estado', v)}
        >
          <SelectTrigger className="w-28 h-7 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Doctor */}
        <Select
          value={doctorId}
          onValueChange={(v) => handleFilterChange('doctorId', v)}
        >
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="Doctor/a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los doctores</SelectItem>
            {doctors.map((doc) => (
              <SelectItem key={doc.id} value={String(doc.id)}>
                {doc.first_name} {doc.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            className="h-7 text-xs w-32"
            value={desde}
            onChange={(e) => handleFilterChange('desde', e.target.value)}
            title="Última visita desde"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="date"
            className="h-7 text-xs w-32"
            value={hasta}
            onChange={(e) => handleFilterChange('hasta', e.target.value)}
            title="Última visita hasta"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground mt-3">
            Cargando pacientes...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && patients.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No se encontraron pacientes con los filtros seleccionados.
          </p>
        </div>
      )}

      {/* Table + Pagination */}
      {!loading && !error && patients.length > 0 && (
        <>
          <div className="rounded-xl border border-border">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
              <div className="col-span-4">Paciente</div>
              <div className="col-span-2">DNI</div>
              <div className="col-span-2">Cobertura</div>
              <div className="col-span-2">Última Visita</div>
              <div className="col-span-1">Próx. Turno</div>
              <div className="col-span-1 text-right">Acciones</div>
            </div>

            {/* Data rows */}
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border/50 hover:bg-muted/30 transition-colors group last:border-b-0 items-center"
              >
                {/* Paciente: avatar + name + email */}
                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  <Avatar size="sm" className="shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        patient.user?.first_name,
                        patient.user?.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {patient.user?.first_name} {patient.user?.last_name}
                      {!patient.is_active && (
                        <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                          (Inactivo)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {patient.user?.email || '—'}
                    </p>
                  </div>
                </div>

                {/* DNI */}
                <div className="col-span-2 text-sm text-foreground truncate">
                  {patient.dni || '—'}
                </div>

                {/* Cobertura: badge or italic placeholder */}
                <div className="col-span-2 truncate">
                  {patient.obra_social ? (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{patient.obra_social}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Sin cobertura
                    </span>
                  )}
                </div>

                {/* Última Visita */}
                <div className="col-span-2 text-sm text-foreground truncate">
                  {patient.last_visit_at ? (
                    formatDate(patient.last_visit_at)
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Sin visitas
                    </span>
                  )}
                </div>

                {/* Próximo Turno */}
                <div className="col-span-1 flex items-center gap-1 text-sm text-foreground truncate">
                  {patient.next_visit_at ? (
                    <>
                      <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{formatDate(patient.next_visit_at)}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      —
                    </span>
                  )}
                </div>

                {/* Acciones: visibility + edit — visible on hover */}
                <div className="col-span-1 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    title="Ver perfil del paciente"
                    className="size-7"
                  >
                    <Eye className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={!canEdit}
                    onClick={() => handleEditPatient(patient)}
                    title={
                      canEdit
                        ? 'Editar paciente'
                        : 'Requiere permisos de administrador'
                    }
                    className="size-7"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? 'No se encontraron pacientes'
                : `Mostrando ${from} a ${to} de ${total} pacientes`}
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagina <= 1}
                onClick={() => handlePageChange(pagina - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>

              {getPageNumbers().map((p) => (
                <Button
                  key={p}
                  variant={p === pagina ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagina >= totalPages}
                onClick={() => handlePageChange(pagina + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Edit Patient Modal */}
      <PatientFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSuccess={handleFormSuccess}
        patient={editingPatient}
      />
    </div>
  );
};

export default PatientsPage;
