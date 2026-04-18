export default function Navbar() {
  return (
    <div className="bg-white shadow px-6 py-3 flex items-center justify-between">
      <h1 className="text-blue-500 font-bold text-xl">PetSaver</h1>

      <input
        className="bg-gray-100 px-4 py-2 rounded-full w-1/3 outline-none"
        placeholder="Tìm kiếm..."
      />

      <div className="flex gap-4 text-xl">
        <span>🏠</span>
        <span>🔔</span>
        <span>👤</span>
      </div>
    </div>
  );
}