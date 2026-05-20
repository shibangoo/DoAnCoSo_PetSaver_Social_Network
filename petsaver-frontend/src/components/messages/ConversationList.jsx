import { AuthContext } from '../../context/AuthContext';
import React, { useState, useContext } from 'react';
import { getAvatar } from '../../utils/avatar';

const ConversationList = ({ conversations, activeConversationId, onSelectConversation }) => {
    const { user } = useContext(AuthContext);
    const [tab, setTab] = useState('ACCEPTED'); // 'ACCEPTED' or 'PENDING'

    const filteredConversations = conversations.filter(conv => conv.status === tab);

    return (
        <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Messages</h2>
                <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                        onClick={() => setTab('ACCEPTED')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            tab === 'ACCEPTED'
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        Inbox
                    </button>
                    <button
                        onClick={() => setTab('PENDING')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                            tab === 'PENDING'
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        Requests
                        {conversations.some(c => c.status === 'PENDING') && (
                            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm mt-10">
                        No conversations found.
                    </div>
                ) : (
                    filteredConversations.map(conv => {
                        const otherParticipant = conv.participants.find(p => p.userId !== user?.id)?.user;
                        const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
                        const isActive = activeConversationId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-750 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3
                                    ${isActive ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <img
                                        src={getAvatar(otherParticipant?.avatar)}
                                        alt={otherParticipant?.displayName}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {otherParticipant?.displayName || 'Unknown User'}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {lastMessage ? new Date(lastMessage.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {lastMessage ? (
                                            <>
                                                {lastMessage.isEmergency && <span className="text-red-500 font-bold mr-1">[Khẩn cấp]</span>}
                                                {lastMessage.senderId === user?.id ? 'Bạn: ' : ''}
                                                {lastMessage.content || (lastMessage.image ? 'Đã gửi một ảnh' : '')}
                                            </>
                                        ) : (
                                            'Chưa có tin nhắn'
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
