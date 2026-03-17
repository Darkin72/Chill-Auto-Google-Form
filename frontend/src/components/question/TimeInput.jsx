import { TimePicker } from "antd";
import Box from "./Box";
import AISection from "./AISection";

function TimeInput({
  isGenerate,
  setAIGenerated,
  value,
  onChange,
  questionId,
  kind = [],
}) {
  const hasSeconds = kind[0] === 1; // Có giây

  // Tạo key duy nhất để force re-render khi kind thay đổi
  const timePickerKey = `timepicker-${questionId}-${hasSeconds}`;

  return (
    <Box>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Câu trả lời cố định
          </label>
          <TimePicker
            key={timePickerKey}
            value={value}
            onChange={onChange}
            placeholder="Chọn giờ"
            disabled={isGenerate}
            className="!rounded-xl w-full"
            format={hasSeconds ? "HH:mm:ss" : "HH:mm"}
          />
          <div className="mt-2 text-xs text-gray-500">
            {hasSeconds ? "Chọn giờ, phút và giây" : "Chỉ chọn giờ và phút"}
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

export default TimeInput;
