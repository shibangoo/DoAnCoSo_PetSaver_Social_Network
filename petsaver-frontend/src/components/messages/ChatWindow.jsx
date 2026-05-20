import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { sendMessage, acceptConversation, getMessages, markAsRead } from '../../services/message.service';
import socketService from '../../services/socket.service';
import { Send, Image as ImageIcon, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvatar } from '../../utils/avatar';

const ChatWindow = ({ conversation, onConversationUpdated }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const otherParticipant = conversation?.participants?.find(p => p.userId !== user?.id)?.user;
    
    // The current user didn't send the first message, so they are the one receiving the request
    const isReceiverInPending = conversation?.status === 'PENDING' && 
                                (conversation.messages && conversation.messages.length > 0 && 
                                 conversation.messages[0].senderId !== user?.id);

    // Calculate how many messages the current user has sent in this conversation
    const sentCount = messages.filter(m => m?.senderId === user?.id).length;
    const tokensLeft = Math.max(0, 3 - sentCount);
    
    // If PENDING and user sent the first message, they are locked out after 3 messages (unless emergency)
    const isSenderInPending = conversation?.status === 'PENDING' && 
                                (messages.length > 0 && messages[0]?.senderId === user?.id);
    
    const isSenderLimitReached = isSenderInPending && tokensLeft === 0;

    useEffect(() => {
        if (conversation) {
            loadInitialMessages();
        }
    }, [conversation?.id]);

    useEffect(() => {
        const handleNewMessage = (newMessage) => {
            if (newMessage.conversationId === conversation?.id) {
                setMessages(prev => [...prev, newMessage]);
                scrollToBottom();
                
                // Mark as read immediately since the window is open
                if (newMessage.senderId !== user?.id) {
                    markAsRead(conversation.id).catch(console.error);
                }
            }
        };

        socketService.onNewMessage(handleNewMessage);
        return () => {
            socketService.offNewMessage(handleNewMessage);
        };
    }, [conversation?.id]);

    const loadInitialMessages = async () => {
        setLoading(true);
        try {
            const data = await getMessages(conversation.id, null, 30);
            setMessages(data);
            if (data.length > 0) {
                setCursor(data[0].id); // The first item in the array is the oldest (since we reversed it in backend), wait no.
                // Backend returns chronological order. So data[0] is oldest. data[data.length-1] is newest.
                setCursor(data[0].id); 
            }
            if (data.length < 30) setHasMore(false);
            else setHasMore(true);
            setTimeout(() => scrollToBottom(), 100);
            
            // Mark conversation as read when opening
            markAsRead(conversation.id).catch(console.error);
        } catch (error) {
            toast.error('Lỗi khi tải tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    const loadMoreMessages = async () => {
        if (!hasMore || loadingMore || !cursor) return;
        setLoadingMore(true);
        
        // Save current scroll height to maintain position
        const scrollHeight = scrollContainerRef.current.scrollHeight;

        try {
            const data = await getMessages(conversation.id, cursor, 30);
            if (data.length > 0) {
                setMessages(prev => [...data, ...prev]);
                setCursor(data[0].id);
                
                // Adjust scroll position after render
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        const newScrollHeight = scrollContainerRef.current.scrollHeight;
                        scrollContainerRef.current.scrollTop = newScrollHeight - scrollHeight;
                    }
                }, 0);
            }
            if (data.length < 30) setHasMore(false);
        } catch (error) {
            toast.error('Lỗi khi tải thêm tin nhắn');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        if (e.target.scrollTop === 0) {
            loadMoreMessages();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        setIsSending(true);
        try {
            const res = await sendMessage(conversation.id, input, null, false);
            setMessages(prev => [...prev, res]);
            setInput('');
            scrollToBottom();
            onConversationUpdated(); // Trigger refresh in parent
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error(error.response.data.error || 'Bị chặn vì quy định Spam.');
            } else {
                toast.error('Không thể gửi tin nhắn.');
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleAccept = async () => {
        try {
            await acceptConversation(conversation.id);
            toast.success('Đã chấp nhận tin nhắn!');
            onConversationUpdated();
        } catch (error) {
            toast.error('Không thể chấp nhận cuộc trò chuyện.');
        }
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 h-full">
                <div className="w-24 h-24 mb-4 text-gray-300 dark:text-gray-600">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z"></path></svg>
                </div>
                <h2 className="text-xl font-medium text-gray-500 dark:text-gray-400">Chọn một đoạn chat để bắt đầu nhắn tin</h2>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0">
                <div className="flex items-center space-x-3">
                    <img
                        src={getAvatar(otherParticipant?.avatar)}
                        alt={otherParticipant?.displayName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    />
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {otherParticipant?.displayName || 'Người dùng'}
                        </h2>
                        {conversation.status === 'PENDING' && (
                            <span className="text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                Đang chờ
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                ref={scrollContainerRef}
                onScroll={handleScroll}
            >
                {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>}
                {loadingMore && <div className="flex justify-center p-2"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>}
                
                {messages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id;
                    const showEmergencyFlag = msg.isEmergency;

                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {!isMine && (
                                <img
                                    src={getAvatar(msg?.sender?.avatar)}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full mr-2 mt-auto object-cover"
                                />
                            )}
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isMine 
                                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
                            }`}>
                                {showEmergencyFlag && (
                                    <div className={`flex items-center space-x-1 text-xs font-bold mb-1 ${isMine ? 'text-red-200' : 'text-red-500'}`}>
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>KHẨN CẤP</span>
                                    </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                <span className={`text-[10px] block mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'} text-right`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Pending State Banner */}
            {isReceiverInPending && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 p-4 shrink-0">
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 text-center">
                        {otherParticipant?.displayName} muốn gửi tin nhắn cho bạn. Chấp nhận để tiếp tục trò chuyện.
                    </p>
                    <div className="flex justify-center space-x-3">
                        <button 
                            onClick={handleAccept}
                            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Chấp nhận</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                {isSenderLimitReached ? (
                    <div className="text-center p-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        Bạn đã nhắn hết ba tin nhắn, chờ hoặc kết bạn để được trò chuyện tiếp.
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex flex-col space-y-2">
                        {isSenderInPending && (
                            <div className="text-xs text-orange-500 dark:text-orange-400 font-medium px-2 flex justify-between">
                                <span>Đang chờ chấp nhận...</span>
                                <span>Bạn còn {tokensLeft} lượt nhắn tin</span>
                            </div>
                        )}
                        <div className="flex items-end space-x-2">
                            <button type="button" className="p-2.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                <ImageIcon className="w-6 h-6" />
                            </button>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl border-0 overflow-hidden">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="w-full bg-transparent border-0 focus:ring-0 resize-none p-3 max-h-32 text-sm text-gray-900 dark:text-white"
                                rows="1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isSending}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
