import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Tạo tài khoản
        </h2>

        <input placeholder="Tên" className="input" />
        <input placeholder="Email" className="input" />
        <input type="password" placeholder="Mật khẩu" className="input" />
        <input type="password" placeholder="Nhập lại mật khẩu" className="input" />

        <button className="btn-primary mt-3">
          Đăng ký
        </button>

        <p
          className="text-center mt-4 text-blue-500 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Đã có tài khoản? Đăng nhập
        </p>
      </div>
    </div>
  );
}