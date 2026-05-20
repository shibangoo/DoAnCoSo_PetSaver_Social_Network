import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const SosTicker = () => {
    const [sosPosts, setSosPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSos = async () => {
            try {
                const res = await API.get('/posts/sos');
                setSosPosts(res.data);
            } catch (err) {
                console.error("Lỗi lấy SOS posts", err);
            }
        };
        fetchSos();
        const interval = setInterval(fetchSos, 60000); // 1 minute
        return () => clearInterval(interval);
    }, []);

    if (sosPosts.length === 0) return null;

    return (
        <div className="bg-red-600 text-white py-2 overflow-hidden flex items-center relative shadow-md z-[60] w-full h-10 group">
            <div className="absolute left-0 bg-red-600 px-4 font-bold h-full flex items-center z-10 border-r border-red-500 shadow-[10px_0_15px_-3px_rgba(220,38,38,1)] text-sm md:text-base">
                🚨 TÌM THÚ CƯNG KHẨN CẤP
            </div>
            
            <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] pl-48 md:pl-64">
                {sosPosts.map(post => (
                    <div 
                        key={post.id} 
                        className="mx-8 cursor-pointer hover:underline flex items-center gap-2"
                        onClick={() => navigate(`/explore?q=${encodeURIComponent(post.content ? post.content.substring(0, 20) : 'SOS')}`)}
                    >
                        <span className="font-semibold">{post.author?.displayName}:</span> 
                        <span className="text-sm truncate max-w-sm">{post.content || 'Tìm thú cưng bị lạc...'}</span>
                        {post.lastSeenLocation && <span className="text-xs bg-red-800 px-2 py-0.5 rounded-full ml-2">📍 {post.lastSeenLocation}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SosTicker;
