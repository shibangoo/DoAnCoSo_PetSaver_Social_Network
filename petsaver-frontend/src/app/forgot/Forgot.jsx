import { resetPassword } from "../../services/auth.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Forgot() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    newPassword: "",
  });

  const handleReset = async () => {
    if (!form.email || !form.newPassword) {
      alert("Nhập đầy đủ thông tin");
      return;
    }

    try {
      await resetPassword(form);
      alert("Đổi mật khẩu thành công!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi reset");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8]">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
          🐾 Đổi mật khẩu
        </h2>

        <input
          className="w-full p-3 bg-gray-100 rounded-full mb-3"
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          className="w-full p-3 bg-gray-100 rounded-full mb-4"
          placeholder="Mật khẩu mới"
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
        />

        <button
          onClick={handleReset}
          className="w-full bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600"
        >
          Đổi mật khẩu
        </button>

      </div>
    </div>
  );
}