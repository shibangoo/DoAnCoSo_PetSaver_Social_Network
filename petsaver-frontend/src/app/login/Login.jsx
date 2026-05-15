import { login } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 animate-fade-in">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">🐾 PetSaver</h1>
          <p className="text-gray-500 text-sm">Welcome back!</p>
        </div>

        {/* INPUT */}
        <div className="space-y-4 mb-6">
          <input
            className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent focus:bg-white"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 border border-transparent focus:bg-white"
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