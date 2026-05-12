import { register } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!form.email || !form.password || !form.displayName) {
      setError("Nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      await register(form);
      alert("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8]">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
          🐾 Đăng ký PetSaver
        </h2>

        {error && (
          <div className="bg-red-100 text-red-500 p-2 mb-3 rounded text-sm">
            {error}
          </div>
        )}

        <input
          className="w-full p-3 bg-gray-100 rounded-full mb-3"
          placeholder="Tên hiển thị"
          value={form.displayName}
          onChange={(e) =>
            setForm({ ...form, displayName: e.target.value })
          }
        />

        <input
          className="w-full p-3 bg-gray-100 rounded-full mb-3"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          className="w-full p-3 bg-gray-100 rounded-full mb-4"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

      </div>
    </div>
  );
}