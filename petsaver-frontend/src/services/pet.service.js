import API from "./api";

// ─────────────────────────────────────────────
// CÁC THAO TÁC VỚI THÚ CƯNG (PET CRUD)
// ─────────────────────────────────────────────

/** Tạo thú cưng mới */
export const createPet = (data) => API.post("/pets", data);

/** Lấy chi tiết một thú cưng theo ID (bao gồm owner, co-owner) */
export const getPetById = (id) => API.get(`/pets/${id}`);

/** Cập nhật thông tin thú cưng */
export const updatePet = (id, data) => API.put(`/pets/${id}`, data);

/** Xóa mềm thú cưng (đưa vào thùng rác) */
export const softDeletePet = (id) => API.delete(`/pets/${id}`);

/** Khôi phục thú cưng từ thùng rác */
export const restorePet = (id) => API.post(`/pets/${id}/restore`);

/** Chuyển nhượng quyền sở hữu thú cưng */
export const transferOwnership = (id, newOwnerId) =>
  API.post(`/pets/${id}/transfer`, { newOwnerId });

/** Mời đồng sở hữu */
export const inviteCoOwner = (petId, inviteeId) =>
  API.post(`/co-ownership/invite`, { petId, inviteeId });

/** Phản hồi lời mời đồng sở hữu */
export const respondToCoOwnerInvite = (inviteId, action) =>
  API.post(`/co-ownership/invites/${inviteId}/respond`, { action });

// ─────────────────────────────────────────────
// TÌM KIẾM
// ─────────────────────────────────────────────

/** Tìm kiếm người dùng + thú cưng theo từ khóa */
export const searchAll = (query) =>
  API.get(`/search`, { params: { q: query } });
