const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

exports.createPost = async (req, res) => {
    try {
        //lay thong tin user va thong tin user dang len
        const authorId = req.user.userId;
        const { content, image, petIds } = req.body;

        //luu bai viet vao db
        const newPost = await prisma.post.create({
            data: {
                content: content,
                image: image,
                authorId: authorId,
                taggedPets: petIds
                    ? { connect: petIds.map(id => ({ id })) }   //có thể có hoặc không có petId
                    : undefined
            }
        });
        res.status(200).json({ message: "Dang bai thanh cong", post: newPost });
    } catch (error) {
        res.status(500).json({ error: "Loi khi dang bai" });
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        //lay tat ca bai viet trong db
        const posts = await prisma.post.findMany({
            //sap xep bai moi nhat len dau tien
            orderBy: {
                createdAt: 'desc'
            },
            //keo theo du lieu tu cac bang khac
            include: {
                //lay thong tin tac gia
                author: {
                    select: { id: true, displayName: true, avatar: true }
                },
                //lay ds thu cung duoc tagged
                taggedPets: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });
        res.status(200).json(posts);
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
        if (type !== "LIKE" && type !== "DISLIKE") {
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
        return status(201).json({ message: "Binh luan thanh cong", comment: newComment });
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
                //keo binh luan con
                replies: {
                    orderBy: { createddAt: 'asc' }, // Bình luận con thì xếp từ cũ đến mới để dễ đọc ngữ cảnh
                    include: {
                        //thong tin nguoi binh luan con
                        user: { select: { id: true, displayName: true, avatar: true } }
                    }
                }
            }
        });
        res.status(200).json(commnents);
    } catch (error) {
        next(error);
    }
}