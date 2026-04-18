// src/components/layout/RightSidebar.jsx
export default function RightSidebar() {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">Gợi ý bạn bè</h3>
      <div className="space-y-2">
        <div className="bg-white p-2 rounded shadow">Người dùng A</div>
        <div className="bg-white p-2 rounded shadow">Người dùng B</div>
      </div>
    </div>
  );
}