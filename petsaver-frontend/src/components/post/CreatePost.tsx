export default function CreatePost() {
  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <input
        className="w-full bg-gray-100 px-4 py-2 rounded-full outline-none"
        placeholder="Bạn đang nghĩ gì?"
      />

      <div className="flex justify-between mt-4 text-gray-600 text-sm">
        <span>📷 Ảnh</span>
        <span>🐶 Thú cưng</span>
        <span>😊 Cảm xúc</span>
      </div>
    </div>
  );
}