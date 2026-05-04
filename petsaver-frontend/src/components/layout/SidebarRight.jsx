export default function SidebarRight() {
  return (
    <div className="sticky top-20 space-y-4">

      {/* GỢI Ý */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Gợi ý cho bạn</h3>

        <div className="flex items-center justify-between mb-2">
          <span>🐶 Pet Lover VN</span>
          <button className="text-blue-500">Theo dõi</button>
        </div>

        <div className="flex items-center justify-between">
          <span>🐱 Cat Community</span>
          <button className="text-blue-500">Theo dõi</button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-xs text-gray-500">
        PetSaver © 2026
      </div>
    </div>
  );
}