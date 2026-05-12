import { login } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
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

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8]">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">🐾 PetSaver</h1>
          <p className="text-gray-400 text-sm">Welcome back!</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-500 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        {/* INPUT */}
        <input
          className="w-full p-3 bg-gray-100 rounded-full mb-3 outline-none"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="w-full p-3 bg-gray-100 rounded-full mb-4 outline-none"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* LINKS */}
        <div className="flex justify-between mt-4 text-sm">
          <span
            onClick={() => navigate("/forgot")}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            Quên mật khẩu?
          </span>

          <span
            onClick={() => navigate("/register")}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            Đăng ký
          </span>
        </div>

      </div>
    </div>
  );
}