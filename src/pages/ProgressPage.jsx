import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tag, message } from "antd";
import { motion } from "framer-motion";
import CurrentFormCard from "../components/CurrentFormCard";
import QueueTable from "../components/QueueTable";
import { useWorkerMonitor } from "../utils/useWorkerMonitor";
import { getFormQueue, cancelForm } from "../utils/DatabaseConnector";

const WORKERS_NUMBER = import.meta.env.VITE_WORKERS_NUMBER;

const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Custom hook để polling queue data từ database
const useFormQueuePolling = (intervalMs = 5000) => {
  // Tăng từ 2s lên 5s để giảm load
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(queueData);

  const fetchQueueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getFormQueue();

      if (result.ok) {
        setQueueData(result.data || []);
      } else {
        setError(result.message);
        console.error("Error fetching queue data:", result.message);
      }
    } catch (err) {
      setError(err.message || "Unknown error");
      console.error("Error fetching queue data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let intervalId;

    // Fetch immediately
    fetchQueueData();

    // Then poll every intervalMs - tăng lên 5s để giảm load
    intervalId = setInterval(fetchQueueData, intervalMs);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalMs, fetchQueueData]);

  return { queueData, loading, error };
};

function ProgressPage() {
  const { getWorkerSlots } = useWorkerMonitor();
  const { queueData, loading, error } = useFormQueuePolling(5000); // Tăng từ 2s lên 5s

  // Create array of workers based on WORKERS_NUMBER, filling with null for empty slots
  const workerSlots = getWorkerSlots(Number(WORKERS_NUMBER) || 1);

  // Hàm xử lý hủy form
  const handleCancelForm = useCallback(async (formId, title) => {
    try {
      const result = await cancelForm(formId);

      if (result.ok) {
        // Thành công - hiển thị thông báo từ server
        const serverMessage =
          result.data?.message || `Form "${title}" đã được hủy thành công!`;
        message.success(serverMessage);
        console.log("Cancel success:", serverMessage);
      } else {
        // Lỗi từ server
        const errorMessage = result.message || `Không thể hủy form "${title}"`;
        message.error(errorMessage);
        console.error("Cancel failed:", result.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      message.error(`Lỗi kết nối khi hủy form "${title}"`);
    }
  }, []);

  // Lọc ra những job chưa chạy (loại bỏ những job có status RUNNING) - dùng useMemo để tối ưu
  const filteredQueueData = useMemo(
    () => queueData.filter((job) => job.status !== "RUNNING"),
    [queueData]
  );
  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-[#eff6ff] via-[#dbeafe] to-white/90 text-gray-700">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] blur-3xl opacity-20" />
          <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#3b82f6] blur-3xl opacity-20" />
        </div>
        <motion.div
          {...fadeDown}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-28 md:pb-16"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Tag color="blue" className="px-3 py-1 text-sm rounded-full">
                Auto Google Form bằng AI • Theo dõi tiến trình
              </Tag>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Tiến Trình Xử Lý Form
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Theo dõi trạng thái form đang xử lý và hàng đợi gửi form tự động.
            </p>
          </div>
        </motion.div>
      </header>

      {/* Current Processing */}
      <section className="py-6 md:py-10">
        <div className="max-w-[80vw] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Form đang xử lý
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto">
            {workerSlots.map((form, idx) => (
              <CurrentFormCard
                key={idx}
                form={form}
                onCancelForm={handleCancelForm}
              />
            ))}
          </div>
        </div>

        {/* Queue */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">Hàng đợi</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>({filteredQueueData.length} job chờ xử lý</span>
                {queueData.length !== filteredQueueData.length && (
                  <span className="text-blue-600">
                    • {queueData.length - filteredQueueData.length} job đang
                    chạy
                  </span>
                )}
                <span>)</span>
              </div>
            </div>
            {loading && (
              <div className="flex items-center text-sm text-blue-600">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang tải...
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">
                Lỗi khi tải dữ liệu queue: {error}
              </p>
            </div>
          )}

          <QueueTable
            queue={filteredQueueData}
            onCancelForm={handleCancelForm}
          />
        </div>
      </section>
    </div>
  );
}

export default ProgressPage;
