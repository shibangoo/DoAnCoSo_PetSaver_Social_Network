const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

exports.getExploreContent = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Fetch trending/random posts
    const trendingPosts = await prisma.post.findMany({
      take: 10,
      where: {
        isPermanentlyDeleted: false
      },
      orderBy: {
        comments: {
          _count: 'desc'
        }
      },
      include: {
        author: { select: { id: true, displayName: true, avatar: true } },
        reactions: true,
        _count: { select: { comments: true } },
        sharedPost: {
          include: {
            author: { select: { id: true, displayName: true, avatar: true } }
          }
        }
      }
    });

    // Fetch suggested users (excluding friends and self)
    const existingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    const excludedUserIds = existingFriendships.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    excludedUserIds.push(userId);

    const suggestedUsers = await prisma.user.findMany({
      where: { id: { notIn: excludedUserIds }, isDeactivated: false },
      take: 5,
      select: { id: true, displayName: true, avatar: true, email: true, bio: true }
    });

    // Fetch random/suggested pets
    const suggestedPets = await prisma.pet.findMany({
      take: 5,
      where: {
        isPermanentlyDeleted: false,
        ownerId: { not: userId }
      },
      select: { id: true, name: true, avatar: true, breed: true }
    });

    res.status(200).json({
      posts: trendingPosts,
      users: suggestedUsers,
      pets: suggestedPets
    });
  } catch (error) {
    next(error);
  }
};

exports.searchAll = async (req, res, next) => {
  try {
    const keyword = req.query.q || '';
    if (!keyword.trim()) {
      return res.status(200).json({ users: [], posts: [], pets: [] });
    }
    const searchQuery = { contains: keyword };

    // Search Users
    const users = await prisma.user.findMany({
      where: {
        isDeactivated: false,
        OR: [
          { displayName: searchQuery },
          { email: searchQuery }
        ]
      },
      take: 10,
      select: { id: true, displayName: true, avatar: true, email: true }
    });

    // Search Posts
    const posts = await prisma.post.findMany({
      where: {
        isPermanentlyDeleted: false,
        content: searchQuery
      },
      take: 10,
      include: {
        author: { select: { id: true, displayName: true, avatar: true } },
        reactions: true,
        _count: { select: { comments: true } },
        sharedPost: {
          include: {
            author: { select: { id: true, displayName: true, avatar: true } }
          }
        }
      }
    });

    // Search Pets
    const pets = await prisma.pet.findMany({
      where: {
        isPermanentlyDeleted: false,
        OR: [
          { name: searchQuery },
          { breed: searchQuery }
        ]
      },
      take: 10,
      select: { id: true, name: true, avatar: true, breed: true, ownerId: true }
    });

    res.status(200).json({ users, posts, pets });
  } catch (error) {
    next(error);
  }
};
