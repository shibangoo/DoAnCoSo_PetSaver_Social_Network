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
      console.log(err);
      setError(err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white p-8 rounded-xl shadow w-96">

        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Đăng ký PetSaver
        </h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* DISPLAY NAME */}
        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Tên hiển thị"
          value={form.displayName}
          onChange={(e) =>
            setForm({ ...form, displayName: e.target.value })
          }
        />

        {/* EMAIL */}
        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          className="w-full p-3 border rounded mb-4"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRegister();
          }}
        />

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

      </div>
    </div>
  );
}