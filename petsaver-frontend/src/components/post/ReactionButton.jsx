import { useState } from "react";
import { FaThumbsUp, FaHeart, FaLaugh, FaSurprise } from "react-icons/fa";

const reactions = [
  { type: "like", icon: <FaThumbsUp />, color: "text-blue-500" },
  { type: "love", icon: <FaHeart />, color: "text-red-500" },
  { type: "haha", icon: <FaLaugh />, color: "text-yellow-500" },
  { type: "wow", icon: <FaSurprise />, color: "text-yellow-400" },
];

export default function ReactionButton() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);

  const current = reactions.find(r => r.type === selected);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* BUTTON */}
      <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100">
        {current ? (
          <>
            <span className={current.color}>{current.icon}</span>
            <span className={current.color}>{current.type}</span>
          </>
        ) : (
          <>
            <FaThumbsUp />
            <span>Thích</span>
          </>
        )}
      </button>

      {/* POPUP */}
      {show && (
        <div className="absolute bottom-10 left-0 bg-white shadow-lg rounded-full px-3 py-2 flex gap-3 animate-bounce">
          {reactions.map(r => (
            <span
              key={r.type}
              className="text-2xl cursor-pointer hover:scale-125 transition"
              onClick={() => {
                setSelected(r.type);
                setShow(false);
              }}
            >
              {r.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}