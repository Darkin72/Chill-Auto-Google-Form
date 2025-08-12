import { useState, useCallback, memo, useEffect } from "react";
import {
  Switch,
  Input,
  Button,
  InputNumber,
  DatePicker,
  TimePicker,
  FloatButton,
  Card,
} from "antd";
import apiRequest from "../utils/FormExtractorAPI";
import Loading from "./Loading";
import {
  LeftCircleOutlined,
  UndoOutlined,
  FileTextOutlined,
  SendOutlined,
  StarFilled,
  RobotOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { sendForm } from "../utils/SentForm";
import FormModal from "./FormModal";
import noti from "../components/Notification";
const { TextArea } = Input;

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

function GoolgeFormView({ data, setData }) {
  console.log("GoogleFormView rendered with data:", data); // Debug log

  const [loading, setLoading] = useState(false);
  const [generateAll, setGenerateAll] = useState(false);
  const [openSentFormModal, setOpenSentFormModal] = useState(false);
  const [responseSentForm, setResponseSentForm] = useState({
    success: false,
    message: "",
    loading: true,
  });
  const [answer, setAnswer] = useState(() =>
    data?.questions
      ? Object.fromEntries(
          data.questions.flatMap((q) =>
            q[4]?.[0]?.[0]
              ? [
                  [
                    q[4][0][0],
                    {
                      title: q[1],
                      content: "",
                      ai_generate: false,
                      mustAnswer: q[4][0][2],
                      type: q[3],
                      ratios: (() => {
                        // Tạo ratios mặc định cho các loại câu hỏi có options
                        if ([2, 3, 4, 5, 18].includes(q[3])) {
                          const options = q[4][0][1] || [];
                          return Object.fromEntries(
                            options.map((_, idx) => [idx, 0])
                          );
                        }
                        return {};
                      })(),
                      otherValue: "",
                      gridRatios: (() => {
                        // Tạo gridRatios mặc định cho Grid questions (type 7)
                        if (q[3] === 7) {
                          const gridRatios = {};
                          q[4].forEach((row, rowIdx) => {
                            if (row[1]) {
                              row[1].forEach((_, optIdx) => {
                                gridRatios[`${rowIdx}-${optIdx}`] = 0;
                              });
                            }
                          });
                          return gridRatios;
                        }
                        return {};
                      })(),
                    },
                  ],
                ]
              : []
          )
        )
      : {}
  );

  // Update generateAll when individual AI settings change
  useEffect(() => {
    const aiGenerateValues = Object.values(answer).map((a) => a.ai_generate);
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
  const handleGenerateAllChange = useCallback((checked) => {
    setGenerateAll(checked);
    // Update all ai_generate values
    setAnswer((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((questionId) => {
        updated[questionId] = {
          ...updated[questionId],
          ai_generate: checked,
        };
      });
      return updated;
    });
  }, []);

  const updateAnswerContent = useCallback((questionId, content) => {
    setAnswer((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        content,
      },
    }));
  }, []);

  const updateAnswerAI = useCallback((questionId, ai_generate) => {
    setAnswer((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ai_generate,
      },
    }));
  }, []);

  const updateAnswerRatios = useCallback((questionId, ratios) => {
    setAnswer((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ratios,
      },
    }));
  }, []);

  const updateAnswerOther = useCallback((questionId, otherValue) => {
    setAnswer((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        otherValue,
      },
    }));
  }, []);

  const updateAnswerGridRatios = useCallback((questionId, gridRatios) => {
    setAnswer((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        gridRatios,
      },
    }));
  }, []);

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
              const response = sendForm(answer);
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
            const questionId = question?.[4]?.[0]?.[0];
            const questionAnswer = answer[questionId];

            return (
              <div
                key={questionId || index}
                className="border border-gray-200 rounded-xl p-6 bg-white"
              >
                <MemoizedQuestion
                  question={question}
                  answer={questionAnswer}
                  updateAnswerContent={updateAnswerContent}
                  updateAnswerAI={updateAnswerAI}
                  updateAnswerRatios={updateAnswerRatios}
                  updateAnswerOther={updateAnswerOther}
                  updateAnswerGridRatios={updateAnswerGridRatios}
                />
              </div>
            );
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
                answer={answer}
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
        answer={answer}
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

