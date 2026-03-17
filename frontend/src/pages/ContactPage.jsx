import { Button, Card, Collapse, Tag } from "antd";
import { motion } from "framer-motion";
import {
  MailOutlined,
  GithubOutlined,
  FacebookOutlined,
  DiscordOutlined,
  SendOutlined,
  StarFilled,
  CheckCircleFilled,
} from "@ant-design/icons";

// ===== Constants =====
const CONTACT_EMAIL = "quanluong2005@gmail.com";
const GITHUB_URL = "https://github.com/darkin72";
const FACEBOOK_URL = "https://www.facebook.com/duy.quan.07022005";

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
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ===== Small components =====
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

const InfoCard = ({ icon: Icon, title, desc, href }) => (
  <motion.div variants={item} whileHover={{ y: -4 }}>
    <Card
      hoverable
      className="h-full rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur"
      styles={{ body: { padding: 20 } }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10 ring-1 ring-blue-100">
          <Icon className="text-blue-600 text-2xl" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {href ? (
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="block mt-1 text-blue-700 hover:text-blue-800 truncate"
            >
              {desc}
            </a>
          ) : (
            <p className="mt-1 text-gray-600 break-words">{desc}</p>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
);

// ===== Main =====
export default function ContactPage() {
  // ...existing code...

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
              Auto Google Form bằng AI • Mã nguồn mở
            </Tag>
            <SectionHeading
              title="Liên Hệ & Thông Tin"
              subtitle="Bạn có thể liên hệ hoặc tham khảo hướng dẫn sử dụng Docker image bên dưới."
            />
            <div className="mt-6">
              <Button
                href="#faq"
                className="!rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  const faqSection = document.getElementById("faq");
                  if (faqSection) {
                    faqSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                Xem FAQ
              </Button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Contact Info + Docker Guide */}
      <section className="py-10 md:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col items-center gap-8">
            <div className="grid sm:grid-cols-2 gap-4 w-full">
              <InfoCard
                icon={MailOutlined}
                title="Email"
                desc={CONTACT_EMAIL}
              />
              <InfoCard
                icon={GithubOutlined}
                title="GitHub"
                desc="Darkin72"
                href={GITHUB_URL}
              />
              <InfoCard
                icon={FacebookOutlined}
                title="Facebook"
                desc="Duy Quân"
                href={FACEBOOK_URL}
              />
              <InfoCard
                icon={DiscordOutlined}
                title="Discord"
                desc="Auto Google Form"
                href={"https://discord.gg/JtPsnhEs"}
              />
            </div>
            {/* Đã bỏ phần hướng dẫn Docker image theo yêu cầu */}
            <div className="mt-4 text-xs text-gray-500 text-center w-full">
              * Thời gian phản hồi có thể thay đổi tùy khối lượng yêu cầu. Cảm
              ơn bạn đã kiên nhẫn!
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-10 md:py-16 bg-white/60">
        <motion.div
          {...fadeIn}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <SectionHeading
            eyebrow="Giải đáp nhanh"
            title="Câu hỏi thường gặp"
            subtitle="Những thắc mắc phổ biến về cách sử dụng và cấu hình."
          />
          <Card className="mt-8 rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur">
            <Collapse ghost accordion>
              <Collapse.Panel header="Công cụ có miễn phí không?" key="1">
                Có. Dự án là mã nguồn mở và miễn phí cho mọi người. Bạn có thể
                xem mã nguồn tại GitHub.
              </Collapse.Panel>
              <Collapse.Panel
                header="Có cần tài khoản Google đặc biệt?"
                key="2"
              >
                Không. Bạn chỉ cần Google Form hợp lệ và quyền truy cập hợp pháp
                vào form đó.
              </Collapse.Panel>
              <Collapse.Panel header="AI xử lý những loại câu hỏi nào?" key="3">
                Hỗ trợ tất cả các loại câu hỏi hiện có của Google Form (xem chi
                tiết tại tài liệu tại README trong repo).
              </Collapse.Panel>
              <Collapse.Panel header="Thời gian phản hồi hỗ trợ?" key="4">
                Vì là dự án cá nhân nên có thể sẽ không phản hồi trực tiếp. Tôi
                rất xin lỗi vì sự bất tiện này. Cảm ơn bạn đã tin tưởng tôi.
              </Collapse.Panel>
            </Collapse>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
