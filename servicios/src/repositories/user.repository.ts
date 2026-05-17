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
  created_at: Date;
}

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
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        created_at: true
      }
    });
  },

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        created_at: true
      }
    });
  },

  async create(data: any) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        created_at: true
      }
    });
  },

  async update(id: number, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        created_at: true
      }
    });
  },

  async delete(id: number) {
    return await prisma.user.delete({
      where: { id }
    });
  }
};
