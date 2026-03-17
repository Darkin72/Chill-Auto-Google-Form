import { Switch } from "antd";
import { RobotOutlined } from "@ant-design/icons";

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
          data-question-id={
            Array.isArray(questionId) ? JSON.stringify(questionId) : questionId
          }
          size="default"
        />
      </div>
    </div>
  );
}

export default AISection;
