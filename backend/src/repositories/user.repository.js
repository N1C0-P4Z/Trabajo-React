const { prisma } = require('../config/database');

const userRepository = {
  async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username }
    });
  },

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true }
    });
  }
};

module.exports = { userRepository };
