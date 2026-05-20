import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { getAvatar } from '../../utils/avatar';

const SosFloatingCanvas = () => {
    const [sosPosts, setSosPosts] = useState([]);
    const navigate = useNavigate();
    
    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: -300, y: -150 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

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
        const interval = setInterval(fetchSos, 60000);
        return () => clearInterval(interval);
    }, []);

    // Generate stable random positions for cards
    const cardPositions = useMemo(() => {
        return sosPosts.map((_, index) => {
            // Distribute them in a rough grid to prevent complete overlap, but with some randomness
            const cols = 4;
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            const baseX = col * 400 + 100;
            const baseY = row * 250 + 100;
            
            return {
                x: baseX + (Math.random() * 100 - 50),
                y: baseY + (Math.random() * 100 - 50),
                delay: Math.random() * 2 // for floating animation delay
            };
        });
    }, [sosPosts]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        // prevent text selection while dragging
        e.preventDefault(); 
        setPosition({
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        });
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    if (sosPosts.length === 0) return null;

    return (
        <div className="w-full h-[500px] bg-[#0A0F1C] rounded-2xl relative overflow-hidden mb-6 shadow-2xl select-none group border border-gray-800">
            
            <style>
                {`
                @keyframes float-card {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                .float-anim {
                    animation: float-card 6s ease-in-out infinite;
                }
                .radar-bg {
                    background-image: 
                        radial-gradient(circle at center, rgba(255, 69, 58, 0.05) 0%, transparent 60%),
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 100% 100%, 40px 40px, 40px 40px;
                }
                `}
            </style>

            {/* Header / Title */}
            <div className="absolute top-4 left-6 z-20 pointer-events-none flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                    <span className="text-xl">🚨</span>
                </div>
                <div>
                    <h2 className="text-white font-bold text-lg">Radar Tìm Thú Lạc</h2>
                    <p className="text-gray-400 text-xs">Cập nhật khẩn cấp từ cộng đồng</p>
                </div>
            </div>

            {/* Draggable Canvas */}
            <div 
                ref={containerRef}
                className={`w-[2000px] h-[1500px] absolute radar-bg cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
            >
                {/* Center point indicator */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-red-500/50 -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none"></div>

                {/* Render SOS Posts */}
                {sosPosts.map((post, i) => {
                    const pos = cardPositions[i];
                    return (
                        <div 
                            key={post.id}
                            className="absolute float-anim"
                            style={{ 
                                left: `${pos.x}px`, 
                                top: `${pos.y}px`,
                                animationDelay: `${pos.delay}s`
                            }}
                        >
                            <div 
                                onClick={(e) => {
                                    if (isDragging) e.stopPropagation(); // prevent click while dragging
                                    else navigate(`/explore?q=${encodeURIComponent(post.content ? post.content.substring(0, 20) : 'SOS')}`);
                                }}
                                className="w-80 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <img 
                                        src={getAvatar(post.author?.avatar)} 
                                        alt="" 
                                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                                        draggable="false"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-sm truncate">{post.author?.displayName}</h4>
                                        <p className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded-full font-bold border border-red-500/30 whitespace-nowrap">
                                        • LIVE
                                    </div>
                                </div>
                                
                                <p className="text-gray-200 text-sm line-clamp-3 font-medium leading-relaxed mb-3">
                                    {post.content || 'Tìm thú cưng bị lạc...'}
                                </p>

                                {post.lastSeenLocation && (
                                    <div className="flex items-center gap-1.5 text-xs text-orange-300 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                                        <span>📍</span>
                                        <span className="truncate">{post.lastSeenLocation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Instruction Footer */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-gray-400 text-sm bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/5 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                <span>Kéo thả để tìm kiếm khu vực khác</span>
            </div>
        </div>
    );
};

export default SosFloatingCanvas;
