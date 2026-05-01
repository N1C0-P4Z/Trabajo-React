const { prisma } = require('../config/database');

const userRepository = {
  async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username }
    });
  },

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  async findById(id) {
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

  async create(data) {
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

  async update(id, data) {
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

  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }
};

module.exports = { userRepository };
