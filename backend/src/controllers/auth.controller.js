const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

//Sign up
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        //ktr email co ton tai khong
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email nay da duoc su dung" });
        }

        //ma hoa mat khau
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //tao user moi
        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword }
        });
        res.status(201).json({ message: "Dang ky thanh cong!", userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: "Loi he thong" });
    }
};

//sign-in
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //1 tim user bang email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log("-> DỪNG: Không tìm thấy tài khoản!");
            return res.status(400).json({ message: "User khong ton tai" });
        }

        //2 so sanh mat khau
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Sai mat khau" });
        }

        //4 Tao JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: "Dang nhap thanh cong", token });
    } catch (error) {
        res.status(500).json({ error: "Loi he thong" });
    }
};

exports.reserPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    //Hash mk moi
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    //cap nhat vao db
    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    res.status(200).json({ message: "Doi mat khau thanh cong" });
}

exports.getAllUsers = async (req, res) => {
    try {
        //lay users nhung giau mk
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, displayName: true, password: true }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Loi khi lay danh sach" });
    }
}
