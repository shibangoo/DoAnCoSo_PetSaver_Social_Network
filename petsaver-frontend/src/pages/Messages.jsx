import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import { getConversations } from '../services/message.service';
import socketService from '../services/socket.service';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Messages = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            
            // If we have an active conversation from state, or passed via location state
            const targetId = activeConversation?.id || location.state?.activeConversationId;
            if (targetId) {
                const updatedActive = data.find(c => c.id === targetId);
                if (updatedActive) {
                    setActiveConversation(updatedActive);
                }
            }
        } catch (error) {
            toast.error('Không thể tải danh sách tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadConversations();
            socketService.connect(user.id);
            
            const handleNewMessage = (msg) => {
                // We re-fetch conversations to update the latest message and sort order
                loadConversations();
            };

            socketService.onNewMessage(handleNewMessage);

            return () => {
                socketService.offNewMessage(handleNewMessage);
                // We might not want to disconnect entirely if they navigate to another page,
                // but for now, disconnecting on unmount is safe if they leave messages page.
                // Or maybe socket should live globally. We'll leave it connected for now, 
                // socketService is a singleton.
            };
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar />
            <div className="flex-1 flex overflow-hidden pt-4 md:pt-16"> {/* Adjust padding based on layout */}
                <div className="container mx-auto max-w-6xl w-full h-[calc(100vh-4rem)] flex bg-white dark:bg-gray-800 shadow-xl overflow-hidden md:rounded-t-2xl border-x border-t border-gray-200 dark:border-gray-700">
                    <ConversationList 
                        conversations={conversations} 
                        activeConversationId={activeConversation?.id}
                        onSelectConversation={setActiveConversation}
                    />
                    <div className={`${activeConversation ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
                        <ChatWindow 
                            conversation={activeConversation} 
                            onConversationUpdated={loadConversations} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
