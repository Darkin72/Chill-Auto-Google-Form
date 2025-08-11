import { ClipboardList, SlidersHorizontal, Brain, Send } from "lucide-react";
import Step from "./Step";

const HowItWorksSection = ({ howRef }) => {
  return (
    <section ref={howRef} className="relative py-10 md:py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-blue-50 to-white" />
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Quy trình hoạt động
          </h2>
          <p className="mt-1 text-gray-600">
            4 bước đơn giản để hoàn thành một form hoàn chỉnh.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <Step
            index={1}
            title="Dán link Google Form"
            desc="Dán URL form bạn cần điền để hệ thống phân tích cấu trúc."
            Icon={ClipboardList}
          />
          <Step
            index={2}
            title="Cấu hình câu trả lời"
            desc="Chọn tỷ lệ, mức ngẫu nhiên và các ràng buộc theo nhu cầu."
            Icon={SlidersHorizontal}
          />
          <Step
            index={3}
            title="AI tự động sinh nội dung"
            desc="Mô hình AI tạo câu trả lời nhất quán & phù hợp ngữ cảnh."
            Icon={Brain}
          />
          <Step
            index={4}
            title="Gửi form hoàn chỉnh"
            desc="Gửi số lượng lớn form với tỷ lệ và câu trả lời đúng như ý bạn."
            Icon={Send}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
