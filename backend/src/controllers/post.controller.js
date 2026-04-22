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
                taggedPets: {
                    connect: petIds.map(id => ({ id: id }))
                }
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
