import { Button } from "antd";
import { Sparkles, ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = ({ scrollTo, howRef }) => {
  return (
    <section className="relative overflow-hidden">
      {/* gradient blob */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,0.20), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(139,92,246,0.18), transparent 60%)",
        }}
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-10 pt-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
              <Sparkles className="w-4 h-4" /> Tăng tốc điền form với AI
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
              Tự Động Điền Google Form{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Bằng AI
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl">
              Tiết kiệm thời gian, nâng cao độ chính xác và tối ưu quy trình
              bằng hệ thống AI hiểu ngữ cảnh & cấu trúc câu hỏi. Hoạt động mượt
              mà với nhiều loại Google Form.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="primary"
                size="large"
                className="!h-12 !px-6 !rounded-[1.5rem] bg-blue-600 hover:!bg-blue-700"
                href="/formfill"
              >
                Bắt đầu với AI <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="large"
                className="!h-12 !px-6 !rounded-[1.5rem] border-blue-200 text-blue-700 hover:!border-blue-300"
                onClick={() => scrollTo(howRef)}
              >
                Xem cách hoạt động
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-center">
              <div className="p-4 rounded-2xl bg-white/80 shadow">
                <div className="text-2xl font-bold text-gray-900">150 lần</div>
                <div className="text-xs text-gray-500">
                  Nhanh hơn so với điền form thủ công
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 shadow">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-xs text-gray-500">Đảm bảo đúng tỷ lệ</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 shadow">
                <div className="text-2xl font-bold text-gray-900">AI</div>
                <div className="text-xs text-gray-500">
                  Điền câu trả lời thông minh
                </div>
              </div>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute inset-0 -z-10 blur-3xl opacity-50 bg-gradient-to-r from-blue-400 to-purple-400 rounded-[3rem]" />
              <div className="rounded-[2rem] bg-white/90 backdrop-blur p-4 md:p-6 shadow-2xl border border-blue-100">
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-gray-500">
                      Google Form (demo)
                    </span>
                  </div>
                  <div className="p-5 space-y-4 bg-white">
                    <div className="flex gap-3">
                      <div className="w-1/3 h-10 bg-blue-50 rounded-xl" />
                      <div className="flex-1 h-10 bg-blue-50 rounded-xl" />
                    </div>
                    <div className="h-10 bg-blue-50 rounded-xl" />
                    <div className="h-10 bg-blue-50 rounded-xl" />
                    <div className="flex justify-end">
                      <Button
                        type="primary"
                        className="!rounded-xl bg-blue-600 hover:!bg-blue-700"
                      >
                        <Send className="w-4 h-4 mr-2" /> Gửi
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