function SentButton({ answer, setOpenSentFormModal, setResponseSentForm }) {
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
        const response = sendForm(answer);
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

function Box({ children, className = "" }) {
  return (
    <Card
      className={`rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur ${className}`}
      styles={{ body: { padding: 24 } }}
    >
      {children}
    </Card>
  );
}

// Component đặc biệt cho mô tả (type 6: cuối trang, type 8: đầu trang)
function DescriptionSection({ question }) {
  const questionType = question[3];
  const isHeaderDescription = questionType === 8; // Mô tả đầu trang

  return (
    <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
            isHeaderDescription
              ? "bg-gradient-to-br from-green-100 to-emerald-100 ring-green-200"
              : "bg-gradient-to-br from-purple-100 to-violet-100 ring-purple-200"
          }`}
        >
          {isHeaderDescription ? (
            <StarFilled className="text-green-600 text-xl" />
          ) : (
            <StarFilled className="text-purple-600 text-xl" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 mb-3 ${
              isHeaderDescription
                ? "bg-green-50 text-green-700 ring-green-200"
                : "bg-purple-50 text-purple-700 ring-purple-200"
            }`}
          >
            {isHeaderDescription ? "📋 Mô tả đầu trang" : "📝 Mô tả cuối trang"}
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {question[1]}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Component chung cho việc hiển thị tiêu đề câu hỏi
function QuestionHeader({ question }) {
  return (
    <Box className="mb-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10 ring-1 ring-blue-100">
          <StarFilled className="text-amber-600 text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {question[1]}
          </h3>
          {question?.[4]?.[0]?.[2] === 1 ? (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-1 text-xs ring-1 ring-red-200">
              <span>
                {question[3] === 7
                  ? "Yêu cầu một phản hồi trong mỗi hàng"
                  : "Bắt buộc"}
              </span>
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-1 text-xs ring-1 ring-green-200">
              <span>Không bắt buộc</span>
            </div>
          )}
        </div>
      </div>
    </Box>
  );
}

// Component chung cho việc hiển thị phần AI Switch
function AISection({
  isGenerate,
  setAIGenerated,
  label = "Sinh câu trả lời bằng AI",
  questionId,
}) {
  return (
    <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10">
            <RobotOutlined className="text-blue-600 text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-600">
              {isGenerate
                ? "AI sẽ tự động tạo câu trả lời"
                : "Sử dụng câu trả lời cố định"}
            </p>
          </div>
        </div>
        <Switch
          checked={isGenerate}
          onChange={setAIGenerated}
          data-question-id={questionId}
          size="default"
        />
      </div>
    </div>
  );
}

// Component cho input đơn giản (short answer, paragraph)
function SimpleInput({
  type,
  isGenerate,
  setAIGenerated,
  value,
  onChange,
  placeholder = "Nhập câu trả lời",
  questionId,
}) {
  const inputElement =
    type === "textarea" ? (
      <TextArea
        placeholder={placeholder}
        autoSize={{ minRows: 3, maxRows: 6 }}
        value={value}
        onChange={onChange}
        disabled={isGenerate}
        className="!rounded-xl"
      />
    ) : type === "date" ? (
      <DatePicker
        value={value}
        onChange={onChange}
        placeholder="Chọn ngày"
        disabled={isGenerate}
        className="!rounded-xl w-full"
      />
    ) : type === "time" ? (
      <TimePicker
        value={value}
        onChange={onChange}
        placeholder="Chọn giờ"
        disabled={isGenerate}
        className="!rounded-xl w-full"
      />
    ) : (
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={isGenerate}
        className="!rounded-xl"
      />
    );

  return (
    <Box>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Câu trả lời cố định
          </label>
          {inputElement}
        </div>
        <AISection
          isGenerate={isGenerate}
          setAIGenerated={setAIGenerated}
          questionId={questionId}
        />
      </div>
    </Box>
  );
}

// Component cho các option với tỷ lệ (multiple choice, dropdown, etc.)
function OptionsWithRatio({
  options,
  isGenerate,
  setAIGenerated,
  hasOtherOption = false,
  ratios = {},
  onRatioChange,
  otherValue = "",
  onOtherChange,
  questionId,
}) {
  return (
    <Box>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tỷ lệ lựa chọn cố định
          </label>
          <div className="space-y-3">
            {options.map((option, idx) => (
              <div className="flex items-center gap-3" key={idx}>
                <InputNumber
                  placeholder="Tỷ lệ %"
                  className="!rounded-xl"
                  style={{ width: "100px" }}
                  min={0}
                  max={100}
                  value={ratios[idx] || 0}
                  onChange={(value) =>
                    onRatioChange && onRatioChange(idx, value)
                  }
                  disabled={isGenerate}
                />
                {hasOtherOption && option[0] === "" ? (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-600">Khác:</span>
                    <Input
                      placeholder="Mục khác ..."
                      value={otherValue}
                      onChange={onOtherChange}
                      disabled={isGenerate}
                      className="!rounded-xl"
                    />
                  </div>
                ) : (
                  <p className="flex-1 text-sm text-gray-700">{option[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <AISection
          isGenerate={isGenerate}
          setAIGenerated={setAIGenerated}
          questionId={questionId}
        />
      </div>
    </Box>
  );
}

// Component cho linear scale
function LinearScaleInput({
  isGenerate,
  setAIGenerated,
  question,
  ratios = {},
  onRatioChange,
  questionId,
}) {
  const scaleOptions = question[4][0][1]; // Mảng các giá trị scale
  const labels = question[4][0][3]; // [Ko hài lòng, Rất hài lòng]
  const minLabel = labels?.[0] || "";
  const maxLabel = labels?.[1] || "";

  return (
    <Box>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tỷ lệ đánh giá cố định
          </label>
          {labels && maxLabel && (
            <div className="flex justify-between text-sm text-gray-600 mb-4 px-2">
              <span>{minLabel}</span>
            </div>
          )}
          <div className="space-y-3">
            {scaleOptions.map((option, idx) => (
              <div className="flex items-center gap-3" key={idx}>
                <InputNumber
                  placeholder="Tỷ lệ %"
                  className="!rounded-xl"
                  style={{ width: "100px" }}
                  min={0}
                  max={100}
                  value={ratios[idx] || 0}
                  onChange={(value) =>
                    onRatioChange && onRatioChange(idx, value)
                  }
                  disabled={isGenerate}
                />
                <p className="flex-1 text-sm text-gray-700">{option[0]}</p>
              </div>
            ))}
          </div>
          {labels && maxLabel && (
            <div className="flex justify-between text-sm text-gray-600 mb-4 px-2">
              <span>{maxLabel}</span>
            </div>
          )}
        </div>
        <AISection
          isGenerate={isGenerate}
          setAIGenerated={setAIGenerated}
          questionId={questionId}
        />
      </div>
    </Box>
  );
}

// Component cho grid questions
function GridQuestion({
  question,
  isGenerate,
  setAIGenerated,
  gridRatios = {},
  onGridRatioChange,
  questionId,
}) {
  return (
    <Box>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tỷ lệ lưới cố định
          </label>
          <div className="space-y-6">
            {question[4].map((row, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="font-medium text-gray-800 text-sm">{row[3]}</h4>
                <div className="space-y-2 pl-4">
                  {row[1].map((option, optIdx) => (
                    <div className="flex items-center gap-3" key={optIdx}>
                      <InputNumber
                        placeholder="Tỷ lệ %"
                        className="!rounded-xl"
                        style={{ width: "100px" }}
                        min={0}
                        max={100}
                        value={gridRatios[`${idx}-${optIdx}`] || 0}
                        onChange={(value) =>
                          onGridRatioChange &&
                          onGridRatioChange(idx, optIdx, value)
                        }
                        disabled={isGenerate}
                      />
                      <p className="flex-1 text-sm text-gray-700">
                        {option[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <AISection
          isGenerate={isGenerate}
          setAIGenerated={setAIGenerated}
          questionId={questionId}
        />
      </div>
    </Box>
  );
}

function Question({
  question,
  answer,
  updateAnswerContent,
  updateAnswerAI,
  updateAnswerRatios,
  updateAnswerOther,
  updateAnswerGridRatios,
}) {
  const questionType = question[3];
  const questionId = question?.[4]?.[0]?.[0];

  // Move all useCallback hooks to top level - before any conditional logic
  const handleAnswerChange = useCallback(
    (e) => {
      const value = e?.target ? e.target.value : e;
      updateAnswerContent(questionId, value);
    },
    [questionId, updateAnswerContent]
  );

  const handleAIChange = useCallback(
    (checked) => {
      updateAnswerAI(questionId, checked);
    },
    [questionId, updateAnswerAI]
  );

  const handleRatioChange = useCallback(
    (index, value) => {
      const newRatios = { ...answer?.ratios, [index]: value };
      updateAnswerRatios(questionId, newRatios);
    },
    [questionId, answer?.ratios, updateAnswerRatios]
  );

  const handleOtherChange = useCallback(
    (e) => {
      updateAnswerOther(questionId, e.target.value);
    },
    [questionId, updateAnswerOther]
  );

  const handleGridRatioChange = useCallback(
    (rowIdx, optIdx, value) => {
      const newGridRatios = {
        ...answer?.gridRatios,
        [`${rowIdx}-${optIdx}`]: value,
      };
      updateAnswerGridRatios(questionId, newGridRatios);
    },
    [questionId, answer?.gridRatios, updateAnswerGridRatios]
  );

  // Không render gì cho description sections
  if (NonRenderQuestionTypes.includes(questionType)) {
    return null;
  }

  // Render question header cho tất cả types trừ 6 và 8 (description sections)
  const questionHeader = ![6, 8].includes(questionType) ? (
    <QuestionHeader question={question} />
  ) : null;

  // Render question content dựa trên type
  const renderQuestionContent = () => {
    switch (questionType) {
      case 0: // Short answer
        return (
          <SimpleInput
            type="text"
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            value={answer?.content || ""}
            onChange={handleAnswerChange}
            questionId={questionId}
          />
        );

      case 1: // Paragraph
        return (
          <SimpleInput
            type="textarea"
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            value={answer?.content || ""}
            onChange={handleAnswerChange}
            placeholder="Nhập đoạn văn trả lời"
            questionId={questionId}
          />
        );

      case 2: // Multiple choice
      case 4: // Checkbox
        return (
          <OptionsWithRatio
            options={question[4][0][1]}
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            hasOtherOption={true}
            ratios={answer?.ratios || {}}
            onRatioChange={handleRatioChange}
            otherValue={answer?.otherValue || ""}
            onOtherChange={handleOtherChange}
            questionId={questionId}
          />
        );

      case 3: // Dropdown
        return (
          <OptionsWithRatio
            options={question[4][0][1]}
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            hasOtherOption={false}
            ratios={answer?.ratios || {}}
            onRatioChange={handleRatioChange}
            questionId={questionId}
          />
        );

      case 5: // Linear scale
        return (
          <LinearScaleInput
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            question={question}
            ratios={answer?.ratios || {}}
            onRatioChange={handleRatioChange}
            questionId={questionId}
          />
        );

      case 18: // Ranking
        return (
          <OptionsWithRatio
            options={question[4][0][1]}
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            hasOtherOption={false}
            ratios={answer?.ratios || {}}
            onRatioChange={handleRatioChange}
            questionId={questionId}
          />
        );

      case 7: // Grid
        return (
          <GridQuestion
            question={question}
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            gridRatios={answer?.gridRatios || {}}
            onGridRatioChange={handleGridRatioChange}
            questionId={questionId}
          />
        );

      case 9: // Date
        return (
          <SimpleInput
            type="date"
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            value={answer?.content || ""}
            onChange={handleAnswerChange}
            questionId={questionId}
          />
        );

      case 10: // Time
        return (
          <SimpleInput
            type="time"
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            value={answer?.content || ""}
            onChange={handleAnswerChange}
            questionId={questionId}
          />
        );

      case 6: // Mô tả cuối trang
      case 8: // Mô tả đầu trang
        return <DescriptionSection question={question} />;

      default:
        return (
          <Box>
            <div className="text-center py-8">
              <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 ring-1 ring-red-100 mb-4">
                <StarFilled className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loại câu hỏi chưa hỗ trợ
              </h3>
              <p className="text-gray-600">
                Loại câu hỏi "{QuestionTypes[questionType] || "Không xác định"}"
                chưa có trong hệ thống, vui lòng liên hệ để bổ sung.
              </p>
            </div>
          </Box>
        );
    }
  };

  return (
    <div className="space-y-4">
      {questionHeader && questionHeader}
      {renderQuestionContent()}
    </div>
  );
}

const MemoizedQuestion = memo(Question, (prevProps, nextProps) => {
  // Only re-render if answer data for this specific question changes
  return (
    prevProps.answer === nextProps.answer &&
    prevProps.question === nextProps.question
  );
});

export default GoolgeFormView;
