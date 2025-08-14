import { InputNumber } from "antd";
import Box from "./Box";
import AISection from "./AISection";

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
                  value={
                    ratios[option[0]] === null ||
                    ratios[option[0]] === undefined
                      ? null
                      : ratios[option[0]]
                  }
                  onChange={(value) =>
                    onRatioChange &&
                    onRatioChange(option[0], value === null ? 0 : value)
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

export default LinearScaleInput;
