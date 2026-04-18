import { HiOutlinePhotograph } from "react-icons/hi";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { HiOutlineTag } from "react-icons/hi";

export default function CreatePost() {
  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <input
        type="text"
        placeholder="Bạn đang nghĩ gì?"
        className="w-full bg-gray-100 p-3 rounded-full outline-none mb-3"
      />

      <div className="flex justify-between text-gray-600 mt-3">
  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
    <HiOutlinePhotograph className="text-green-500 text-xl" />
    <span>Ảnh</span>
  </button>

  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
    <HiOutlineTag className="text-blue-500 text-xl" />
    <span>Thú cưng</span>
  </button>

  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
    <HiOutlineEmojiHappy className="text-yellow-500 text-xl" />
    <span>Cảm xúc</span>
  </button>
</div>
    </div>
  );
}