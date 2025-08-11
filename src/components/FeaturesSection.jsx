import { Button } from "antd";
import { Brain, ClipboardList, SlidersHorizontal, Smile } from "lucide-react";
import Feature from "./Feature";

const FeaturesSection = ({ scrollTo, ctaRef, featRef }) => {
  return (
    <section
      ref={featRef}
      className="container mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-14"
    >
      <div className="flex items-end justify-between gap-6 mb-6 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Tính năng nổi bật
          </h2>
          <p className="mt-1 text-gray-600">
            Thiết kế để dễ dùng, mạnh mẽ và linh hoạt.
          </p>
        </div>
        <Button className="!rounded-xl" onClick={() => scrollTo(ctaRef)}>
          Bắt đầu ngay
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Feature
          Icon={Brain}
          title="Sinh Câu Trả Lời Thông Minh"
          desc="Mô phỏng con người, hiểu ngữ cảnh câu hỏi, lựa chọn đáp án phù hợp với tính cách và tự động điền theo cấu trúc form."
        />
        <Feature
          Icon={ClipboardList}
          title="Hỗ Trợ Đa Dạng Loại Câu Hỏi"
          desc="Hỗ trợ tất cả các loại câu hỏi hiện có trên google form ."
        />
        <Feature
          Icon={SlidersHorizontal}
          title="Tùy Chỉnh Tỷ Lệ Trả Lời"
          desc="Điều chỉnh phân phối câu trả lời (0–100) cho từng tùy chọn để phù hợp mục tiêu."
        />
        <Feature
          Icon={Smile}
          title="Giao Diện Thân Thiện"
          desc="Thiết kế tối giản, nhất quán; thao tác trực quan cho mọi đối tượng người dùng."
        />
      </div>
    </section>
  );
};

export default FeaturesSection;
