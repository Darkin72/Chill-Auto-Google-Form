import { Input } from "antd";
import Box from "./Box";
import AISection from "./AISection";

const { TextArea } = Input;

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

export default SimpleInput;
