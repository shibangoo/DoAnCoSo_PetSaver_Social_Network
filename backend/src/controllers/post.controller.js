const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

exports.createPost = async (req, res, next) => {
    try {
        const authorId = req.user.userId;
        const { content, image, petIds, isLostPet, lastSeenLocation, coordinates, lostDate, reward, sharedPostId } = req.body;

        const newPost = await prisma.post.create({
            data: {
                content,
                image,
                authorId,
                isLostPet: isLostPet || false,
                lastSeenLocation,
                coordinates,
                lostDate: lostDate ? new Date(lostDate) : undefined,
                reward,
                sharedPostId: sharedPostId ? parseInt(sharedPostId) : undefined,
                tags: petIds
                    ? { create: petIds.map(petId => ({ petId, status: 'PENDING' })) }
                    : undefined
            }
        });
        res.status(201).json({ message: "Dang bai thanh cong", post: newPost });
    } catch (error) {
        next(error);
    }
}

exports.updatePost = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.postId);
        const authorId = req.user.userId;
        const { content, image, isLostPet, lastSeenLocation, coordinates, lostDate, reward } = req.body;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return next(new AppError('Bài viết không tồn tại', 404, 'POST_NOT_FOUND'));
        }
        if (post.authorId !== authorId) {
            return next(new AppError('Bạn không có quyền chỉnh sửa bài viết này', 403, 'UNAUTHORIZED'));
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                content,
                image,
                isLostPet: isLostPet !== undefined ? isLostPet : post.isLostPet,
                lastSeenLocation: lastSeenLocation !== undefined ? lastSeenLocation : post.lastSeenLocation,
                coordinates: coordinates !== undefined ? coordinates : post.coordinates,
                lostDate: lostDate ? new Date(lostDate) : post.lostDate,
                reward: reward !== undefined ? reward : post.reward,
            }
        });
        res.status(200).json({ message: "Cập nhật bài viết thành công", post: updatedPost });
    } catch (error) {
        next(error);
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.postId);
        const authorId = req.user.userId;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return next(new AppError('Bài viết không tồn tại', 404, 'POST_NOT_FOUND'));
        }
        if (post.authorId !== authorId) {
            return next(new AppError('Bạn không có quyền xóa bài viết này', 403, 'UNAUTHORIZED'));
        }

        await prisma.post.delete({ where: { id: postId } });
        res.status(200).json({ message: "Xóa bài viết thành công" });
    } catch (error) {
        next(error);
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        let blockedUserIds = [];

        if (userId) {
            const blocks = await prisma.tagBlock.findMany({
                where: {
                    OR: [
                        { blockerId: userId },
                        { blockedId: userId }
                    ]
                }
            });
            blockedUserIds = blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId);
        }

        const posts = await prisma.post.findMany({
            where: {
                author: { isDeactivated: false, status: 'ACTIVE' },
                authorId: { notIn: blockedUserIds }
            },
            orderBy: {
                createdAt: 'desc'
            },
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
                },
                sharedPost: {
                    include: {
                        author: { select: { id: true, displayName: true, avatar: true } }
                    }
                }
            }
        });

        // Map the result to match the expected format on the frontend, if needed
        const formattedPosts = posts.map(post => ({
            ...post,
            taggedPets: post.tags.map(t => t.pet)
        }));

        res.status(200).json(formattedPosts);
    } catch (error) {
        console.error("Loi tai bang tin:", error.message);
        console.error("Chi tiet:", error);
        res.status(500).json({ error: "Loi he thong khi tai bai viet", details: error.message });
    }
}

//reaction
exports.toggleReaction = async (req, res) => {
    try {
        //lay thong tin
        const userId = req.user.userId;
        const postId = parseInt(req.params.postId);
        const { type } = req.body; //loai cam xuc tha

        //kiem tra cam xuc co hop le hay khong
        const allowedReactions = ["LIKE", "LOVE", "BONE", "FISH", "DISLIKE"];
        if (!allowedReactions.includes(type)) {
            return res.status(400).json({ message: "Cam xuc khong hop le" });
        }

        //ktr xem nguoi dung da tung tha cam xuc bai nay chua
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId
                }
            }
        });
        if (existingReaction) {
            //da tha roi
            if (existingReaction.type === type) {
                //bam lai nut tha cam xuc => xoa cam xuc
                await prisma.reaction.delete({
                    where: { id: existingReaction.id }
                });
                return res.status(200).json({ message: "Da go cam xuc" });
            } else {
                const updateReaction = await prisma.reaction.update({
                    where: { id: existingReaction.id },
                    data: { type: type }
                });
                return res.status(200).json({ message: "Da doi cam xuc", reaction: updateReaction });
            }
        } else {
            //th chua tha cam xuc
            const newReaction = await prisma.reaction.create({
                data: {
                    type: type,
                    userId: userId,
                    postId: postId
                }
            });

            // Create notification
            const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
            if (post && post.authorId !== userId) {
                const sender = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } });
                await prisma.notification.create({
                    data: {
                        userId: post.authorId,
                        type: 'REACTION',
                        message: `${sender?.displayName || 'Ai đó'} đã bày tỏ cảm xúc về bài viết của bạn.`,
                        referenceId: postId
                    }
                });
            }

            return res.status(200).json({ message: "Da tha cam xuc", reaction: newReaction });
        }
    } catch (error) {
        console.error("Loi khi tha cam xuc", error);
        return res.status(500).json({ error: "Loi he thong khi xu ly cam xuc" });
    }
};

