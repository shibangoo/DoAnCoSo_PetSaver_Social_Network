import { resetPassword } from "../../services/auth.service";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useThemeStore from "../../store/themeStore";

export default function Forgot() {
  const navigate = useNavigate();
  const { theme, toggleTheme, initTheme } = useThemeStore();

  const [form, setForm] = useState({ email: "", newPassword: "" });
  const [loading, setLoading] = useState(false);

  // Đảm bảo theme được áp dụng ở trang public
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleReset = async () => {
    if (!form.email || !form.newPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(form);
      toast.success("Đổi mật khẩu thành công!", { position: "top-center" });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đổi mật khẩu", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8] dark:bg-gray-900 px-4 transition-colors duration-200">

      {/* Nút chuyển theme */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg hover:scale-110 transition-all"
        title={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-8 border border-transparent dark:border-gray-700 animate-fade-in">

        <h2 className="text-2xl font-bold text-center text-orange-500 mb-2">
          🐾 Đổi mật khẩu
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Nhập email và mật khẩu mới của bạn
        </p>

        <div className="space-y-4 mb-6">
          <input
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent dark:border-gray-600"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent dark:border-gray-600"
            placeholder="Mật khẩu mới"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className={`w-full bg-orange-500 text-white p-4 rounded-xl font-medium shadow-sm transition-all duration-300 ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-orange-600 hover:shadow-lg hover:-translate-y-1 active:scale-95"
          }`}
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>

        <div className="mt-5 text-center">
          <span
            onClick={() => navigate("/")}
            className="text-sm text-orange-500 cursor-pointer font-medium hover:underline"
          >
            ← Quay lại đăng nhập
          </span>
        </div>

      </div>
    </div>
  );
}