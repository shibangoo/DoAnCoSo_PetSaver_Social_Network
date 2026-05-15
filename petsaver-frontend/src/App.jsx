import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Settings from "./pages/Settings";
import Login from "./app/login/Login";
import Register from "./app/register/Register";
import Forgot from "./app/forgot/Forgot";
import ProtectedRoute from "./app/ProtectedRoute";
import FloatingChatbot from "./components/chat/FloatingChatbot";
import "./styles/index.css";


function App() {
  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          
          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
        
        {/* Global Chatbot */}
        <FloatingChatbot />
      </BrowserRouter>
    </>
  );
}

export default App;