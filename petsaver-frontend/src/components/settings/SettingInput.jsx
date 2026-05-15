export default function SettingInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-500 dark:text-gray-400">{label}</label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
      />
    </div>
  );
}