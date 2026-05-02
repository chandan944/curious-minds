// ─────────────────────────────────────────────
//  socialService.js — API calls for social features
// ─────────────────────────────────────────────
import api from './api';

const socialService = {
  // Toggle like on a user profile
  toggleLike: async (targetUserId) => {
    const res = await api.post(`/api/social/like/${targetUserId}`);
    return res.data; // { liked: boolean, likeCount: number }
  },

  // Send a friend request
  sendFriendRequest: async (targetUserId) => {
    const res = await api.post(`/api/social/friend-request/${targetUserId}`);
    return res.data; // { status: "REQUEST_SENT" | "ALREADY_PENDING" | "ALREADY_FRIENDS" }
  },

  // Accept a friend request
  acceptFriendRequest: async (requesterId) => {
    const res = await api.post(`/api/social/friend-accept/${requesterId}`);
    return res.data; // { status: "ACCEPTED" | "NO_REQUEST" | ... }
  },

  // Get enhanced social profile
  getSocialProfile: async (targetUserId) => {
    const res = await api.get(`/api/social/profile/${targetUserId}`);
    return res.data;
  },

  // Get notifications (paginated)
  getNotifications: async (page = 0, size = 20) => {
    const res = await api.get(`/api/social/notifications?page=${page}&size=${size}`);
    return res.data; // { content: [], totalPages, unreadCount }
  },

  // Mark single notification as read
  markNotificationRead: async (notifId) => {
    const res = await api.post(`/api/social/notifications/read/${notifId}`);
    return res.data;
  },

  // Mark all notifications read
  markAllRead: async () => {
    const res = await api.post('/api/social/notifications/read-all');
    return res.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const res = await api.get('/api/social/notifications/unread-count');
    return res.data; // { unreadCount: number }
  },
};

export default socialService;
