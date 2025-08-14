import { useState, useContext, useEffect } from "react";
import { Input, Button, Card, Tag } from "antd";
import { motion } from "framer-motion";
import { SearchOutlined, StarFilled } from "@ant-design/icons";
import Loading from "../components/Loading";
import GoolgeFormView from "../components/GoogleFormView";
import apiRequest from "../utils/FormExtractorAPI";
import noti from "../components/Notification";
import { DataContext } from "../context/DataContext";
const { Search } = Input;

// ===== Animations =====
const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
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

function FormFillPage() {
  const [link, setLink] = useState("");
  const { data, setData } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  function resetForm() {
    setLink("");
    setLoading(false);
  }

  useEffect(() => {
    // Lên đầu khi data thay đổi.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [data]);

  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-[#eff6ff] via-[#dbeafe] to-white/90 text-gray-700">
      {loading && <Loading />}

      {data === null ? (
        <>
          {/* Hero Section */}
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
                  Auto Google Form bằng AI • Điền form tự động
                </Tag>
                <SectionHeading
                  title="Điền Form Tự Động"
                  subtitle="Nhập link Google Form để bắt đầu trải nghiệm công cụ điền form tự động bằng AI. Tiết kiệm thời gian và tăng hiệu quả công việc."
                />
              </div>
            </motion.div>
          </header>

          {/* Form Section */}
          <section className="py-10 md:py-16">
            <motion.div
              {...scaleIn}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <Card className="rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur">
                <div className="py-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-6"
                  >
                    <SearchOutlined className="text-2xl" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    Nhập Link Google Form
                  </h3>
                  <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                    Dán link Google Form có chứa "edit" trong URL để bắt đầu. Ví
                    dụ: https://docs.google.com/forms/d/.../edit
                  </p>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      try {
                        const form = new FormData(e.currentTarget);
                        const link = (form.get("link") || "").toString().trim();
                        if (!link) {
                          setStatus("error");
                          noti.error("Không có link cần điền form !");
                          return;
                        }

                        const res = await apiRequest(link);
                        if (res.ok) {
                          noti.success("Đã tìm thấy form !");
                          setData(res.data);
                          resetForm();
                        } else {
                          if (res.kind === "HTTP")
                            noti.error(
                              "Link không hợp lệ !",
                              "Không tìm thấy form từ link của bạn !"
                            );
                          else
                            noti.warning(
                              "Lỗi mạng !",
                              "Không thể kết nối tới máy chủ, vui lòng liên hệ để xử lý."
                            );
                          resetForm();
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="space-y-6"
                  >
                    <Search
                      placeholder="Nhập link google form có chứa edit ..."
                      size="large"
                      allowClear
                      value={link}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v !== "") setStatus("");
                        else setStatus("error");
                        setLink(v);
                      }}
                      status={status}
                      enterButton={
                        <Button type="primary" htmlType="submit" size="large">
                          Truy cập form
                        </Button>
                      }
                      onSearch={() => {}}
                      name="link"
                      className="!rounded-xl"
                    />

                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-4 py-2 text-sm">
                        💡{" "}
                        <span>
                          Đảm bảo link có chứa từ "edit" để có thể truy cập form
                        </span>
                      </div>
                    </div>
                  </form>
                </div>
              </Card>
            </motion.div>
          </section>
        </>
      ) : (
        <GoolgeFormView link={link} />
      )}
    </div>
  );
}

export default FormFillPage;
