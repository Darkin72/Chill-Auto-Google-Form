import { memo, useCallback } from "react";
import { StarFilled } from "@ant-design/icons";
import Box from "./Box";
import QuestionHeader from "./QuestionHeader";
import DescriptionSection from "./DescriptionSection";
import SimpleInput from "./SimpleInput";
import DateInput from "./DateInput";
import TimeInput from "./TimeInput";
import OptionsWithRatio from "./OptionsWithRatio";
import LinearScaleInput from "./LinearScaleInput";
import ImageQuestion from "./ImageQuestion";

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
  11: "Ảnh",
  18: "Xếp hạng",
};

const NonRenderQuestionTypes = []; // Bây giờ render tất cả types

function Question({
  question,
  answer,
  updateAnswerContent,
  updateAnswerAI,
  updateAnswerRatios,
  updateAnswerOther,
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
    (optionName, value) => {
      const newRatios = { ...answer?.ratios, [optionName]: value };
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

  // Không render gì cho description sections
  if (NonRenderQuestionTypes.includes(questionType)) {
    return null;
  }

  // Render question header cho tất cả types trừ 6 và 8 (description sections)
  const questionHeader = ![6, 8].includes(questionType) ? (
    <QuestionHeader question={question} answer={answer} />
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

      case 9: // Date
        return (
          <DateInput
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            value={answer?.content || ""}
            onChange={handleAnswerChange}
            questionId={questionId}
            kind={answer?.kind || []}
          />
        );

      case 10: // Time
        return (
          <TimeInput
            isGenerate={answer?.ai_generate || false}
            setAIGenerated={handleAIChange}
            value={answer?.content || ""}
            onChange={handleAnswerChange}
            questionId={questionId}
            kind={answer?.kind || []}
          />
        );

      case 6: // Mô tả cuối trang
      case 8: // Mô tả đầu trang
        return <DescriptionSection question={question} />;
      case 11: // Image
        return <ImageQuestion question={question} />;
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
  // Re-render nếu có bất kỳ thay đổi nào trong answer hoặc question
  const prevAnswer = prevProps.answer;
  const nextAnswer = nextProps.answer;

  // Kiểm tra thay đổi trong question
  if (prevProps.question !== nextProps.question) {
    return false; // Re-render
  }

  // Kiểm tra thay đổi trong answer object
  if (prevAnswer !== nextAnswer) {
    return false; // Re-render
  }

  // Kiểm tra đặc biệt cho kind (quan trọng cho Date/Time)
  if (prevAnswer?.kind !== nextAnswer?.kind) {
    return false; // Re-render
  }

  // Kiểm tra các properties khác của answer
  if (
    prevAnswer?.ai_generate !== nextAnswer?.ai_generate ||
    prevAnswer?.content !== nextAnswer?.content ||
    prevAnswer?.ratios !== nextAnswer?.ratios ||
    prevAnswer?.otherValue !== nextAnswer?.otherValue ||
    prevAnswer?.gridRatios !== nextAnswer?.gridRatios ||
    prevAnswer?.mustAnswer !== nextAnswer?.mustAnswer ||
    prevAnswer?.title !== nextAnswer?.title ||
    prevAnswer?.type !== nextAnswer?.type
  ) {
    return false; // Re-render
  }

  return true; // Không re-render
});

export default MemoizedQuestion;
