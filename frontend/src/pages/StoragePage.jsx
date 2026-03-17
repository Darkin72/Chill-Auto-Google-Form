import { useState, useEffect, useRef } from "react";
import {
  Table,
  Tag,
  Button,
  Progress,
  Tooltip,
  message,
  Card,
  Popconfirm,
} from "antd";
import { CopyOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import AnswerModal from "../components/AnswerModal";
import { getForms, countForms, deleteForm } from "../utils/DatabaseConnector";

const statusMap = {
  QUEUED: { color: "orange", text: "Chờ xử lý" },
  RUNNING: { color: "blue", text: "Đang chạy" },
  SUCCEEDED: { color: "green", text: "Hoàn thành" },
  FAILED: { color: "red", text: "Thất bại" },
  CANCELED: { color: "red", text: "Đã hủy" },
  // Fallback cho các status cũ
  running: { color: "blue", text: "Đang chạy" },
  done: { color: "green", text: "Hoàn thành" },
  error: { color: "red", text: "Đã hủy" },
};

const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Helper function để chuyển đổi tableParams thành API params
const getApiParams = (tableParams) => {
  const { pagination, filters, sortField, sortOrder, ...restParams } =
    tableParams;
  const result = {};

  // Pagination
  result.limit = pagination?.pageSize || 10;
  result.offset = ((pagination?.current || 1) - 1) * result.limit;

  // Filters (nếu có)
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        result[key] = value;
      }
    });
  }

  // Sorting (nếu có)
  if (sortField) {
    result.orderBy = sortField;
    result.order = sortOrder === "ascend" ? "asc" : "desc";
  }

  // Các tham số khác
  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  });

  return result;
};

function StoragePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10, // Giảm xuống 10 để render nhanh hơn
      showSizeChanger: true,
      showQuickJumper: false, // Tắt quick jumper để đơn giản hóa
      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
      pageSizeOptions: ["10", "20", "50"], // Giảm options
    },
  });

  // Extract primitive values for useEffect dependency
  const currentPage = tableParams.pagination?.current;
  const pageSize = tableParams.pagination?.pageSize;

  // Ref để lưu polling interval và current values
  const pollingInterval = useRef(null);
  const currentTableParams = useRef(tableParams);
  const currentLoading = useRef(loading);

  // Update refs khi values thay đổi
  currentTableParams.current = tableParams;
  currentLoading.current = loading;

  // Hàm fetch data đơn giản
  const fetchData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }

      const apiParams = getApiParams(tableParams);

      // Fetch forms và count cùng lúc
      const [formsResult, countResult] = await Promise.all([
        getForms(apiParams),
        countForms(apiParams),
      ]);

      if (formsResult.ok) {
        setData(formsResult.data || []);
      } else {
        console.error("Error fetching forms:", formsResult.message);
        if (showLoadingIndicator) {
          message.error(`Lỗi tải dữ liệu: ${formsResult.message}`);
        }
        setData([]);
      }

      if (countResult.ok) {
        const totalCount = countResult.data || 0;
        setTableParams((prevParams) => ({
          ...prevParams,
          pagination: {
            ...prevParams.pagination,
            total: totalCount,
          },
        }));
      } else {
        console.error("Error counting forms:", countResult.message);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      if (showLoadingIndicator) {
        message.error("Lỗi kết nối, vui lòng thử lại!");
      }
      setData([]);
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  // Load data on mount và khi pagination thay đổi
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // Polling tối ưu mỗi 5 giây - tách riêng để tránh re-create
  useEffect(() => {
    // Clear existing interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    // Tạo hàm polling tối ưu với refs
    const startPolling = () => {
      pollingInterval.current = setInterval(async () => {
        // Sử dụng ref values để tránh dependency
        if (!currentLoading.current) {
          try {
            const apiParams = getApiParams(currentTableParams.current);
            const [formsResult, countResult] = await Promise.all([
              getForms(apiParams),
              countForms(apiParams),
            ]);

            if (formsResult.ok) {
              setData(formsResult.data || []);
            }

            if (countResult.ok) {
              const totalCount = countResult.data || 0;
              setTableParams((prevParams) => ({
                ...prevParams,
                pagination: {
                  ...prevParams.pagination,
                  total: totalCount,
                },
              }));
            }
          } catch (error) {
            console.error("Polling error:", error);
            // Không hiển thị message error để tránh spam notification
          }
        }
      }, 5000);
    };

    startPolling();

    // Cleanup interval khi component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [currentPage, pageSize]); // Safe dependencies vì sử dụng refs cho current values

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // Clear data và set loading ngay lập tức khi thay đổi pagination
    if (
      pagination.pageSize !== tableParams.pagination?.pageSize ||
      pagination.current !== tableParams.pagination?.current
    ) {
      setData([]);
      setLoading(true);
    }
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    message.success("Đã sao chép link!");
  };

  const handleDeleteForm = async (formId, title) => {
    try {
      setLoading(true);
      const result = await deleteForm(formId);

      if (result.ok) {
        message.success(`Đã xóa form "${title}" thành công!`);
        // Refresh lại data sau khi xóa thành công
        await fetchData(false);
      } else {
        message.error(`Lỗi xóa form: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      message.error("Lỗi kết nối khi xóa form!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title) => <span className="font-semibold">{title}</span>,
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      width: 120,
      render: (link) => (
        <div className="flex items-center gap-2">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline truncate max-w-[90px]"
            title={link}
          >
            {link?.length > 30 ? `${link.substring(0, 30)}...` : link}
          </a>
          <Tooltip title="Copy link">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleCopy(link)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const s = statusMap[status] || statusMap.FAILED;
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "Answer",
      key: "answer",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedForm(record);
            setModalOpen(true);
          }}
        >
          Xem Answer
        </Button>
      ),
    },
    {
      title: "Số lần lặp",
      key: "repeat_times",
      align: "center",
      render: (_, record) => {
        const repeatTimes = record.repeat?.times || 1;
        return <span className="font-bold">{repeatTimes}</span>;
      },
    },
    {
      title: "Mode",
      key: "mode",
      render: (_, record) => {
        const isRandomize = record.repeat?.randomize;
        const mode = isRandomize ? "Ngẫu nhiên" : "Cố định";
        return <span>{mode}</span>;
      },
    },
    {
      title: "Process",
      key: "process",
      render: (_, record) => {
        const totalTimes = record.repeat?.times || 1;
        const currentProcess = record.process || 0;
        const percent = Math.round((currentProcess / totalTimes) * 100);

        return (
          <div className="flex flex-col items-center gap-1">
            <Progress
              percent={percent}
              size="small"
              status={
                percent === 100
                  ? "success"
                  : percent === 0
                  ? "exception"
                  : "active"
              }
              className="min-w-[80px]"
            />
            <span className="text-xs text-gray-500">
              {currentProcess}/{totalTimes}
            </span>
          </div>
        );
      },
    },
    {
      title: "Tạo lúc",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (createdAt) => (
        <span className="text-xs text-gray-500 font-mono">
          {createdAt ? new Date(createdAt).toLocaleString("vi-VN") : "N/A"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Xóa form"
          description={`Bạn có chắc chắn muốn xóa form "${record.title}"?`}
          onConfirm={() => handleDeleteForm(record.id, record.title)}
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
        >
          <Tooltip title="Xóa form">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              type="text"
              danger
              className="hover:bg-red-50"
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

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
            <Tag color="blue" className="px-3 py-1 text-sm rounded-full">
              Auto Google Form bằng AI • Lưu trữ form đã gửi
            </Tag>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Lưu Trữ Form Đã Gửi
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Xem lại các form đã gửi, kiểm tra trạng thái và tiến trình thực
              hiện.
            </p>
          </div>
        </motion.div>
      </header>

      {/* Table Section */}
      <section className="py-10 md:py-16">
        <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur">
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              pagination={tableParams.pagination}
              loading={loading}
              onChange={handleTableChange}
              scroll={{ x: true }}
              className="mt-4"
            />
          </Card>
        </div>
      </section>

      {/* Modal Answer */}
      <AnswerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={selectedForm}
      />
    </div>
  );
}

export default StoragePage;
