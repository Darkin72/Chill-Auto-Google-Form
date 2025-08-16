import { Modal, List, Typography, Card, Tag, Divider } from "antd";

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

function AnswerModal({ open, onClose, form }) {
  const renderAnswerContent = (answerData) => {
    const { type, content, ratios, otherValue, ai_generate } = answerData;

    // Nếu là AI generate
    if (ai_generate) {
      return (
        <div>
          <Tag color="green" className="mb-2">
            AI Generated
          </Tag>
          <Typography.Text className="text-gray-600">
            Câu trả lời sẽ được AI tạo tự động
          </Typography.Text>
        </div>
      );
    }

    // Text input types (Short answer, Paragraph)
    if ([0, 1].includes(type)) {
      return (
        <Typography.Text className="text-gray-700">
          {content || "Chưa có nội dung"}
        </Typography.Text>
      );
    }

    // Choice types (Multiple choice, Checkboxes, Dropdown)
    if ([2, 3, 4, 5, 18].includes(type) && ratios) {
      return (
        <div>
          {Object.entries(ratios).map(([option, ratio]) => (
            <div
              key={option}
              className="flex justify-between items-center mb-1"
            >
              <span className="text-gray-700">
                {option || "Tùy chọn khác"}
                {option === "" && otherValue && `: ${otherValue}`}
              </span>
              <Tag color={ratio > 0 ? "blue" : "default"}>{ratio}</Tag>
            </div>
          ))}
        </div>
      );
    }

    // Date and Time types
    if ([9, 10].includes(type)) {
      return (
        <Typography.Text className="text-gray-700">
          {content || "Chưa chọn"}
        </Typography.Text>
      );
    }

    return (
      <Typography.Text className="text-gray-500 italic">
        Loại câu hỏi không được hỗ trợ
      </Typography.Text>
    );
  };

  const answerEntries = form?.answer ? Object.entries(form.answer) : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <span className="font-bold text-lg">
          Câu trả lời của form: {form?.title}
        </span>
      }
      width={700}
      centered
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {answerEntries.length > 0 ? (
          <List
            dataSource={answerEntries}
            renderItem={([questionId, answerData]) => (
              <Card
                className="mb-4 shadow-sm border-0 bg-blue-50/40"
                key={questionId}
                bodyStyle={{ padding: 16 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <Typography.Text strong className="text-blue-700 flex-1">
                    {answerData.title || `Câu hỏi ${questionId}`}
                  </Typography.Text>
                  <div className="flex gap-2 ml-2">
                    <Tag color="purple" size="small">
                      {QuestionTypes[answerData.type] ||
                        `Type ${answerData.type}`}
                    </Tag>
                    {answerData.mustAnswer === 1 && (
                      <Tag color="red" size="small">
                        Bắt buộc
                      </Tag>
                    )}
                  </div>
                </div>

                <Divider className="my-3" />

                <div className="mt-2">{renderAnswerContent(answerData)}</div>
              </Card>
            )}
          />
        ) : (
          <div className="text-center py-8">
            <Typography.Text className="text-gray-500">
              Không có dữ liệu câu trả lời.
            </Typography.Text>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AnswerModal;
