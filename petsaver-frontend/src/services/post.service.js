import API from "./api";

// lấy danh sách bài viết
export const getPosts = () => API.get("/posts");

// create post (cần token)
export const createPost = (data) =>
  API.post("/posts/create", data);

// like bài viết
export const likePost = (postId) =>
  API.post(`/posts/${postId}/like`);

// comment
export const commentPost = (postId, content) =>
  API.post(`/posts/${postId}/comment`, { content });