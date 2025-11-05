"use client";

import { createContext, useContext, useState } from "react";
import QuickTaskInputModal from "./QuickTaskInputModal";
import { useSession } from "next-auth/react";

const QuickTaskContext = createContext({
  openQuickTask: () => {},
});

export const useQuickTask = () => {
  const context = useContext(QuickTaskContext);
  if (!context) {
    throw new Error("useQuickTask must be used within a QuickTaskProvider");
  }
  return context;
};

export function QuickTaskProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  const handleTaskCreated = (task) => {
    // Additional handling after task creation if needed
    setIsModalOpen(false);
  };

  const openQuickTask = () => {
    setIsModalOpen(true);
  };

  return (
    <QuickTaskContext.Provider value={{ openQuickTask }}>
      {children}
      <QuickTaskInputModal
        token={session?.user?.token}
        onTaskCreated={handleTaskCreated}
      />
    </QuickTaskContext.Provider>
  );
}

export default QuickTaskProvider;
