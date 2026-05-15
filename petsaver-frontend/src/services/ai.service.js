import API from "./api";

// Gửi tin nhắn cho AI Chatbot kèm ngữ cảnh
export const chatWithBot = (message, history = []) =>
  API.post("/ai/chat", { message, history });
