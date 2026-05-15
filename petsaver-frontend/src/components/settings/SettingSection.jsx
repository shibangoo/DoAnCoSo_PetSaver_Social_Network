export default function SettingSection({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm mb-4 border dark:border-gray-700 transition-colors">
      <h3 className="font-semibold mb-3 dark:text-white">{title}</h3>
      {children}
    </div>
  );
}