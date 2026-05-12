import defaultAvatar from "../assets/default-avatar.svg";

export const getAvatar = (avatar) => {
  return avatar ? avatar : defaultAvatar;
};