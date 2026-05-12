export default function SettingSection({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}