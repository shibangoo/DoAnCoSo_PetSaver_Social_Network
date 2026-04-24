import { useState } from "react";
import { createPost } from "../../services/post.service";

export default function CreatePost() {
  const [content, setContent] = useState("");

  const handlePost = async () => {
    if (!content) {
      alert("Nhập nội dung");
      return;
    }

    try {
      await createPost({
        content,
        image: "",
        petIds: [],
      });

      alert("Đăng bài thành công");
      setContent("");
    } catch (err) {
      alert("Lỗi đăng bài");
    }
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={handlePost}>
        Đăng bài
      </button>
    </div>
  );
}