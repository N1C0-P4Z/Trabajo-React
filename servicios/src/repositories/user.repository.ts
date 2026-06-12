import { prisma } from '../config/database';

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password_hash: string;
  role: string;
  specialty: string | null;
  license_number: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: Date;
}

// Select compartido que NUNCA incluye password_hash
const publicSelect = {
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
  created_at: true
};

export const userRepository = {
  async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username }
    });
  },

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      select: publicSelect
    });
  },

  async findAll(role?: string) {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    return await prisma.user.findMany({
      where,
      select: publicSelect
    });
  },

  async findByLicenseNumber(licenseNumber: string) {
    return await prisma.user.findFirst({
      where: { license_number: licenseNumber }
    });
  },

  async create(data: any) {
    return await prisma.user.create({
      data,
      select: publicSelect
    });
  },

  async update(id: number, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
      select: publicSelect
    });
  },

  async delete(id: number) {
    return await prisma.user.delete({
      where: { id }
    });
  },

  async countByRole(role: string): Promise<number> {
    return await prisma.user.count({
      where: { role }
    });
  }
};
