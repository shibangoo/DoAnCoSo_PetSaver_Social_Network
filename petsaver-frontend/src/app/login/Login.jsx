import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          PetSaver
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 border rounded-lg focus:outline-blue-500"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-blue-500"
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Đăng nhập
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/forgot")}
          >
            Quên mật khẩu?
          </span>

          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </span>
        </div>
      </div>
    </div>
  );
}