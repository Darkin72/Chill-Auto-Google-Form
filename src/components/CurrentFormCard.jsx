import { Card, Tag, Button, Tooltip, Progress, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

function CurrentFormCard({ form }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(form.link);
    message.success("Đã sao chép link!");
  };

  if (!form) {
    return (
      <Card className="rounded-2xl border-0 shadow-blue-200/40 bg-white/90 backdrop-blur text-center">
        <div className="py-8 text-gray-500 font-semibold text-lg">
          Không có form nào đang được xử lý.
        </div>
      </Card>
    );
  }

  const statusMap = {
    QUEUED: { color: "orange", text: "Chờ xử lý" },
    RUNNING: { color: "blue", text: "Đang chạy" },
    SUCCEEDED: { color: "green", text: "Hoàn thành" },
    FAILED: { color: "red", text: "Thất bại" },
    CANCELED: { color: "red", text: "Đã hủy" },
    // Fallback cho các status cũ
    running: { color: "blue", text: "Đang chạy" },
    done: { color: "green", text: "Hoàn thành" },
    error: { color: "red", text: "Đã hủy" },
  };

  const status = statusMap[form.status] || statusMap.error;

  return (
    <Card className="rounded-2xl border-0 shadow-blue-200/40 bg-white/90 backdrop-blur">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-mono">
              ID: {form.id}
            </span>
            <span className="text-lg font-bold text-gray-800">
              {form.title}
            </span>
            {typeof form.sentCount === "number" &&
              (typeof form.repeat === "number" ||
                typeof form.totalRepeat === "number") && (
                <span className="text-sm text-gray-500 mt-1">
                  Đã gửi: <b>{form.sentCount}</b> /{" "}
                  {form.repeat || form.totalRepeat}
                </span>
              )}
          </div>
          <Tag
            color={status.color}
            className="text-base px-4 py-1 rounded-full"
          >
            {status.text}
          </Tag>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <a
            href={form.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline truncate max-w-[220px]"
          >
            {form.link}
          </a>
          <Tooltip title="Copy link">
            <Button icon={<CopyOutlined />} size="small" onClick={handleCopy} />
          </Tooltip>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Progress
            percent={Math.round(
              (form.process / (form.totalRepeat || form.total_repeat || 1)) *
                100
            )}
            size="small"
            status={
              form.process / (form.totalRepeat || form.total_repeat || 1) === 1
                ? "success"
                : form.process /
                    (form.totalRepeat || form.total_repeat || 1) ===
                  0
                ? "exception"
                : "active"
            }
            className="flex-1"
          />
          <Button
            danger
            type="primary"
            onClick={() => {
              // TODO: Xử lý hủy tiến trình gửi form
            }}
          >
            Hủy
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default CurrentFormCard;
