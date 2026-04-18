import API from "./api";

// lấy danh sách bài viết
export const getPosts = () => API.get("/posts");

// tạo bài viết
export const createPost = (data) => API.post("/posts", data);

// like bài viết
export const likePost = (postId) =>
  API.post(`/posts/${postId}/like`);

// comment
export const commentPost = (postId, content) =>
  API.post(`/posts/${postId}/comment`, { content });