const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const restrictTo = (...roles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId || req.user.id;
            
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (!user) {
                 return res.status(401).json({ message: "Người dùng không tồn tại." });
            }

            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này (403 Forbidden)." });
            }
            
            req.userRole = user.role;
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Lỗi hệ thống khi kiểm tra quyền" });
        }
    }
}

module.exports = { restrictTo };