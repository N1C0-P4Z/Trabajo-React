import { prisma } from '../config/database';

// Select público para Patient que NUNCA incluye password_hash del User
const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  role: true,
  specialty: true,
  license_number: true,
  is_active: true,
  avatar_url: true,
  dni: true,
  direccion: true,
  created_at: true
};

const patientPublicSelect = {
  id: true,
  user_id: true,
  dni: true,
  obra_social: true,
  numero_afiliado: true,
  fecha_nacimiento: true,
  direccion: true,
  telefono_alternativo: true,
  contacto_emergencia: true,
  telefono_emergencia: true,
  alergias: true,
  notas: true,
  is_active: true,
  created_at: true,
  user: {
    select: publicUserSelect
  }
};

export interface PatientFilters {
  search?: string;
  obra_social?: string;
  doctor_id?: number;
  desde?: string;
  hasta?: string;
  estado?: string;
  pagina?: number;
  limite?: number;
}

export const patientRepository = {
  async create(data: any) {
    return await prisma.patient.create({
      data,
      select: patientPublicSelect
    });
  },

  async findByUserId(userId: number) {
    return await prisma.patient.findUnique({
      where: { user_id: userId },
      select: patientPublicSelect
    });
  },

  async findByDni(dni: string, excludeId?: number) {
    const where: any = { dni };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    return await prisma.patient.findFirst({
      where,
      select: patientPublicSelect
    });
  },

  async findById(id: number) {
    return await prisma.patient.findUnique({
      where: { id },
      select: patientPublicSelect
    });
  },

  async findAll(filters: PatientFilters) {
    const {
      search,
      obra_social,
      doctor_id,
      desde,
      hasta,
      estado,
      pagina = 1,
      limite = 10
    } = filters;

    const where: any = {};
    const AND: any[] = [];

    // Filtro por estado (active/inactive)
    if (estado === 'active') {
      AND.push({ is_active: true });
    } else if (estado === 'inactive') {
      AND.push({ is_active: false });
    }

    // Filtro por obra social
    if (obra_social) {
      AND.push({ obra_social });
    }

    // Búsqueda por texto: nombre, apellido, email del User + dni del Patient
    if (search) {
      AND.push({
        OR: [
          { user: { first_name: { contains: search } } },
          { user: { last_name: { contains: search } } },
          { user: { email: { contains: search } } },
          { dni: { contains: search } }
        ]
      });
    }

    // Filtro por doctor (subquery sobre Appointment)
    if (doctor_id) {
      AND.push({
        user: {
          patient_appointments: {
            some: { doctor_id: Number(doctor_id) }
          }
        }
      });
    }

    // Filtro por rango de fechas (subquery sobre Appointment)
    if (desde || hasta) {
      const dateFilter: any = {};
      if (desde) dateFilter.gte = new Date(desde);
      if (hasta) dateFilter.lte = new Date(hasta + 'T23:59:59.999');

      AND.push({
        user: {
          patient_appointments: {
            some: { datetime: dateFilter }
          }
        }
      });
    }

    if (AND.length > 0) {
      where.AND = AND;
    }

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        select: patientPublicSelect,
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { user: { last_name: 'asc' } }
      }),
      prisma.patient.count({ where })
    ]);

    return { data, total };
  },

  async update(id: number, data: any) {
    return await prisma.patient.update({
      where: { id },
      data,
      select: patientPublicSelect
    });
  },

  async softDelete(id: number) {
    return await prisma.patient.update({
      where: { id },
      data: { is_active: false },
      select: patientPublicSelect
    });
  }
};
