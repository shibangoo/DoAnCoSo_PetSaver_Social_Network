import { useState, useRef } from "react";
import { FaPaw, FaHeart, FaBone, FaFish } from "react-icons/fa";

const reactions = [
  { type: "LIKE", name: "Chân chó", icon: <FaPaw />, color: "text-orange-500" },
  { type: "LOVE", name: "Yêu", icon: <FaHeart />, color: "text-red-500" },
  { type: "BONE", name: "Xương", icon: <FaBone />, color: "text-amber-600" },
  { type: "FISH", name: "Cá mập", icon: <FaFish />, color: "text-blue-500" },
];

export default function ReactionButton({ initialReaction, onReact }) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(initialReaction || null);
  const timerRef = useRef(null);

  const current = reactions.find(r => r.type === selected);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setShow(false);
    }, 400); // Đợi 400ms trước khi ẩn đi
  };

  const handleReact = (type) => {
    const newReaction = selected === type ? null : type;
    setSelected(newReaction);
    setShow(false);
    if (onReact) {
      onReact(type); 
    }
  };

  const handleToggleDefault = () => {
    if (selected) {
      handleReact(selected); 
    } else {
      handleReact("LIKE"); 
    }
  };

  return (
    <div
      className="relative flex-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* BUTTON */}
      <button 
        onClick={handleToggleDefault}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors w-full text-gray-500 font-medium"
      >
        {current ? (
          <>
            <span className={current.color}>{current.icon}</span>
            <span className={current.color}>{current.name}</span>
          </>
        ) : (
          <>
            <FaPaw className="text-gray-400" />
            <span>Thích</span>
          </>
        )}
      </button>

      {/* POPUP */}
      {show && (
        <div className="absolute bottom-full left-0 mb-2 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-full px-4 py-2 flex gap-4 animate-fade-in border border-gray-100 z-10 origin-bottom-left">
          {reactions.map(r => (
            <div
              key={r.type}
              className={`text-3xl cursor-pointer hover:scale-125 hover:-translate-y-2 transition-all relative group ${r.color}`}
              onClick={(e) => {
                e.stopPropagation();
                handleReact(r.type);
              }}
            >
              {r.icon}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {r.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}