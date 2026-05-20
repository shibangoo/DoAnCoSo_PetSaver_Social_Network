import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const createOrGetConversation = async (targetUserId) => {
    const response = await axios.post(`${API_URL}/messages/conversations`, { targetUserId }, getHeaders());
    return response.data;
};

export const getConversations = async () => {
    const response = await axios.get(`${API_URL}/messages/conversations`, getHeaders());
    return response.data;
};

export const getMessages = async (conversationId, cursor = null, limit = 30) => {
    const url = new URL(`${API_URL}/messages/${conversationId}`);
    if (cursor) url.searchParams.append('cursor', cursor);
    if (limit) url.searchParams.append('limit', limit);
    
    const response = await axios.get(url.toString(), getHeaders());
    return response.data;
};

export const sendMessage = async (conversationId, content, image = null, isEmergency = false) => {
    const response = await axios.post(`${API_URL}/messages/${conversationId}`, {
        content,
        image,
        isEmergency
    }, getHeaders());
    return response.data;
};

export const acceptConversation = async (conversationId) => {
    const response = await axios.put(`${API_URL}/messages/${conversationId}/accept`, {}, getHeaders());
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await axios.get(`${API_URL}/messages/unread-count`, getHeaders());
    return response.data;
};

export const markAsRead = async (conversationId) => {
    const response = await axios.put(`${API_URL}/messages/${conversationId}/read`, {}, getHeaders());
    return response.data;
};
