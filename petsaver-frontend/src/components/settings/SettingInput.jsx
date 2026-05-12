export default function SettingInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-500">{label}</label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>
  );
}