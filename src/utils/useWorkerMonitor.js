import { useState, useEffect, useCallback } from 'react';
import workerJobMonitor from './WorkerJobMonitor';

export const useWorkerMonitor = () => {
  const [workers, setWorkers] = useState([]);
  const [queueForms, setQueueForms] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [workerStats, setWorkerStats] = useState({ total: 0, working: 0, idle: 0 });

  const updateWorkerStats = useCallback((workersData) => {
    const stats = {
      total: workersData.length,
      working: workersData.filter(w => w.status === 'working').length,
      idle: workersData.filter(w => w.status !== 'working').length
    };
    setWorkerStats(stats);
  }, []);

  useEffect(() => {
    // Subscribe to connection status updates
    const unsubscribeConnection = workerJobMonitor.on('connection', (status) => {
      setConnectionStatus(status);
    });

    // Subscribe to worker jobs updates
    const unsubscribeWorkerJobs = workerJobMonitor.on('workerJobs', (data) => {
      const workersArray = workerJobMonitor.getWorkersArray();
      setWorkers(workersArray);
      updateWorkerStats(workersArray);
      
      // Update queue if available
      const queue = workerJobMonitor.getQueueData();
      setQueueForms(queue);
      
      // Update last updated timestamp
      if (data.last_updated) {
        setLastUpdated(new Date(data.last_updated * 1000));
      }
    });

    // Get initial status
    setConnectionStatus(workerJobMonitor.isConnected());
    
    // Get initial data if available
    const initialData = workerJobMonitor.getWorkerData();
    if (initialData) {
      const workersArray = workerJobMonitor.getWorkersArray();
      setWorkers(workersArray);
      updateWorkerStats(workersArray);
      
      const queue = workerJobMonitor.getQueueData();
      setQueueForms(queue);
      
      if (initialData.last_updated) {
        setLastUpdated(new Date(initialData.last_updated * 1000));
      }
    }

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeWorkerJobs();
    };
  }, [updateWorkerStats]);

  // Create worker slots for display
  const getWorkerSlots = useCallback((totalSlots) => {
    // If we don't have workers data, return empty slots
    if (!workers || workers.length === 0) {
      return Array(totalSlots).fill(null);
    }

    const assignedWorkerIds = new Set(); // Track which workers have been assigned
    
    const slots = Array.from({ length: totalSlots }).map((_, idx) => {
      // Option 1: Try to match by worker ID pattern - be more specific
      let worker = workers.find(w => {
        if (assignedWorkerIds.has(w.id)) {
          return false; // Skip already assigned workers
        }
        
        const workerId = w.id.toLowerCase();
        
        // Check exact matches only to avoid confusion
        const exactMatches = (
          workerId === `worker_${idx}` ||
          workerId === `worker${idx}` ||
          workerId === `worker-${idx}`
        );
        
        if (exactMatches) {
          return true;
        }
        return false;
      });
      
      // Option 2: If no exact match found, try pattern matching
      if (!worker) {
        worker = workers.find(w => {
          if (assignedWorkerIds.has(w.id)) {
            return false; // Skip already assigned workers
          }
          
          const workerId = w.id.toLowerCase();
          // Try other patterns but be more careful
          const otherMatches = (
            workerId.includes(`_${idx}_`) ||
            workerId.includes(`-${idx}-`) ||
            (workerId.endsWith(`_${idx}`) && workerId.length > `_${idx}`.length) ||
            (workerId.endsWith(`${idx}`) && workerId.includes('worker'))
          );
          
          if (otherMatches) {
            return true;
          }
          return false;
        });
      }
      
      // Option 3: Sequential assignment for remaining workers
      if (!worker && idx < workers.length) {
        worker = workers.find(w => !assignedWorkerIds.has(w.id));
      }
      
      // Mark this worker as assigned
      if (worker) {
        assignedWorkerIds.add(worker.id);
      }
      
      const job = worker ? worker.job : null;
      
      return job;
    });
    
    return slots;
  }, [workers]);

  return {
    workers,
    queueForms,
    connectionStatus,
    lastUpdated,
    workerStats,
    getWorkerSlots,
    isConnected: connectionStatus,
  };
};
