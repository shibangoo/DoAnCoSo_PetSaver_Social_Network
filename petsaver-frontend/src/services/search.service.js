import API from "./api";

export const getExploreContent = () => {
  return API.get("/search/explore");
};

export const searchAll = (keyword) => {
  return API.get(`/search?q=${encodeURIComponent(keyword)}`);
};
