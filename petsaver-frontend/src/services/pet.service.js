import API from "./api";

// Create a new pet
export const createPet = (data) =>
  API.post("/pets", data);

// (Các tính năng khác sẽ thêm sau: update, delete, etc.)
