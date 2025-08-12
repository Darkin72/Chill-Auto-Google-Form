import { useState } from "react";
import { Button, Card, Tag, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartFilled,
  CoffeeOutlined,
  GiftOutlined,
  StarFilled,
  CheckCircleFilled,
  CopyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import qr from "/qr.jpg";
import cf from "/coffee.png";

// Import QR codes
import coffeeQR from "/CocCaPhe.png";
import developmentQR from "/PhatTrienSanPham.png";
import customQR from "/TuyY.png";

// ===== Constants =====
const BANK_INFO = {
  accountName: "LUONG DUY QUAN",
  accountNumber: "2225160678",
  bankName: "BIDV",
};

// ===== Animations =====
const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1, transition: { duration: 0.4 } },
  viewport: { once: true, amount: 0.2 },
};

const stagger = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ===== Components =====
function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm ring-1 ring-blue-200">
          <StarFilled className="text-blue-700 text-sm" />
          <span>{eyebrow}</span>
        </div>
      )}
      <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

const DonationCard = ({
  icon: Icon,
  title,
  desc,
  amount,
  qrImage,
  onFlip,
  isFlipped,
}) => (
  <motion.div variants={item} className="perspective-1000 h-80">
    <motion.div
      className="relative w-full h-full preserve-3d cursor-pointer"
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      onClick={onFlip}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Front Side */}
      <motion.div
        className="absolute inset-0 w-full h-full backface-hidden"
        style={{ backfaceVisibility: "hidden" }}
      >
        <Card
          hoverable
          className="h-full rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur cursor-pointer"
          styles={{ body: { padding: 24, height: "100%" } }}
        >
          <div className="text-center h-full flex flex-col justify-center">
            <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10 ring-1 ring-blue-100">
              <Icon className="text-blue-600 text-3xl" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              {title}
            </h3>
            <p className="mt-2 text-gray-600 text-sm">{desc}</p>
            {amount && (
              <div className="mt-3 text-2xl font-bold text-blue-600">
                {amount}
              </div>
            )}
            <p className="mt-3 text-xs text-blue-500">Nhấn để xem QR</p>
          </div>
        </Card>
      </motion.div>

      {/* Back Side */}
      <motion.div
        className="absolute inset-0 w-full h-full backface-hidden"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <Card
          className="h-full rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur cursor-pointer"
          styles={{ body: { padding: 24, height: "100%" } }}
        >
          <div className="text-center h-full flex flex-col justify-center">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="!text-blue-600 hover:!bg-blue-50 mb-4"
              onClick={(e) => {
                e.stopPropagation();
                onFlip();
              }}
            >
              Quay lại
            </Button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {title}
            </h3>
            <div className="flex justify-center">
              <img
                src={qrImage}
                alt={`QR Code ${title}`}
                className="w-32 h-32 rounded-xl shadow-lg"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Quét mã QR để thanh toán {amount}
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  </motion.div>
);

function DonatePage() {
  const [_copied, setCopied] = useState(false);
  const [flippedCards, setFlippedCards] = useState({
    coffee: false,
    development: false,
    custom: false,
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      message.success("Đã sao chép vào clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCardFlip = (cardType) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardType]: !prev[cardType],
    }));
  };

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
              Auto Google Form bằng AI • Hỗ trợ phát triển
            </Tag>
            <SectionHeading
              title="Hỗ Trợ Dự Án"
              subtitle="Mọi sự đóng góp của bạn đều rất quý giá và sẽ giúp tôi phát triển dự án này hơn nữa. Chúc bạn một ngày tốt lành và hy vọng bạn sẽ có những trải nghiệm tuyệt vời!"
            />
          </div>
        </motion.div>
      </header>

      {/* Donation Options */}
      <section className="py-10 md:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <DonationCard
              icon={CoffeeOutlined}
              title="Mua cà phê"
              desc="Hỗ trợ một ly cà phê để duy trì động lực"
              amount="25.000₫"
              qrImage={coffeeQR}
              isFlipped={flippedCards.coffee}
              onFlip={() => handleCardFlip("coffee")}
            />
            <DonationCard
              icon={GiftOutlined}
              title="Hỗ trợ phát triển"
              desc="Góp phần vào chi phí server và công cụ"
              amount="50.000₫"
              qrImage={developmentQR}
              isFlipped={flippedCards.development}
              onFlip={() => handleCardFlip("development")}
            />
            <DonationCard
              icon={HeartFilled}
              title="Tùy ý"
              desc="Số tiền bạn cảm thấy phù hợp"
              amount="Tự chọn"
              qrImage={customQR}
              isFlipped={flippedCards.custom}
              onFlip={() => handleCardFlip("custom")}
            />
          </div>

          {/* Divider */}
          <div className="mb-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Phương thức thanh toán khác
              </h2>
              <p className="text-gray-600">
                Bạn cũng có thể sử dụng QR code hoặc chuyển khoản trực tiếp
              </p>
            </div>
          </div>

          {/* QR Code and Bank Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* QR Code */}
            <motion.div variants={item} className="text-center">
              <Card className="rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Quét mã QR để chuyển khoản
                </h3>
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={qr}
                      alt="QR Code"
                      className="w-80 h-80 rounded-2xl shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2">
                      <img
                        src={cf}
                        alt="Coffee"
                        className="w-12 h-12 rounded-xl bg-white p-1 shadow-md"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Sử dụng app ngân hàng để quét mã QR
                </p>
              </Card>
            </motion.div>

            {/* Bank Info */}
            <motion.div variants={item}>
              <Card className="rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Thông tin chuyển khoản
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500">Tên tài khoản</p>
                      <p className="font-semibold text-gray-800">
                        {BANK_INFO.accountName}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500">Số tài khoản</p>
                      <p className="font-semibold text-gray-800">
                        {BANK_INFO.accountNumber}
                      </p>
                    </div>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(BANK_INFO.accountNumber)}
                      className="!text-blue-600 hover:!bg-blue-50"
                    >
                      Sao chép
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500">Ngân hàng</p>
                      <p className="font-semibold text-gray-800">
                        {BANK_INFO.bankName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Ghi chú:</strong> Vui lòng ghi "Support Auto
                    Form" khi chuyển khoản để tôi biết đây là hỗ trợ cho dự án
                    này.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Thank You Section */}
      <section className="py-10 md:py-16 bg-white/60">
        <motion.div
          {...fadeIn}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <Card className="rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur">
            <div className="py-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-6"
              >
                <HeartFilled className="text-2xl" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Cảm ơn sự hỗ trợ của bạn!
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Mỗi đóng góp, dù nhỏ hay lớn, đều giúp tôi duy trì và phát triển
                dự án này. Tôi cam kết sẽ tiếp tục cải thiện công cụ để mang lại
                giá trị tốt nhất cho cộng đồng.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  type="primary"
                  size="large"
                  className="!rounded-full !h-12 !px-6"
                  href="/"
                >
                  Về trang chủ
                </Button>
                <Button
                  size="large"
                  className="!rounded-full !h-12 !px-6"
                  href="/formfill"
                >
                  Trải nghiệm ngay
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}

export default DonatePage;
