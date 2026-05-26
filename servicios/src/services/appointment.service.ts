import { appointmentRepository } from '../repositories/appointment.repository';
import { appointmentTypeRepository } from '../repositories/appointment-type.repository';
import { userRepository } from '../repositories/user.repository';

const VALID_STATUSES = ['PENDIENTE', 'CONFIRMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO', 'NO_ASISTIO'];

export const appointmentService = {
  async getByRange(startStr: string, endStr: string) {
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Rango de fechas inválido (formato incorrecto)');
    }

    if (start > end) {
      throw new Error('Rango de fechas inválido (start > end)');
    }

    return await appointmentRepository.findByDateRange(start, end);
  },

  async getById(id: string | number) {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (!numId || isNaN(numId)) {
      throw new Error('ID de turno inválido');
    }

    const appointment = await appointmentRepository.findById(numId);
    if (!appointment) {
      throw new Error('Turno no encontrado');
    }

    return appointment;
  },

  async create(data: {
    patient_id?: number;
    doctor_id?: number;
    datetime?: string;
    duration_minutes?: number;
    type_id?: number;
    notes?: string;
    obra_social?: string;
  }) {
    const { patient_id, doctor_id, datetime, type_id } = data;

    if (!patient_id || !doctor_id || !datetime || !type_id) {
      throw new Error('Campos requeridos faltantes para el turno');
    }

    // Validate patient exists
    const patient = await userRepository.findById(patient_id);
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    // Validate doctor exists
    const doctor = await userRepository.findById(doctor_id);
    if (!doctor) {
      throw new Error('Doctor no encontrado');
    }

    // Validate type exists
    const type = await appointmentTypeRepository.findById(type_id);
    if (!type) {
      throw new Error('Tipo de turno no encontrado');
    }

    const parsedDatetime = new Date(datetime);
    if (isNaN(parsedDatetime.getTime())) {
      throw new Error('Fecha y hora inválidas');
    }

    return await appointmentRepository.create({
      patient_id,
      doctor_id,
      datetime: parsedDatetime,
      duration_minutes: data.duration_minutes || type.suggested_duration_minutes || 30,
      type_id,
      status: 'PENDIENTE',
      notes: data.notes || undefined,
      obra_social: data.obra_social || undefined
    });
  },

  async update(id: string | number, data: {
    patient_id?: number;
    doctor_id?: number;
    datetime?: string;
    duration_minutes?: number;
    type_id?: number;
    status?: string;
    notes?: string;
    obra_social?: string;
  }) {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (!numId || isNaN(numId)) {
      throw new Error('ID de turno inválido');
    }

    const existing = await appointmentRepository.findById(numId);
    if (!existing) {
      throw new Error('Turno no encontrado');
    }

    const updateData: any = {};

    if (data.patient_id !== undefined) {
      const patient = await userRepository.findById(data.patient_id);
      if (!patient) {
        throw new Error('Paciente no encontrado');
      }
      updateData.patient_id = data.patient_id;
    }

    if (data.doctor_id !== undefined) {
      const doctor = await userRepository.findById(data.doctor_id);
      if (!doctor) {
        throw new Error('Doctor no encontrado');
      }
      updateData.doctor_id = data.doctor_id;
    }

    if (data.datetime !== undefined) {
      const parsed = new Date(data.datetime);
      if (isNaN(parsed.getTime())) {
        throw new Error('Fecha y hora inválidas');
      }
      updateData.datetime = parsed;
    }

    if (data.duration_minutes !== undefined) {
      updateData.duration_minutes = data.duration_minutes;
    }

    if (data.type_id !== undefined) {
      const type = await appointmentTypeRepository.findById(data.type_id);
      if (!type) {
        throw new Error('Tipo de turno no encontrado');
      }
      updateData.type_id = data.type_id;
    }

    if (data.status !== undefined) {
      if (!VALID_STATUSES.includes(data.status)) {
        throw new Error(`Estado inválido. Debe ser uno de: ${VALID_STATUSES.join(', ')}`);
      }
      updateData.status = data.status;
    }

    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.obra_social !== undefined) updateData.obra_social = data.obra_social;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    return await appointmentRepository.update(numId, updateData);
  },

  async delete(id: string | number) {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (!numId || isNaN(numId)) {
      throw new Error('ID de turno inválido');
    }

    const existing = await appointmentRepository.findById(numId);
    if (!existing) {
      throw new Error('Turno no encontrado');
    }

    await appointmentRepository.delete(numId);
    return { message: 'Turno eliminado exitosamente' };
  }
};
