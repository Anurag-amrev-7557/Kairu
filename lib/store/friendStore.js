import { create } from "zustand";

const useFriendStore = create((set, get) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  searchResults: [],
  loading: false,
  error: null,
  searchLoading: false,

  // Fetch all friends (accepted)
  fetchFriends: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/friends?type=accepted", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      set({ friends: data.friendships, loading: false });
      return data.friendships;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch pending friend requests (received)
  fetchPendingRequests: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/friends?type=pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      set({ pendingRequests: data.friendships, loading: false });
      return data.friendships;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch sent friend requests
  fetchSentRequests: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/friends?type=sent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      set({ sentRequests: data.friendships, loading: false });
      return data.friendships;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Search users
  searchUsers: async (query, token) => {
    if (!query || query.length < 2) {
      set({ searchResults: [] });
      return [];
    }

    set({ searchLoading: true, error: null });
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      set({ searchResults: data.users, searchLoading: false });
      return data.users;
    } catch (error) {
      set({ error: error.message, searchLoading: false });
      throw error;
    }
  },

  // Send friend request
  sendFriendRequest: async (friendId, token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friend_id: friendId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Update search results to reflect the new request
      set((state) => ({
        searchResults: state.searchResults.map((user) =>
          user._id === friendId
            ? {
                ...user,
                friendship: {
                  status: "pending",
                  is_requester: true,
                },
              }
            : user
        ),
        sentRequests: [data.friendship, ...state.sentRequests],
        loading: false,
      }));

      return data.friendship;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (friendId, token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friend_id: friendId, action: "accept" }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Remove from pending requests and add to friends
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(
          (req) => req.friend._id !== friendId
        ),
        friends: [data.friendship, ...state.friends],
        loading: false,
      }));

      return data.friendship;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (friendId, token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friend_id: friendId, action: "reject" }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Remove from pending requests
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(
          (req) => req.friend._id !== friendId
        ),
        loading: false,
      }));

      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Remove friend or cancel request
  removeFriend: async (friendId, token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/friends?friend_id=${friendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Remove from all lists
      set((state) => ({
        friends: state.friends.filter((friend) => friend.friend._id !== friendId),
        sentRequests: state.sentRequests.filter(
          (req) => req.friend._id !== friendId
        ),
        pendingRequests: state.pendingRequests.filter(
          (req) => req.friend._id !== friendId
        ),
        searchResults: state.searchResults.map((user) =>
          user._id === friendId ? { ...user, friendship: null } : user
        ),
        loading: false,
      }));

      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear search results
  clearSearchResults: () => set({ searchResults: [] }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useFriendStore;
