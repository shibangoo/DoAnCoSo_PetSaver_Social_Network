import { login } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import useThemeStore from "../../store/themeStore";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { theme, toggleTheme, initTheme } = useThemeStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Đảm bảo theme luôn được áp dụng ngay cả ở trang login (public)
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      const res = await login(form);
      localStorage.setItem("token", res.data.token);

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }

      toast.success("Đăng nhập thành công!", { position: "top-center" });
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đăng nhập", { position: "top-center" });
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

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">🐾 PetSaver</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back!</p>
        </div>

        {/* INPUTS */}
        <div className="space-y-4 mb-6">
          <input
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-orange-500 text-white p-4 rounded-xl font-medium shadow-sm transition-all duration-300 ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-orange-600 hover:shadow-lg hover:-translate-y-1 active:scale-95"
          }`}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* LINKS */}
        <div className="flex justify-between mt-6 text-sm">
          <span
            onClick={() => navigate("/forgot")}
            className="text-orange-500 cursor-pointer font-medium hover:underline transition-all"
          >
            Quên mật khẩu?
          </span>

          <span
            onClick={() => navigate("/register")}
            className="text-orange-500 cursor-pointer font-medium hover:underline transition-all"
          >
            Đăng ký
          </span>
        </div>

      </div>
    </div>
  );
}