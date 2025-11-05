import { create } from "zustand";
import { persist } from "zustand/middleware";

const TASKS_PER_PAGE = 20;

const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalTasks: 0,
      hasMore: true,
      lastFetch: null,
      cache: {},

      // Check cache validity
      isCacheValid: () => {
        const lastFetch = get().lastFetch;
        if (!lastFetch) return false;
        // Cache valid for 5 minutes
        return Date.now() - lastFetch < 300000;
      },

      // Fetch tasks with pagination and caching
      fetchTasks: async (params = {}, token, forceRefresh = false) => {
        const store = get();
        const page = params.page || store.currentPage;
        const cacheKey = JSON.stringify({ ...params, page });

        // Return cached data if valid and not forcing refresh
        if (!forceRefresh && store.isCacheValid() && store.cache[cacheKey]) {
          return store.cache[cacheKey];
        }

        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams({
            ...params,
            page,
            limit: TASKS_PER_PAGE,
          }).toString();

          const res = await fetch(`/api/tasks?${queryParams}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.error);

          const newTasks =
            page === 1 ? data.tasks : [...store.tasks, ...data.tasks];
          const newCache = { ...store.cache, [cacheKey]: data.tasks };

          set({
            tasks: newTasks,
            totalTasks: data.total,
            hasMore: data.tasks.length === TASKS_PER_PAGE,
            currentPage: page,
            loading: false,
            lastFetch: Date.now(),
            cache: newCache,
          });

          return data.tasks;
        } catch (error) {
          set({
            error: error.message,
            loading: false,
            lastFetch: null,
          });
          throw error;
        }
      },

      // Load more tasks
      loadMoreTasks: async (token) => {
        const store = get();
        if (!store.hasMore || store.loading) return;

        await store.fetchTasks({ page: store.currentPage + 1 }, token);
      },

      // Refresh tasks
      refreshTasks: async (params = {}, token) => {
        set({ currentPage: 1, cache: {} });
        return await get().fetchTasks(params, token, true);
      },

      // Create task with optimistic update
      createTask: async (taskData, token) => {
        // Handle single task or array of tasks
        const tasksToCreate = Array.isArray(taskData) ? taskData : [taskData];
        const tempIds = tasksToCreate.map((_, i) => `temp_${Date.now()}_${i}`);

        // Create optimistic tasks
        const optimisticTasks = tasksToCreate.map((task, i) => ({
          _id: tempIds[i],
          ...task,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        // Optimistic update - add to UI immediately
        const previousTasks = get().tasks;
        set({
          tasks: [...optimisticTasks, ...get().tasks],
          cache: {}, // Clear cache to ensure fresh data on next fetch
        });

        try {
          // Create tasks sequentially to maintain order
          const createdTasks = [];
          for (const task of tasksToCreate) {
            const res = await fetch("/api/tasks", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(task),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create task");
            createdTasks.push(data.task);
          }

          // Replace all optimistic tasks with real tasks
          set({
            tasks: get().tasks.map(
              (t) => createdTasks.find((ct) => ct.title === t.title) || t,
            ),
          });

          return Array.isArray(taskData) ? createdTasks : createdTasks[0];
        } catch (error) {
          console.error("createTask error:", error);
          // Rollback on error
          set({ tasks: previousTasks, error: error.message });
          throw error;
        }
      },

      // Update task with optimistic update
      updateTask: async (taskId, updates, token) => {
        // Optimistic update - update UI immediately
        const previousTasks = get().tasks;
        set({
          tasks: get().tasks.map((t) =>
            t._id === taskId ? { ...t, ...updates } : t,
          ),
        });

        try {
          const res = await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.error);

          // Update with server response
          set({
            tasks: get().tasks.map((t) => (t._id === taskId ? data.task : t)),
          });

          return data.task;
        } catch (error) {
          // Rollback on error
          set({ tasks: previousTasks, error: error.message });
          throw error;
        }
      },

      // Delete task with optimistic update
      deleteTask: async (taskId, token) => {
        // Optimistic update - remove from UI immediately
        const previousTasks = get().tasks;
        set({
          tasks: get().tasks.filter((t) => t._id !== taskId),
        });

        try {
          const res = await fetch(`/api/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.error);

          return true;
        } catch (error) {
          // Rollback on error
          set({ tasks: previousTasks, error: error.message });
          throw error;
        }
      },

      // Bulk update tasks (for AI categorization)
      bulkUpdateTasks: async (updates, token) => {
        // updates is an array of { taskId, updates }
        // Optimistic update - update all tasks at once in UI
        const previousTasks = get().tasks;

        const updatedTasksMap = new Map(
          updates.map((u) => [u.taskId, u.updates]),
        );
        set({
          tasks: get().tasks.map((t) => {
            const taskUpdates = updatedTasksMap.get(t._id);
            return taskUpdates ? { ...t, ...taskUpdates } : t;
          }),
        });

        try {
          // Send all updates to server
          const updatePromises = updates.map(({ taskId, updates }) =>
            fetch(`/api/tasks/${taskId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updates),
            }).then((res) => res.json()),
          );

          const results = await Promise.all(updatePromises);

          // Update with server responses
          const serverTasksMap = new Map(
            results.map((r) => [r.task._id, r.task]),
          );
          set({
            tasks: get().tasks.map((t) => serverTasksMap.get(t._id) || t),
          });

          return results;
        } catch (error) {
          // Rollback on error
          set({ tasks: previousTasks, error: error.message });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Clear cache
      clearCache: () => set({ cache: {}, lastFetch: null }),

      // Reset store
      reset: () =>
        set({
          tasks: [],
          loading: false,
          error: null,
          currentPage: 1,
          totalTasks: 0,
          hasMore: true,
          lastFetch: null,
          cache: {},
        }),
    }),
    {
      name: "task-store",
      // Only persist specific fields
      partialize: (state) => ({
        tasks: state.tasks,
        totalTasks: state.totalTasks,
        currentPage: state.currentPage,
      }),
    },
  ),
);

export default useTaskStore;
