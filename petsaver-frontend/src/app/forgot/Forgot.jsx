import { useNavigate } from "react-router-dom";

export default function Forgot() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h2 className="text-xl font-semibold mb-4 text-center">
          Quên mật khẩu
        </h2>

        <input
          placeholder="Nhập email của bạn"
          className="w-full p-3 border rounded-lg mb-4"
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Gửi link reset
        </button>

        <p
          className="text-center mt-4 text-blue-500 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Quay lại đăng nhập
        </p>
      </div>
    </div>
  );
}