import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarLeft from "../components/layout/SidebarLeft";
import Navbar from "../components/layout/Navbar";

import SettingSection from "../components/settings/SettingSection";
import SettingInput from "../components/settings/SettingInput";
import { getAvatar } from "../utils/avatar";

import { setTheme } from "../utils/theme";

export default function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [name, setName] = useState(user.displayName || "");
  const [username, setUsername] = useState(user.username || "");
  const [password, setPassword] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="bg-[#f5f6f8] min-h-screen flex">

      {/* SIDEBAR */}
      <div className="w-64 p-4 hidden lg:block">
        <SidebarLeft />
      </div>

      {/* MAIN */}
      <div className="flex-1 max-w-2xl mx-auto p-4">

        <Navbar />

        <h2 className="text-xl font-bold mb-4">Settings</h2>

        {/* ===== PROFILE ===== */}
        <SettingSection title="Profile">

          <div className="flex items-center gap-4 mb-4">

            <img
              src={getAvatar(user?.avatar)}
              className="w-16 h-16 rounded-full object-cover bg-gray-200"
            />

            <button className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm hover:bg-orange-600">
              Change Avatar
            </button>
          </div>

          <div className="space-y-3">
            <SettingInput
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <SettingInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

        </SettingSection>

        {/* ===== PASSWORD ===== */}
        <SettingSection title="Security">

          <SettingInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">
            Update Password
          </button>

        </SettingSection>

        {/* ===== THEME ===== */}
        <SettingSection title="Preferences">

        <div className="flex items-center justify-between">

        <span>Dark Mode</span>

        <button
            onClick={() => {
                const current = localStorage.getItem("theme");
                setTheme(current === "dark" ? "light" : "dark");
            }}
            className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
            Toggle
        </button>

        </div>

        </SettingSection>

        {/* ===== LOGOUT ===== */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}