import { prisma } from '../config/database';
import { patientRepository, PatientFilters } from '../repositories/patient.repository';

// ============================================================
// HELPERS — Computed visit fields (derived from Appointment)
// ============================================================

async function getLastVisit(userId: number): Promise<string | null> {
  const last = await prisma.appointment.findFirst({
    where: {
      patient_id: userId,
      datetime: { lte: new Date() }
    },
    orderBy: { datetime: 'desc' },
    select: { datetime: true }
  });
  return last ? last.datetime.toISOString() : null;
}

async function getNextVisit(userId: number): Promise<string | null> {
  const next = await prisma.appointment.findFirst({
    where: {
      patient_id: userId,
      datetime: { gte: new Date() }
    },
    orderBy: { datetime: 'asc' },
    select: { datetime: true }
  });
  return next ? next.datetime.toISOString() : null;
}

async function batchVisitMaps(userIds: number[]) {
  // Última visita (más reciente ≤ ahora)
  const lastVisits = await prisma.appointment.groupBy({
    by: ['patient_id'],
    where: {
      patient_id: { in: userIds },
      datetime: { lte: new Date() }
    },
    _max: { datetime: true }
  });

  // Próxima visita (más cercana ≥ ahora)
  const nextVisits = await prisma.appointment.groupBy({
    by: ['patient_id'],
    where: {
      patient_id: { in: userIds },
      datetime: { gte: new Date() }
    },
    _min: { datetime: true }
  });

  const lastMap = new Map<number, string | null>();
  for (const v of lastVisits) {
    lastMap.set(v.patient_id, v._max.datetime?.toISOString() ?? null);
  }

  const nextMap = new Map<number, string | null>();
  for (const v of nextVisits) {
    nextMap.set(v.patient_id, v._min.datetime?.toISOString() ?? null);
  }

  return { lastMap, nextMap };
}

// ============================================================
// VALIDACIÓN
// ============================================================

function validatePatientId(id: string | number): number {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  if (!numId || isNaN(numId)) {
    throw new Error('ID de paciente inválido');
  }
  return numId;
}

// ============================================================
// SERVICIO DE PACIENTES
// ============================================================

export const patientService = {
  async listPatients(filters: PatientFilters) {
    const { data, total } = await patientRepository.findAll(filters);
    const pagina = filters.pagina || 1;
    const limite = filters.limite || 10;

    if (data.length === 0) {
      return { data: [], total, pagina, limite };
    }

    // Batch: computar visitas para todos los pacientes en 2 queries
    const userIds = data.map((p: any) => p.user_id);
    const { lastMap, nextMap } = await batchVisitMaps(userIds);

    const enriched = data.map((p: any) => ({
      ...p,
      last_visit_at: lastMap.get(p.user_id) ?? null,
      next_visit_at: nextMap.get(p.user_id) ?? null
    }));

    return { data: enriched, total, pagina, limite };
  },

  async getPatientById(id: string | number) {
    const numId = validatePatientId(id);

    const patient = await patientRepository.findById(numId);
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    const [lastVisit, nextVisit] = await Promise.all([
      getLastVisit(patient.user_id),
      getNextVisit(patient.user_id)
    ]);

    return {
      ...patient,
      last_visit_at: lastVisit,
      next_visit_at: nextVisit
    };
  },

  async updatePatient(
    id: string | number,
    data: any,
    requestingUser?: { userId: number; role: string } | null
  ) {
    const numId = validatePatientId(id);

    if (!requestingUser) {
      throw new Error('No autorizado para gestionar pacientes');
    }

    const patient = await patientRepository.findById(numId);
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    const { role, userId } = requestingUser;
    const staffRoles = ['SUPER_ADMIN', 'OWNER', 'SECRETARY'];

    if (role === 'PATIENT') {
      if (patient.user_id !== userId) {
        throw new Error('No autorizado para editar este paciente');
      }
      if (data.is_active !== undefined) {
        throw new Error('No autorizado para cambiar el estado del paciente');
      }
    } else if (staffRoles.includes(role)) {
      // staff may edit any patient
    } else if (role === 'DENTIST') {
      throw new Error('No autorizado para gestionar pacientes');
    } else {
      throw new Error('No autorizado para gestionar pacientes');
    }

    const updateData: any = {};

    if (data.dni !== undefined) {
      const dni = data.dni.trim();
      if (!dni) {
        throw new Error('El DNI es requerido');
      }

      // Verificar unicidad del DNI (excluyendo este paciente)
      const existingDni = await patientRepository.findByDni(dni, numId);
      if (existingDni) {
        throw new Error('El DNI ya está en uso');
      }

      updateData.dni = dni;
    }

    if (data.obra_social !== undefined) {
      updateData.obra_social = data.obra_social === '' ? null : data.obra_social;
    }

    if (data.numero_afiliado !== undefined) {
      updateData.numero_afiliado = data.numero_afiliado === '' ? null : data.numero_afiliado;
    }

    if (data.fecha_nacimiento !== undefined) {
      updateData.fecha_nacimiento = data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null;
    }

    if (data.direccion !== undefined) {
      updateData.direccion = data.direccion === '' ? null : data.direccion;
    }

    if (data.telefono_alternativo !== undefined) {
      updateData.telefono_alternativo = data.telefono_alternativo === '' ? null : data.telefono_alternativo;
    }

    if (data.contacto_emergencia !== undefined) {
      updateData.contacto_emergencia = data.contacto_emergencia === '' ? null : data.contacto_emergencia;
    }

    if (data.telefono_emergencia !== undefined) {
      updateData.telefono_emergencia = data.telefono_emergencia === '' ? null : data.telefono_emergencia;
    }

    if (data.alergias !== undefined) {
      updateData.alergias = data.alergias === '' ? null : data.alergias;
    }

    if (data.notas !== undefined && staffRoles.includes(role)) {
      updateData.notas = data.notas === '' ? null : data.notas;
    }

    if (data.is_active !== undefined) {
      updateData.is_active = Boolean(data.is_active);
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    const updated = await patientRepository.update(numId, updateData);

    const [lastVisit, nextVisit] = await Promise.all([
      getLastVisit(updated.user_id),
      getNextVisit(updated.user_id)
    ]);

    return {
      ...updated,
      last_visit_at: lastVisit,
      next_visit_at: nextVisit
    };
  },

  async deletePatient(
    id: string | number,
    requestingUser?: { userId: number; role: string } | null
  ) {
    const numId = validatePatientId(id);

    // Autorización: solo SUPER_ADMIN y OWNER
    if (!requestingUser || (requestingUser.role !== 'SUPER_ADMIN' && requestingUser.role !== 'OWNER')) {
      throw new Error('No autorizado para gestionar pacientes');
    }

    const patient = await patientRepository.findById(numId);
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    // Soft-delete idempotente: siempre setea is_active=false
    await patientRepository.softDelete(numId);

    return { message: 'Paciente desactivado exitosamente' };
  }
};
