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