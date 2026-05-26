import { appointmentTypeRepository } from '../repositories/appointment-type.repository';

export const appointmentTypeService = {
  async getAll() {
    return await appointmentTypeRepository.findAll();
  },

  async getById(id: string | number) {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (!numId || isNaN(numId)) {
      throw new Error('ID de tipo de turno inválido');
    }

    const type = await appointmentTypeRepository.findById(numId);
    if (!type) {
      throw new Error('Tipo de turno no encontrado');
    }

    return type;
  },

  async create(data: {
    name: string;
    description?: string;
    suggested_duration_minutes?: number;
    color?: string;
  }, userRole: string) {

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'OWNER') {
      throw new Error('No autorizado para gestionar tipos de turno');
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('El nombre del tipo de turno es requerido');
    }

    const trimmedName = data.name.trim();

    const existing = await appointmentTypeRepository.findByName(trimmedName);
    if (existing) {
      throw new Error('Ya existe un tipo de turno con ese nombre');
    }

    return await appointmentTypeRepository.create({
      name: trimmedName,
      description: data.description,
      suggested_duration_minutes: data.suggested_duration_minutes || 30,
      color: data.color || '#3B82F6'
    });
  },

  async update(id: string | number, data: {
    name?: string;
    description?: string;
    suggested_duration_minutes?: number;
    color?: string;
  }, userRole: string) {

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'OWNER') {
      throw new Error('No autorizado para gestionar tipos de turno');
    }

    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (!numId || isNaN(numId)) {
      throw new Error('ID de tipo de turno inválido');
    }

    const existing = await appointmentTypeRepository.findById(numId);
    if (!existing) {
      throw new Error('Tipo de turno no encontrado');
    }

    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('El nombre del tipo de turno no puede estar vacío');
    }

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      const nameConflict = await appointmentTypeRepository.findByName(trimmedName);
      if (nameConflict && nameConflict.id !== numId) {
        throw new Error('Ya existe un tipo de turno con ese nombre');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.suggested_duration_minutes !== undefined) updateData.suggested_duration_minutes = data.suggested_duration_minutes;
    if (data.color !== undefined) updateData.color = data.color;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    return await appointmentTypeRepository.update(numId, updateData);
  },

  async delete(id: string | number, userRole: string) {
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'OWNER') {
      throw new Error('No autorizado para gestionar tipos de turno');
    }

    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (!numId || isNaN(numId)) {
      throw new Error('ID de tipo de turno inválido');
    }

    const existing = await appointmentTypeRepository.findById(numId);
    if (!existing) {
      throw new Error('Tipo de turno no encontrado');
    }

    // Unlink appointments first (set type_id to null), then delete
    await appointmentTypeRepository.unlinkAppointments(numId);
    await appointmentTypeRepository.delete(numId);

    return { message: 'Tipo de turno eliminado exitosamente' };
  }
};
