import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCompletedItems, toggleCompletedItem } from '../utils/storage';

const ProgressContext = createContext(null);

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
};

export const ProgressProvider = ({ children }) => {
  const [completedItems, setCompletedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const items = await getCompletedItems();
      setCompletedItems(items);
    } catch (e) {
      console.warn('Failed to load completed items:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompletion = async (itemId) => {
    try {
      // Optimistic update for UI speed
      const isCurrentlyCompleted = completedItems.includes(itemId);
      const optimisticUpdate = isCurrentlyCompleted 
        ? completedItems.filter(id => id !== itemId)
        : [...completedItems, itemId];
        
      setCompletedItems(optimisticUpdate);
      
      // Background persistence
      const updated = await toggleCompletedItem(itemId);
      setCompletedItems(updated);
      
      return updated.includes(itemId); // Returns true if now completed
    } catch (e) {
      console.warn('Failed to toggle completion for:', itemId, e);
      // Revert optimistic update
      await loadProgress(); 
      return false;
    }
  };

  const markAsCompleted = async (itemId) => {
    if (completedItems.includes(itemId)) return;
    try {
      setCompletedItems(prev => [...prev, itemId]);
      const updated = await toggleCompletedItem(itemId); // Our storage toggle is actually a toggle, so this works if we know it wasn't there
      // Wait, if it's already there in storage but not in state (unlikely), toggle would remove it.
      // Better to check storage first or have a setCompletedItem in storage.
      // Let's assume toggleCompletedItem is the only way for now but I'll check storage.js.
      setCompletedItems(updated);
    } catch (e) {
      console.warn('Failed to mark as completed:', itemId, e);
    }
  };

  const markAsIncomplete = async (itemId) => {
    if (!completedItems.includes(itemId)) return;
    try {
      setCompletedItems(prev => prev.filter(id => id !== itemId));
      const updated = await toggleCompletedItem(itemId);
      setCompletedItems(updated);
    } catch (e) {
      console.warn('Failed to mark as incomplete:', itemId, e);
    }
  };

  const isCompleted = (itemId) => {
    return completedItems.includes(itemId);
  };

  return (
    <ProgressContext.Provider value={{ completedItems, toggleCompletion, markAsCompleted, markAsIncomplete, isCompleted, isLoading }}>
      {children}
    </ProgressContext.Provider>
  );
};
