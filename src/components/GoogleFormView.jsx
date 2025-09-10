import { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Switch, Button, FloatButton, Card } from "antd";
import apiRequest from "../utils/FormExtractorAPI";
import Loading from "./Loading";
import {
  LeftCircleOutlined,
  UndoOutlined,
  FileTextOutlined,
  SendOutlined,
  RobotOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { sendForm } from "../utils/SentForm";
import FormModal from "./FormModal";
import noti from "../components/Notification";
import { DataContext } from "../context/DataContext";
import { Question } from "./question";
import GridGroupQuestion from "./question/GridGroupQuestion";

const QuestionTypes = {
  0: "Trả lời ngắn",
  1: "Đoạn văn",
  2: "Trắc nghiệm",
  3: "Menu thả xuống",
  4: "Hộp kiểm",
  5: "Phạm vi tuyến tính",
  6: "Mô tả cuối trang",
  7: "Lưới",
  8: "Mô tả đầu trang",
  9: "Ngày",
  10: "Giờ",
  18: "Xếp hạng",
};

const NonRenderQuestionTypes = []; // Bây giờ render tất cả types

function GoolgeFormView() {
  const {
    data,
    setData,
    answer,
    updateAnswerContent,
    updateAnswerAI,
    updateAnswerRatios,
    updateAnswerOther,
    getAnswerAsObject,
  } = useContext(DataContext);

  console.log("GoogleFormView rendered with data:", data); // Debug log

  const [loading, setLoading] = useState(false);
  const [generateAll, setGenerateAll] = useState(false);
  const [openSentFormModal, setOpenSentFormModal] = useState(false);
  const [responseSentForm, setResponseSentForm] = useState({
    success: false,
    message: "",
    loading: true,
  });

  // Update generateAll when individual AI settings change
  useEffect(() => {
    const aiGenerateValues = answer.map((a) => a.ai_generate);
    const allTrue =
      aiGenerateValues.length > 0 &&
      aiGenerateValues.every((val) => val === true);
    const hasAnyFalse = aiGenerateValues.some((val) => val === false);

    if (allTrue && !generateAll) {
      setGenerateAll(true);
    } else if (hasAnyFalse && generateAll) {
      setGenerateAll(false);
    }
  }, [answer, generateAll]);

  // Handle generateAll toggle
  const handleGenerateAllChange = useCallback(
    (checked) => {
      setGenerateAll(checked);
      // Update all ai_generate values - now using context function
      answer.forEach((item) => {
        updateAnswerAI(item.questionId, checked);
      });
    },
    [answer, updateAnswerAI]
  );

  const navigate = useNavigate();
  // Handle submit final form
  const handleSubmitFinalForm = () => {
    navigate("/progress");
    setData(null);
  };

  // Add safety check after all hooks
  if (!data || !data.questions) {
    return (
      <div className="min-h-screen text-gray-700 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Không có dữ liệu form để hiển thị
          </h1>
          <p className="text-gray-600 mt-2">
            Data: {data ? "Có data nhưng không có questions" : "Không có data"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-700 p-8">
      {loading && <Loading />}

      {/* Simple header for testing */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {data.title}
          </h1>
          <p className="text-lg text-gray-600">
            Cấu hình và điều chỉnh cách AI sẽ điền form của bạn
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            icon={<LeftCircleOutlined />}
            onClick={() => setData(null)}
            className="rounded-lg"
          >
            Quay lại điền link form
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const res = await apiRequest(data.link_edit);
                if (res.ok) {
                  noti.success("Đã đồng bộ với form mới nhất !");
                  setData(res.data);
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
                }
              } finally {
                setLoading(false);
              }
            }}
            className="rounded-lg"
          >
            Đồng bộ dữ liệu
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              setOpenSentFormModal(true);
              setResponseSentForm({
                success: false,
                message: "",
                loading: true,
              });
              const response = sendForm(getAnswerAsObject());
              setResponseSentForm({
                success: response.success,
                message: response.message,
                loading: false,
              });
            }}
            className="rounded-lg"
          >
            Bắt đầu gửi form
          </Button>
          <Button icon={<FileTextOutlined />} className="rounded-lg">
            Hướng dẫn sử dụng
          </Button>
        </div>

        {/* AI Generate All Section */}
        <Card className="rounded-xl shadow-lg">
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-4">
              <RobotOutlined className="text-blue-600 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sinh toàn bộ câu trả lời bằng AI
                </h3>
                <p className="text-sm text-gray-600">
                  Bật tính năng này để AI tự động tạo tất cả câu trả lời
                </p>
              </div>
            </div>
            <Switch
              checked={generateAll}
              onChange={handleGenerateAllChange}
              size="default"
            />
          </div>
        </Card>

        {/* Questions section */}
        <div className="space-y-6 pt-6">
          {data.questions.map((question, index) => {
            if (question[3] === 7) {
              // Grid questions: Render as grouped questions
              const gridRows = answer.filter(
                (item) => item.parentIndex === index && item.parentType === 7
              );

              return (
                <div
                  key={`grid-${index}`}
                  className="border border-gray-200 rounded-xl p-6 bg-white"
                >
                  <GridGroupQuestion
                    question={question}
                    gridRows={gridRows}
                    updateAnswerRatios={updateAnswerRatios}
                    updateAnswerAI={updateAnswerAI}
                    updateAnswerOther={updateAnswerOther}
                  />
                </div>
              );
            } else {
              // Non-grid questions: Render normally
              const questionId = question?.[4]?.[0]?.[0];
              const questionAnswer = answer.find(
                (item) => item.questionId === questionId
              );

              return (
                <div
                  key={questionId || index}
                  className="border border-gray-200 rounded-xl p-6 bg-white"
                >
                  <Question
                    question={question}
                    answer={questionAnswer}
                    updateAnswerContent={updateAnswerContent}
                    updateAnswerAI={updateAnswerAI}
                    updateAnswerRatios={updateAnswerRatios}
                    updateAnswerOther={updateAnswerOther}
                  />
                </div>
              );
            }
          })}
        </div>

        {/* Submit section */}
        <div className="mt-8 text-center">
          <Card className="inline-block rounded-xl shadow-lg">
            <div className="py-6 px-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Sẵn sàng gửi form?
              </h3>
              <p className="text-gray-600 mb-6">
                Kiểm tra lại cấu hình và bấm gửi để AI bắt đầu điền form theo
                thiết lập của bạn.
              </p>
              <SentButton
                getAnswerAsObject={getAnswerAsObject}
                setOpenSentFormModal={setOpenSentFormModal}
                setResponseSentForm={setResponseSentForm}
              />
            </div>
          </Card>
        </div>
      </div>

      <FormModal
        isModalOpen={openSentFormModal}
        setIsModalOpen={setOpenSentFormModal}
        message={responseSentForm.message}
        loading={responseSentForm.loading}
        answer={getAnswerAsObject()}
        link={data.link_edit}
        title={data.title}
        description={data.description}
        handleSubmitFinalForm={handleSubmitFinalForm}
      />

      {/* Floating buttons */}
      <FloatButton
        icon={<UpOutlined />}
        tooltip="Lên đầu"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ right: 24, bottom: 100 }}
      />
      <FloatButton
        icon={<DownOutlined />}
        tooltip="Xuống cuối"
        onClick={() =>
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          })
        }
        style={{ right: 24, bottom: 50 }}
      />
    </div>
  );
}

function SentButton({
  getAnswerAsObject,
  setOpenSentFormModal,
  setResponseSentForm,
}) {
  return (
    <Button
      type="primary"
      size="large"
      onClick={() => {
        setOpenSentFormModal(true);
        setResponseSentForm({
          success: false,
          message: "",
          loading: true,
        });
        const response = sendForm(getAnswerAsObject());
        setResponseSentForm({
          success: response.success,
          message: response.message,
          loading: false,
        });
      }}
      icon={<SendOutlined />}
      className="!rounded-full !h-12 !px-8 !font-semibold !text-white !bg-[linear-gradient(90deg,#3b82f6,#8b5cf6)] !border-none hover:!opacity-90"
    >
      Bắt đầu gửi form
    </Button>
  );
}

export default GoolgeFormView;
