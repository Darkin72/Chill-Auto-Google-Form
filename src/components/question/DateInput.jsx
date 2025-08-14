import { DatePicker } from "antd";
import Box from "./Box";
import AISection from "./AISection";

function DateInput({
  isGenerate,
  setAIGenerated,
  value,
  onChange,
  questionId,
  kind = [],
}) {
  const hasTime = kind[0] === 1; // Có TimePicker
  const hasYear = kind[1] === 1; // Có năm

  // Xác định format dựa trên kind
  const getDateFormat = () => {
    if (hasTime && hasYear) {
      return "YYYY-MM-DD HH:mm";
    } else if (hasTime && !hasYear) {
      return "MM-DD HH:mm";
    } else if (!hasTime && hasYear) {
      return "YYYY-MM-DD";
    } else {
      return "MM-DD";
    }
  };
  // Xác định showTime config
  const getShowTimeConfig = () => {
    if (hasTime) {
      return {
        format: "HH:mm",
        hideDisabledOptions: true,
      };
    }
    return false;
  };

  const formatConfig = {
    format: getDateFormat(),
    type: "mask",
  };

  // Tạo key duy nhất để force re-render khi kind thay đổi
  const datePickerKey = `datepicker-${questionId}-${hasTime}-${hasYear}`;

  return (
    <Box>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Câu trả lời cố định
          </label>
          <DatePicker
            key={datePickerKey}
            value={value}
            onChange={onChange}
            placeholder={`Nhập theo định dạng: ${getDateFormat()}`}
            disabled={isGenerate}
            className="!rounded-xl w-full"
            format={formatConfig}
            showTime={getShowTimeConfig()}
          />
          <div className="mt-2 text-xs text-gray-500">
            {hasTime && hasYear && "Định dạng: Ngày/Tháng/Năm Giờ:Phút"}
            {hasTime && !hasYear && "Định dạng: Ngày/Tháng Giờ:Phút"}
            {!hasTime && hasYear && "Định dạng: Ngày/Tháng/Năm"}
            {!hasTime && !hasYear && "Định dạng: Ngày/Tháng"}
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

export default DateInput;
