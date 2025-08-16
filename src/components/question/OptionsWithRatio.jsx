import { Input, InputNumber } from "antd";
import Box from "./Box";
import AISection from "./AISection";

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
                  placeholder="Tỷ lệ"
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

export default OptionsWithRatio;