exports.addComment = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const postId = parseInt(req.params.postId);
        //lay noi dung binh luan va parentId(neu co)
        const { content, parentId } = req.body;
        //ktr noi dung rong
        if (!content || content.trim() === "") {
            return next(new AppError('Noi dung binh luan khong duoc de trong', 400, 'CONTENT_IS_NULL'));
        }
        //ktr bai viet co ton tai khong
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return next(new AppError('Bai viet khong ton tai hoac da bi xoa', 404, 'POST_NOT_FOUND'));
        }
        // neu co parentId la dang reply comment
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parseInt(parentId) }
            });
            //neu parentComment khong ton tai
            if (!parentComment) {
                return next(new AppError('Binh luan ban dang tra loi khong ton tai', 404, 'PARENTS_COMMENT_NOT_FOUND'));
            }
            //neu parentComment o bai viet khac
            if (parentComment.postId !== postId) {
                return next(new AppError('Binh luan cha khong thuoc bai viet nay', 400, 'PARENTS_COMMENT_NOT_FOUND_IN_THIS_POST'));
            }
        }
        //khong co loi gi thi cho comment
        const newComment = await prisma.comment.create({
            data: {
                content: content,
                userId: userId,
                postId: postId,
                // Nếu parentId có giá trị thì ép kiểu về số nguyên, nếu không thì để null
                parentId: parentId ? parseInt(parentId) : null
            }
        });

        // Create notification
        if (post.authorId !== userId) {
            const sender = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } });
            await prisma.notification.create({
                data: {
                    userId: post.authorId,
                    type: 'COMMENT',
                    message: `${sender?.displayName || 'Ai đó'} đã bình luận: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}" trên bài viết của bạn.`,
                    referenceId: postId
                }
            });
        }

        return res.status(201).json({ message: "Binh luan thanh cong", comment: newComment });
    } catch (error) {
        next(error);
    }
};

//Lay danh sach binh luan cua 1 bai viet
exports.getPostComments = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.postId);
        //ktr binh luan co NaN khong 
        if (isNaN(postId)) {
            return next(new AppError('ID bài viết không hợp lệ', 400, 'INVALID_POST_ID'));
        }
        //kiem tra bai viet co ton tai khong
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return next(new AppError('Bài viết không tồn tại hoặc đã bị xóa', 404, 'POST_NOT_FOUND'));
        }
        //lay binh luan goc va keo luon cac binh luan con
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: null
            },
            orderBy: { createdAt: 'desc' },
            include: {
                //thong tin binh luan cha
                user: { select: { id: true, displayName: true, avatar: true } },
                reactions: true,
                //keo binh luan con
                replies: {
                    orderBy: { createdAt: 'asc' }, // Bình luận con thì xếp từ cũ đến mới để dễ đọc ngữ cảnh
                    include: {
                        //thong tin nguoi binh luan con
                        user: { select: { id: true, displayName: true, avatar: true } },
                        reactions: true
                    }
                }
            }
        });
        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }
}

exports.updateComment = async (req, res, next) => {
    try {
        const commentId = parseInt(req.params.commentId);
        const userId = req.user.userId;
        const { content } = req.body;

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return res.status(404).json({ message: "Bình luận không tồn tại" });
        if (comment.userId !== userId) return res.status(403).json({ message: "Không có quyền sửa" });

        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: { content }
        });
        res.status(200).json({ message: "Đã sửa bình luận", comment: updated });
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const commentId = parseInt(req.params.commentId);
        const userId = req.user.userId;

        const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: true } });
        if (!comment) return res.status(404).json({ message: "Bình luận không tồn tại" });
        
        // Owner of the comment OR owner of the post can delete
        if (comment.userId !== userId && comment.post.authorId !== userId) {
            return res.status(403).json({ message: "Không có quyền xóa" });
        }

        await prisma.comment.delete({ where: { id: commentId } });
        res.status(200).json({ message: "Đã xóa bình luận" });
    } catch (error) {
        next(error);
    }
};

exports.reactComment = async (req, res, next) => {
    try {
        const commentId = parseInt(req.params.commentId);
        const userId = req.user.userId;
        const { type } = req.body;

        const existing = await prisma.commentReaction.findUnique({
            where: { userId_commentId: { userId, commentId } }
        });

        if (existing) {
            if (existing.type === type || !type) {
                await prisma.commentReaction.delete({ where: { id: existing.id } });
                return res.status(200).json({ message: "Đã gỡ cảm xúc" });
            } else {
                const updated = await prisma.commentReaction.update({
                    where: { id: existing.id },
                    data: { type }
                });
                return res.status(200).json({ message: "Đã đổi cảm xúc", reaction: updated });
            }
        } else {
            const created = await prisma.commentReaction.create({
                data: { type: type || 'LIKE', userId, commentId }
            });
            return res.status(200).json({ message: "Đã thả cảm xúc", reaction: created });
        }
    } catch (error) {
        next(error);
    }
};