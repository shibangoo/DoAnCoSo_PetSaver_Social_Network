const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        coverImage: true,
        dob: true,
        role: true,
        accountType: true,
        pets: {
          where: { isPermanentlyDeleted: false },
          orderBy: { createdAt: 'desc' }
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { id: true, displayName: true, avatar: true }
            },
            tags: {
              include: {
                pet: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            },
            reactions: true,
            _count: {
              select: { comments: true }
            }
          }
        }
      }
    });
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
