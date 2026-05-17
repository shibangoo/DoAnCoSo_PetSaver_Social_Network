import api from "./api";

export const getDashboardStats = async () => {
  return await api.get("/v1/admin/dashboard/stats");
};

export const getUsers = async () => {
  return await api.get("/v1/admin/users");
};

export const banUser = async (id) => {
  return await api.patch(`/v1/admin/users/${id}/ban`);
};

export const unbanUser = async (id) => {
  return await api.patch(`/v1/admin/users/${id}/unban`);
};

export const promoteToAdmin = async (id) => {
  return await api.patch(`/v1/admin/users/${id}/promote`);
};

export const getReports = async (status) => {
  const query = status ? `?status=${status}` : "";
  return await api.get(`/v1/admin/reports${query}`);
};

export const updateReportStatus = async (id, status) => {
  return await api.patch(`/v1/admin/reports/${id}`, { status });
};

export const getAuditLogs = async () => {
  return await api.get("/v1/admin/audit-logs");
};
