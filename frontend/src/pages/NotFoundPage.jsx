import { Button, Result } from "antd";
import { motion } from "framer-motion";
import { HomeOutlined, SearchOutlined } from "@ant-design/icons";

// ===== Animations =====
const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.2 } },
};

function NotFoundPage() {
  return (
    <div className="min-h-screen overflow-hidden scroll-smooth bg-gradient-to-b from-[#eff6ff] via-[#dbeafe] to-white/90 text-gray-700">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] blur-3xl opacity-20" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#3b82f6] blur-3xl opacity-20" />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeDown} className="max-w-2xl w-full text-center">
          <motion.div {...fadeIn}>
            <Result
              status="404"
              title={
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                  404
                </span>
              }
              subTitle={
                <div className="space-y-3">
                  <p className="text-lg text-gray-600">
                    Trang bạn tìm kiếm không tồn tại
                  </p>
                  <p className="text-sm text-gray-500">
                    Có thể liên kết đã bị thay đổi hoặc trang đã bị xóa
                  </p>
                </div>
              }
              extra={
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 flex-wrap">
                  <Button
                    type="primary"
                    icon={<HomeOutlined />}
                    href="/"
                    className="!rounded-full !h-11 !px-6 !font-semibold !text-white !bg-[linear-gradient(90deg,#3b82f6,#8b5cf6)] !border-none hover:!opacity-90 !min-w-0"
                  >
                    Về trang chủ
                  </Button>
                  <Button
                    icon={<SearchOutlined />}
                    href="/contact"
                    className="!rounded-full !h-11 !px-6 !min-w-0"
                  >
                    Liên hệ hỗ trợ
                  </Button>
                </div>
              }
              className="bg-white/90 backdrop-blur rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 p-4 sm:p-6 lg:p-8 mx-auto"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFoundPage;
