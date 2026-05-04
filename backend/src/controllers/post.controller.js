const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

exports.addComment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const postId = parseInt(req.params.postId);
        //lay noi dung binh luan va parentId(neu co)
        const { content, parentId } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Noi dung binh luan khong duoc de trong" })
        }
        const newComment = await prisma.comment.create({
            data: {
                content: content,
                userId: userId,
                postId: postId,
                parentId: parentId || null
            },
            include: {
                user: { select: { id: true, displayName: true, avatar: true } }
            }
        });
        res.status(201).json({ message: "Da binh luan", comment: newComment });
    } catch (error) {
        console.error("loi khi binh luan", error);
        res.status(500).json({ error: "Loi he thong khi xu ly binh luan" });
    }
};

//Lay danh sach binh luan cua 1 bai viet
exports.getPostComments = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        //lay binh luan goc va keo luon cac binh luan con
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: null
            },
            orderBy: { createAt: 'desc' },
            include: {
                //thong tin binh luan cha
                user: { select: { id: true, displayName: true, avatar: true } },
                //keo binh luan con
                replies: {
                    orderBy: { createdAt: 'asc' }, // Bình luận con thì xếp từ cũ đến mới để dễ đọc ngữ cảnh
                    include: {
                        //thong tin nguoi binh luan con
                        user: { select: { id: true, displayName: true, avatar: true } }
                    }
                }
            }
        });
        res.status(200).json(commnents);
    } catch (error) {
        console.error("Lỗi lấy bình luận:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi tải bình luận" });
    }
}