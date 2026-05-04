import { useState } from "react";
// const { user } = useContext(AuthContext);

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  

  // auto resize textarea
  const handleInput = (e) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // chọn ảnh
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // đăng bài (fake)
  const handlePost = () => {
    if (!content && !image) return;

    console.log("POST:", { content, image });

    // reset
    setContent("");
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={handleInput}
            rows={1}
            placeholder="Bạn đang nghĩ gì?"
            className="w-full resize-none p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
          />
        </div>
      </div>

      {/* PREVIEW IMAGE */}
      {preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="preview"
            className="rounded-lg w-full max-h-80 object-cover"
          />
        </div>
      )}

      <hr className="my-3" />

      {/* ACTIONS */}
      <div className="flex justify-between items-center">

        {/* UPLOAD IMAGE */}
        <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-blue-600">
          📷 Ảnh
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImage}
          />
        </label>

        {/* POST BUTTON */}
        <button
          onClick={handlePost}
          disabled={!content && !image}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Đăng bài
        </button>
      </div>
    </div>
  );
}