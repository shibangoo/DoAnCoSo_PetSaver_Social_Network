import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useThemeStore from "./store/themeStore";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Friends from "./pages/Friends";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import PetDetail from "./pages/PetDetail";
import Login from "./app/login/Login";
import Register from "./app/register/Register";
import Forgot from "./app/forgot/Forgot";
import ProtectedRoute from "./app/ProtectedRoute";
import FloatingChatbot from "./components/chat/FloatingChatbot";
import "./styles/index.css";


function App() {
  const initTheme = useThemeStore(state => state.initTheme);
  
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          
          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/pet/:id" element={<ProtectedRoute><PetDetail /></ProtectedRoute>} />
        </Routes>
        
        {/* Global Chatbot */}
        <FloatingChatbot />
      </BrowserRouter>
    </div>
  );
}

export default App;