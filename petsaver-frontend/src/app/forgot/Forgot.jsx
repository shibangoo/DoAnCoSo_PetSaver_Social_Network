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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow w-96">

        <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">
          Đổi mật khẩu
        </h2>

        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Email"
        />

        <input
          type="password"
          className="w-full p-3 border rounded mb-4"
          placeholder="Mật khẩu mới"
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
          Đổi mật khẩu
        </button>

      </div>
    </div>
  );
}