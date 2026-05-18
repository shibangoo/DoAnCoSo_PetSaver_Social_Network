const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: displayName || "Admin",
        role: "ADMIN"
      }
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId || req.user.id,
        action: "CREATE_ADMIN",
        details: JSON.stringify({ createdAdminId: newAdmin.id, email })
      }
    });

    res.status(201).json({ message: "Tạo tài khoản ADMIN thành công.", data: { id: newAdmin.id, email: newAdmin.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi tạo ADMIN." });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const activeUsers = await prisma.user.count({
      where: { status: "ACTIVE", role: "USER" }
    });

    const totalPets = await prisma.pet.count({
      where: { isPermanentlyDeleted: false }
    });

    const successfulRescues = await prisma.pet.count({
      where: { isAdopted: true }
    });

    // Generate REAL 7-day chart data
    const chartData = {
      revenue: [],
      activeUsers: [],
      totalPets: [],
      successfulRescues: []
    };

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });

    const newPets = await prisma.pet.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, isPermanentlyDeleted: false },
      select: { createdAt: true }
    });

    const newRescues = await prisma.pet.findMany({
      where: { isAdopted: true, updatedAt: { gte: sevenDaysAgo } },
      select: { updatedAt: true }
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
      
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const usersCount = newUsers.filter(u => u.createdAt >= startOfDay && u.createdAt <= endOfDay).length;
      const petsCount = newPets.filter(p => p.createdAt >= startOfDay && p.createdAt <= endOfDay).length;
      const rescuesCount = newRescues.filter(r => r.updatedAt >= startOfDay && r.updatedAt <= endOfDay).length;

      chartData.revenue.push({ date: dateStr, value: 0 });
      chartData.activeUsers.push({ date: dateStr, value: usersCount });
      chartData.totalPets.push({ date: dateStr, value: petsCount });
      chartData.successfulRescues.push({ date: dateStr, value: rescuesCount });
    }

    res.status(200).json({
      data: {
        activeUsers,
        totalPets,
        successfulRescues,
        chartData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy thống kê." });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id);

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });
    
    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({ message: "Không thể khóa tài khoản SUPER_ADMIN." });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: "BANNED",
        bannedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId || req.user.id,
        action: "BANNED_USER",
        details: JSON.stringify({ targetUserId, email: user.email })
      }
    });

    res.status(200).json({ message: "Đã khóa tài khoản thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi khóa tài khoản." });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id);

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: "ACTIVE",
        bannedAt: null
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId || req.user.id,
        action: "UNBANNED_USER",
        details: JSON.stringify({ targetUserId, email: user.email })
      }
    });

    res.status(200).json({ message: "Đã mở khóa tài khoản thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi mở khóa tài khoản." });
  }
};

exports.promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id);

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return res.status(400).json({ message: "Người dùng đã có quyền quản trị." });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: "ADMIN" }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId || req.user.id,
        action: "PROMOTE_ADMIN",
        details: JSON.stringify({ targetUserId, email: user.email })
      }
    });

    res.status(200).json({ message: "Đã cấp quyền Admin thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi cấp quyền Admin." });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status } : {};

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: { id: true, displayName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách báo cáo." });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // RESOLVED, DISMISSED

    if (!["RESOLVED", "DISMISSED"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId || req.user.id,
        action: "RESOLVED_REPORT",
        details: JSON.stringify({ reportId: report.id, newStatus: status })
      }
    });

    res.status(200).json({ message: "Cập nhật trạng thái báo cáo thành công.", data: report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi cập nhật báo cáo." });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        bannedAt: true
      },
      orderBy: { id: 'desc' }
    });
    res.status(200).json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách người dùng." });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        admin: {
          select: { id: true, email: true, displayName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Lấy 100 log gần nhất
    });
    res.status(200).json({ data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy lịch sử hoạt động." });
  }
};
