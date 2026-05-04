const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        //check role trong db
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        //khong phai admin thi khong cho vao
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ message: "Khu vuc chi danh cho ADMIN" })
        }
        //neu dung thi vao controller
        next();
    } catch (error) {
        res.status(500).json({ error: "Loi he thong khi kiem tra quyen" });
    }
}

module.exports = isAdmin;