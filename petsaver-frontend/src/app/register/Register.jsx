import { register } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useThemeStore from "../../store/themeStore";

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme, initTheme } = useThemeStore();

  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const [loading, setLoading] = useState(false);

  // Đảm bảo theme luôn được áp dụng ngay cả ở trang register (public)
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.displayName) {
      toast.error("Vui lòng nhập đầy đủ thông tin", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      await register(form);
      toast.success("Đăng ký thành công! Đang chuyển hướng...", { position: "top-center" });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đăng ký", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8] dark:bg-gray-900 px-4 transition-colors duration-200">

      {/* Nút chuyển theme ở góc trên phải */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg hover:scale-110 transition-all"
        title={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/50 p-8 animate-fade-in border border-transparent dark:border-gray-700">

        <h2 className="text-3xl font-bold text-center text-orange-500 mb-2">
          🐾 PetSaver
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Tạo tài khoản mới
        </p>

        <div className="space-y-4 mb-6">
          <input
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
            placeholder="Tên hiển thị"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />

          <input
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full bg-orange-500 text-white p-4 rounded-xl font-medium shadow-sm transition-all duration-300 ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-orange-600 hover:shadow-lg hover:-translate-y-1 active:scale-95"
          }`}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Đã có tài khoản? </span>
          <span
            onClick={() => navigate("/")}
            className="text-orange-500 cursor-pointer font-medium hover:underline transition-all"
          >
            Đăng nhập ngay
          </span>
        </div>

      </div>
    </div>
  );
}