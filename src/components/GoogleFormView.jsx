import { Fragment, useState, useCallback, memo, useEffect } from "react";
import {
  Switch,
  Input,
  Button,
  InputNumber,
  DatePicker,
  TimePicker,
  FloatButton,
} from "antd";
import apiRequest from "../utils/FormExtractorAPI";
import Loading from "./Loading";
import {
  LeftCircleOutlined,
  UndoOutlined,
  FileTextOutlined,
  SendOutlined,
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

const NonRenderQuestionTypes = [6, 8]; // Types that should not be rendered

function GoolgeFormView({ data, setData }) {
  const [loading, setLoading] = useState(false);
  const [generateAll, setGenerateAll] = useState(false);
  const [openSentFormModal, setOpenSentFormModal] = useState(false);
  const [responseSentForm, setResponseSentForm] = useState({
    success: false,
    message: "",
    loading: true,
  });
  const [answer, setAnswer] = useState(() =>
    Object.fromEntries(
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

  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col items-center justify-center xl:w-[80vw] my-5 w-full max-w-full gap-8">
        <div className="flex w-[100%] justify-around items-center">
          <Button icon={<LeftCircleOutlined />} onClick={() => setData(null)}>
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
          >
            Đồng bộ dữ liệu
          </Button>
          <SentButton
            answer={answer}
            setOpenSentFormModal={setOpenSentFormModal}
            setResponseSentForm={setResponseSentForm}
          />
          <Button icon={<FileTextOutlined />}>Hướng dẫn sử dụng</Button>
        </div>
        <div className="flex flex-row justify-center bg-white hover:shadow-md transition-all duration-200 border-purple-600 border-t-4 px-4 py-6 w-full rounded-4xl items-center">
          <p className="text-[30px] text-left w-[80%] wrap-break-word">
            {data.title}
          </p>
          <div className="flex flex-col items-start justify-center gap-3 w-[22%]">
            <p>Sinh toàn bộ câu trả lời bằng AI</p>
            <Switch checked={generateAll} onChange={handleGenerateAllChange} />
          </div>
        </div>
        <div className="rounded-4xl grid grid-cols-[20vw_1fr] xl:w-[80vw] w-full gap-y-4 ">
          {data.questions.map((question, index) => {
            const questionId = question?.[4]?.[0]?.[0];
            const questionAnswer = answer[questionId];

            return (
              <MemoizedQuestion
                key={questionId || index}
                question={question}
                index={index}
                answer={questionAnswer}
                updateAnswerContent={updateAnswerContent}
                updateAnswerAI={updateAnswerAI}
                updateAnswerRatios={updateAnswerRatios}
                updateAnswerOther={updateAnswerOther}
                updateAnswerGridRatios={updateAnswerGridRatios}
              />
            );
          })}
        </div>
        <SentButton
          answer={answer}
          setOpenSentFormModal={setOpenSentFormModal}
          setResponseSentForm={setResponseSentForm}
        />
      </div>
      <FormModal
        isModalOpen={openSentFormModal}
        setIsModalOpen={setOpenSentFormModal}
        message={responseSentForm.message}
        loading={responseSentForm.loading}
        answer={answer}
      />
      <FloatButton.BackTop />
    </>
  );
}

function SentButton({ answer, setOpenSentFormModal, setResponseSentForm }) {
  return (
    <>
      <Button
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
      >
        Bắt đầu gửi
      </Button>
    </>
  );
}

function Box({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col items-start justify-items-start p-3 pb-5 gap-2 max-w-full bg-white ${className} hover:shadow-md transition-all duration-200`}
    >
      {children}
    </div>
  );
}

// Component chung cho việc hiển thị tiêu đề câu hỏi
function QuestionHeader({ question }) {
  return (
    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
      {question[1]}
      <p className="text-red-500 text-sm">
        {question?.[4]?.[0]?.[2]
          ? question[3] === 7
            ? "Yêu cầu một phản hồi trong mỗi hàng"
            : "Bắt buộc"
          : ""}
      </p>
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
    <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
      <p>{label}</p>
      <Switch
        checked={isGenerate}
        onChange={setAIGenerated}
        data-question-id={questionId}
      />
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
        autoSize={{ minRows: 2, maxRows: 5 }}
        value={value}
        onChange={onChange}
        disabled={isGenerate}
      />
    ) : type === "date" ? (
      <DatePicker
        value={value}
        onChange={onChange}
        placeholder="Chọn ngày"
        disabled={isGenerate}
      />
    ) : type === "time" ? (
      <TimePicker
        value={value}
        onChange={onChange}
        placeholder="Chọn giờ"
        disabled={isGenerate}
      />
    ) : (
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={isGenerate}
      />
    );

  return (
    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
        <p>Câu trả lời cố định</p>
        <div className="w-[90%]">{inputElement}</div>
      </div>
      <AISection
        isGenerate={isGenerate}
        setAIGenerated={setAIGenerated}
        questionId={questionId}
      />
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
    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
        <p>Tỷ lệ cố định</p>
        <div className="w-[90%] flex flex-col gap-2">
          {options.map((option, idx) => (
            <div className="flex flex-row items-center gap-2" key={idx}>
              <InputNumber
                placeholder="Nhập tỷ lệ"
                style={{ width: "20%" }}
                min={0}
                max={100}
                value={ratios[idx] || 0}
                onChange={(value) => onRatioChange && onRatioChange(idx, value)}
                disabled={isGenerate}
              />
              {hasOtherOption && option[0] === "" ? (
                <div className="flex flex-row items-center gap-2 w-[80%]">
                  Khác:
                  <Input
                    placeholder="Mục khác ..."
                    value={otherValue}
                    onChange={onOtherChange}
                    disabled={isGenerate}
                  />
                </div>
              ) : (
                <p className="w-[80%] overflow-auto wrap-break-word">
                  {option[0]}
                </p>
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
    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
        <p>Tỷ lệ cố định</p>
        {labels && minLabel && (
          <div className="w-[90%] flex justify-between text-sm text-gray-600 mb-2">
            <span>{minLabel}</span>
          </div>
        )}
        <div className="w-[90%] flex flex-col gap-2">
          {scaleOptions.map((option, idx) => (
            <div className="flex flex-row items-center gap-2" key={idx}>
              <InputNumber
                placeholder="Nhập tỷ lệ"
                style={{ width: "20%" }}
                min={0}
                max={100}
                value={ratios[idx] || 0}
                onChange={(value) => onRatioChange && onRatioChange(idx, value)}
                disabled={isGenerate}
              />
              <p className="w-[80%] overflow-auto wrap-break-word">
                {option[0]}
              </p>
            </div>
          ))}
        </div>
        {labels && maxLabel && (
          <div className="w-[90%] flex justify-between text-sm text-gray-600 mb-2">
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
      <AISection
        isGenerate={isGenerate}
        setAIGenerated={setAIGenerated}
        questionId={questionId}
      />
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
    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
        <p>Tỷ lệ cố định</p>
        <div className="w-[90%] flex flex-col gap-2">
          {question[4].map((row, idx) => (
            <div key={idx} className="w-[90%] flex flex-col gap-2">
              <p className="font-medium">{row[3]}</p>
              {row[1].map((option, optIdx) => (
                <div className="flex flex-row items-center gap-2" key={optIdx}>
                  <InputNumber
                    placeholder="Nhập tỷ lệ"
                    style={{ width: "20%" }}
                    min={0}
                    max={100}
                    value={gridRatios[`${idx}-${optIdx}`] || 0}
                    onChange={(value) =>
                      onGridRatioChange && onGridRatioChange(idx, optIdx, value)
                    }
                    disabled={isGenerate}
                  />
                  <p className="w-[80%] overflow-auto wrap-break-word">
                    {option[0]}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <AISection
        isGenerate={isGenerate}
        setAIGenerated={setAIGenerated}
        questionId={questionId}
      />
    </Box>
  );
}

function Question({
  question,
  index,
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

  // Render question header cho tất cả types
  const questionHeader = <QuestionHeader question={question} />;

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

      default:
        return (
          <Box className="border-2 box-border rounded-2xl border-gray-300">
            <p className="text-center text-gray-500">
              Loại câu hỏi "{QuestionTypes[questionType] || "Không xác định"}"
              chưa có trong hệ thống, vui lòng liên hệ để bổ sung.
            </p>
          </Box>
        );
    }
  };

  return (
    <Fragment key={index}>
      {questionHeader}
      {renderQuestionContent()}
    </Fragment>
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
