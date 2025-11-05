import { create } from 'zustand';

const useSessionStore = create((set, get) => ({
  activeSession: null,
  sessions: [],
  loading: false,
  error: null,

  // Set active session
  setActiveSession: (session) => set({ activeSession: session }),

  // Start new session
  startSession: async (sessionData, token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      set({
        activeSession: data.session,
        loading: false,
        sessions: [data.session, ...get().sessions],
      });

      return data.session;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // End session
  endSession: async (sessionId, endData, token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'end', ...endData }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      set({
        activeSession: null,
        loading: false,
        sessions: get().sessions.map(s =>
          s._id === sessionId ? data.session : s
        ),
      });

      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Pause session
  pauseSession: async (sessionId, token) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'pause' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      set({ activeSession: data.session });
      return data.session;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Resume session
  resumeSession: async (sessionId, token) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'resume' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      set({ activeSession: data.session });
      return data.session;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Add interruption
  addInterruption: async (sessionId, interruptionData, token) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'add_interruption',
          ...interruptionData
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      set({ activeSession: data.session });
      return data.session;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Fetch sessions
  fetchSessions: async (params, token) => {
    set({ loading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(`/api/sessions?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      set({ sessions: data.sessions, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useSessionStore;
