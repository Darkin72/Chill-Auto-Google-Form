import { Button } from "antd";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = ({ ctaRef, scrollTo, featRef }) => {
  return (
    <section ref={ctaRef} className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-16 text-center">
        <motion.h2
          className="text-2xl md:text-3xl font-extrabold text-gray"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Sẵn sàng tự động hóa Google Form của bạn?
        </motion.h2>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Trải nghiệm tốc độ và sự tiện lợi ngay hôm nay. Không cần cài đặt phức
          tạp.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            type="primary"
            size="large"
            className="!h-12 !px-6 !rounded-[1.5rem] bg-white hover:!text-blue-700 hover:!bg-blue-50 text-white"
            href="/formfill"
          >
            Bắt Đầu Ngay <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="large"
            className="!h-12 !px-6 !rounded-[1.5rem] border-white/70 text-white hover:!bg-white/10"
            onClick={() => scrollTo(featRef)}
          >
            Xem tính năng
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
