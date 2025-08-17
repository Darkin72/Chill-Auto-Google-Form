class WorkerJobMonitor {
  constructor() {
    this.ws = null;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.listeners = new Map();
    this.connectionStatus = false;
    this.workerData = null;
    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket("ws://localhost:8000/ws/worker-monitor");

      this.ws.onopen = () => {
        this.connectionStatus = true;
        this.notifyListeners('connection', true);
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "worker_jobs") {
            this.workerData = message.data;
            this.notifyListeners('workerJobs', message.data);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      this.ws.onclose = () => {
        this.connectionStatus = false;
        this.notifyListeners('connection', false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.connectionStatus = false;
        this.notifyListeners('connection', false);
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    setTimeout(() => {
      this.connect();
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay
      );
    }, this.reconnectDelay);
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Notify all listeners for a specific event
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Get current connection status
  isConnected() {
    return this.connectionStatus;
  }

  // Get current worker data
  getWorkerData() {
    return this.workerData;
  }

  // Close connection
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // Transform worker data for display
  getWorkersArray() {
    if (!this.workerData || !this.workerData.workers) {
      return [];
    }

    const workers = this.workerData.workers;
    
    return Object.entries(workers).map(([workerId, workerData]) => {
      return {
        id: workerId,
        status: workerData.status,
        job: workerData.job ? {
          id: workerData.job.id,
          title: workerData.job.title,
          link: workerData.job.link,
          status: workerData.job.status,
          process: workerData.job.process,
          totalRepeat: workerData.job.total_repeat,
          sentCount: workerData.job.process,
          repeat: workerData.job.total_repeat
        } : null
      };
    });
  }

  // Get queue data (if available in the future)
  getQueueData() {
    if (!this.workerData || !this.workerData.queue) {
      return [];
    }
    return this.workerData.queue;
  }

  // Get worker statistics
  getWorkerStats() {
    if (!this.workerData || !this.workerData.workers) {
      return { total: 0, working: 0, idle: 0 };
    }

    const workers = Object.values(this.workerData.workers);
    const total = workers.length;
    const working = workers.filter(w => w.status === 'working').length;
    const idle = total - working;

    return { total, working, idle };
  }
}

// Create singleton instance
const workerJobMonitor = new WorkerJobMonitor();

export default workerJobMonitor;
