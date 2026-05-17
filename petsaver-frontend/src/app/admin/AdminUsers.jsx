import { useEffect, useState, useContext } from "react";
import { getUsers, banUser, unbanUser, promoteToAdmin } from "../../services/admin.service";
import toast from "react-hot-toast";
import { Ban, CheckCircle, ShieldAlert, UserPlus } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (error) {
      toast.error("Không thể lấy danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBan = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa người dùng này?")) return;
    try {
      await banUser(id);
      toast.success("Khóa người dùng thành công");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi khóa người dùng");
    }
  };

  const handleUnban = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn mở khóa người dùng này?")) return;
    try {
      await unbanUser(id);
      toast.success("Mở khóa người dùng thành công");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi mở khóa");
    }
  };

  const handlePromote = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn cấp quyền Admin cho người dùng này?")) return;
    try {
      await promoteToAdmin(id);
      toast.success("Cấp quyền Admin thành công");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cấp quyền Admin");
    }
  };

  const calculateDaysLeft = (bannedAt) => {
    if (!bannedAt) return 0;
    const banDate = new Date(bannedAt);
    const deleteDate = new Date(banDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const diff = deleteDate - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <ShieldAlert className="text-orange-500" /> Quản lý Người dùng
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="py-3 px-4 font-medium">Tên hiển thị</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Vai trò</th>
              <th className="py-3 px-4 font-medium">Trạng thái</th>
              <th className="py-3 px-4 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{u.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">{u.displayName}</td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {u.status === 'ACTIVE' ? (
                    <span className="text-green-600 dark:text-green-400 font-medium text-sm flex items-center gap-1">
                      <CheckCircle size={16} /> Active
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-red-600 dark:text-red-400 font-medium text-sm flex items-center gap-1">
                        <Ban size={16} /> Banned
                      </span>
                      <span className="text-xs text-red-400">Xóa sau {calculateDaysLeft(u.bannedAt)} ngày</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {u.id !== currentUser?.id && u.role !== 'SUPER_ADMIN' && (
                    <div className="flex gap-2 flex-wrap">
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleBan(u.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium flex items-center gap-1"
                        >
                          <Ban size={14} /> Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnban(u.id)}
                          className="px-3 py-1.5 text-sm bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-medium flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Unban
                        </button>
                      )}
                      
                      {currentUser?.role === 'SUPER_ADMIN' && u.role === 'USER' && (
                        <button
                          onClick={() => handlePromote(u.id)}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium flex items-center gap-1"
                        >
                          <UserPlus size={14} /> Lên Admin
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">Không có người dùng nào.</div>
        )}
      </div>
    </div>
  );
}
