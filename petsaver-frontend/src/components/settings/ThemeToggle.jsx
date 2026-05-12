import { useEffect, useState } from "react";
import { setTheme } from "../../utils/theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDark(saved === "dark");
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    setTheme(next ? "dark" : "light");
  };

  return (
    <div className="flex items-center justify-between">

      <span className="text-sm">Dark Mode</span>

      {/* SWITCH */}
      <div
        onClick={toggle}
        className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition
        ${isDark ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        {/* CIRCLE */}
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition
          flex items-center justify-center text-xs
          ${isDark ? "translate-x-6" : "translate-x-0"}`}
        >
          {isDark ? "🌙" : "☀️"}
        </div>
      </div>

    </div>
  );
}