import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useThemeStore from "../store/themeStore";
import toast from "react-hot-toast";
import API from "../services/api";

import SidebarLeft from "../components/layout/SidebarLeft";
import Navbar from "../components/layout/Navbar";
import SettingSection from "../components/settings/SettingSection";
import SettingInput from "../components/settings/SettingInput";
import { getAvatar } from "../utils/avatar";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [deletePassword, setDeletePassword] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Vui lòng điền đủ thông tin");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }
    try {
      await API.put('/auth/change-password', { oldPassword, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await API.get('/auth/blocked-users');
      setBlockedUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (id) => {
    try {
      await API.post(`/auth/unblock/${id}`);
      toast.success("Đã bỏ chặn người dùng");
      fetchBlockedUsers();
    } catch (err) {
      toast.error("Lỗi khi bỏ chặn");
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa tài khoản tạm thời? (Bạn có thể mở lại bằng cách đăng nhập)")) return;
    try {
      await API.post('/auth/deactivate');
      toast.success("Đã khóa tài khoản tạm thời");
      handleLogout();
    } catch (err) {
      toast.error("Lỗi khi khóa tài khoản");
    }
  };

  const handleDelete = async () => {
    if (!deletePassword) return toast.error("Vui lòng nhập mật khẩu để xóa tài khoản");
    if (!window.confirm("CẢNH BÁO: Xóa tài khoản sẽ mất toàn bộ dữ liệu vĩnh viễn. Bạn chắc chắn chứ?")) return;
    try {
      await API.post('/auth/delete-account', { password: deletePassword });
      toast.success("Đã xóa tài khoản vĩnh viễn");
      handleLogout();
    } catch (err) {
      toast.error(err.response?.data?.message || "Mật khẩu không đúng hoặc lỗi hệ thống");
    }
  };

  return (
    <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen flex transition-colors">
      <div className="w-64 p-4 hidden lg:block">
        <SidebarLeft />
      </div>

      <div className="flex-1 max-w-2xl mx-auto p-4">
        <Navbar />

        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Settings</h2>

        {/* ===== PROFILE ===== */}
        <SettingSection title="Profile">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={getAvatar(user?.avatar)}
              className="w-16 h-16 rounded-full object-cover bg-gray-200"
            />
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{user.displayName || "User"}</p>
              <p className="text-sm text-gray-500">@{user.username || user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
          >
            Đi đến Trang cá nhân để chỉnh sửa
          </button>
        </SettingSection>

        {/* ===== PASSWORD ===== */}
        <SettingSection title="Security">
          <div className="space-y-3">
            <SettingInput
              label="Mật khẩu cũ"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <SettingInput
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <SettingInput
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button 
            onClick={handleChangePassword}
            className="mt-4 w-full bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 font-medium transition"
          >
            Đổi mật khẩu
          </button>
        </SettingSection>

        {/* ===== BLOCKED USERS ===== */}
        <SettingSection title="Blocked Users">
          {blockedUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">Bạn chưa chặn ai.</p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <img src={getAvatar(u.avatar)} className="w-10 h-10 rounded-full" />
                    <span className="font-bold dark:text-white">{u.displayName}</span>
                  </div>
                  <button 
                    onClick={() => handleUnblock(u.id)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Bỏ chặn
                  </button>
                </div>
              ))}
            </div>
          )}
        </SettingSection>

        {/* ===== THEME ===== */}
        <SettingSection title="Preferences">
          <div className="flex items-center justify-between">
            <span className="dark:text-white font-medium">Dark Mode</span>
            <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 dark:text-white transition font-medium"
            >
                {theme === 'dark' ? 'Đang bật' : 'Đang tắt'}
            </button>
          </div>
        </SettingSection>

        {/* ===== DANGER ZONE ===== */}
        <SettingSection title="Danger Zone">
          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
              <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-1">Khóa tài khoản tạm thời</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Tài khoản và bài viết của bạn sẽ bị ẩn. Việc đăng nhập lại sẽ tự động mở khóa.</p>
              <button 
                onClick={handleDeactivate}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition"
              >
                Khóa tài khoản
              </button>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">Xóa tài khoản vĩnh viễn</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Hành động này không thể hoàn tác. Vui lòng nhập mật khẩu để xác nhận.</p>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu..." 
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  className="flex-1 px-3 py-2 border border-red-200 dark:border-red-800 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-red-400"
                />
                <button 
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition font-medium"
                >
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* ===== LOGOUT ===== */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm mb-10">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Đăng xuất
          </button>
        </div>

      </div>
    </div>
  );
}