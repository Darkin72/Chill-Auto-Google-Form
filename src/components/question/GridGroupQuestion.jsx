import Box from "./Box";
import OptionsWithRatio from "./OptionsWithRatio";
import { StarFilled } from "@ant-design/icons";

function GridGroupQuestion({
  question,
  gridRows,
  updateAnswerRatios,
  updateAnswerAI,
  updateAnswerOther,
}) {
  // Lấy thông tin mustAnswer từ bất kỳ row nào (tất cả đều giống nhau)
  const isRequired = gridRows.length > 0 && gridRows[0].mustAnswer === 1;

  return (
    <Box>
      <div className="space-y-6">
        {/* Grid header với thông tin bắt buộc */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10 ring-1 ring-blue-100">
            <StarFilled className="text-amber-600 text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
              {question[1]}
            </h3>
            {isRequired ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-1 text-xs ring-1 ring-red-200">
                <span>Yêu cầu một phản hồi trong mỗi hàng</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-1 text-xs ring-1 ring-green-200">
                <span>Không bắt buộc</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="space-y-4">
            {question[4].map((row, rowIndex) => {
              const rowAnswer = gridRows.find(
                (answer) => answer.rowIndex === rowIndex
              );

              if (!rowAnswer) return null;

              return (
                <div key={rowIndex} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-medium text-gray-800">{row[3]}</h4>
                    {isRequired && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </div>
                  <OptionsWithRatio
                    options={row[1] || []}
                    isGenerate={rowAnswer.ai_generate || false}
                    setAIGenerated={(checked) =>
                      updateAnswerAI(rowAnswer.questionId, checked)
                    }
                    hasOtherOption={false}
                    ratios={rowAnswer.ratios || {}}
                    onRatioChange={(optionName, value) => {
                      const newRatios = {
                        ...rowAnswer.ratios,
                        [optionName]: value,
                      };
                      updateAnswerRatios(rowAnswer.questionId, newRatios);
                    }}
                    otherValue={rowAnswer.otherValue || ""}
                    onOtherChange={(e) =>
                      updateAnswerOther(rowAnswer.questionId, e.target.value)
                    }
                    questionId={rowAnswer.questionId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Box>
  );
}

export default GridGroupQuestion;
