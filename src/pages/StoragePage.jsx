import { useState, useEffect } from "react";
import { Table, Tag, Button, Progress, Tooltip, message, Card } from "antd";
import { CopyOutlined, EyeOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import AnswerModal from "../components/AnswerModal";
import { getForms } from "../utils/DatabaseConnector";

const statusMap = {
  QUEUED: { color: "orange", text: "Chờ xử lý" },
  RUNNING: { color: "blue", text: "Đang chạy" },
  COMPLETED: { color: "green", text: "Hoàn thành" },
  FAILED: { color: "red", text: "Thất bại" },
  CANCELLED: { color: "red", text: "Đã hủy" },
  // Fallback cho các status cũ
  running: { color: "blue", text: "Đang chạy" },
  done: { color: "green", text: "Hoàn thành" },
  error: { color: "red", text: "Đã hủy" },
};

const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

async function fetchData() {
  try {
    const result = await getForms({
      limit: 10, // Mỗi trang 10 form
      offset: 0,
    });

    if (result.ok) {
      return result.data || [];
    } else {
      console.error("Error fetching forms:", result.message);
      message.error(`Lỗi tải dữ liệu: ${result.message}`);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchData:", error);
    message.error("Lỗi kết nối, vui lòng thử lại!");
    return [];
  }
}

function StoragePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const forms = await fetchData();
        setData(forms);
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Không thể tải dữ liệu!");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    message.success("Đã sao chép link!");
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
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} forms`,
              }}
              scroll={{ x: true }}
              className="mt-4"
              loading={loading}
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
