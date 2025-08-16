import React from "react";
import { Tag } from "antd";
import { motion } from "framer-motion";
import CurrentFormCard from "../components/CurrentFormCard";
import QueueTable from "../components/QueueTable";

// Fake data
const currentForm = {
  id: "x1y2z3",
  title: "Khảo sát trải nghiệm sản phẩm mới",
  link: "https://docs.google.com/forms/d/7xyz123/edit",
  status: "processing",
  process: 45,
  sentCount: 9,
  repeat: 20,
};

const queueForms = [
  {
    id: "a1b2c3",
    title: "Đăng ký sự kiện Tech 2025",
    link: "https://docs.google.com/forms/d/2def456/edit",
    status: "pending",
  },
  {
    id: "d4e5f6",
    title: "Khảo sát ý kiến khách hàng",
    link: "https://docs.google.com/forms/d/1abc123/edit",
    status: "pending",
  },
];

const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ProgressPage() {
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
              Auto Google Form bằng AI • Theo dõi tiến trình
            </Tag>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Form đang xử lý
          </h2>
          <CurrentFormCard form={currentForm} />
        </div>

        {/* Queue */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Hàng đợi</h2>
          <QueueTable queue={queueForms} />
        </div>
      </section>
    </div>
  );
}

export default ProgressPage;
