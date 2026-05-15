import API from "./api";

// get my friends
export const getFriends = () =>
  API.get("/friends");

// get friend requests
export const getRequests = () =>
  API.get("/friends/requests");

// send friend request
export const sendFriendRequest = (user2Id) =>
  API.post("/friends/request", { user2Id });

// accept request
export const acceptRequest = (requestId) =>
  API.post(`/friends/requests/${requestId}/accept`);

// reject request
export const rejectRequest = (requestId) =>
  API.delete(`/friends/requests/${requestId}/reject`);

// unfriend
export const unfriend = (friendId) =>
  API.delete(`/friends/${friendId}/unfriend`);
