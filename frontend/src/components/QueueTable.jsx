import React, { useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Tooltip,
  Tag,
  Card,
  Empty,
  message,
  Popconfirm,
} from "antd";
import { CopyOutlined, StopOutlined } from "@ant-design/icons";

const statusMap = {
  QUEUED: { color: "orange", text: "Chờ xử lý" },
  RUNNING: { color: "blue", text: "Đang chạy" },
  SUCCEEDED: { color: "green", text: "Hoàn thành" },
  FAILED: { color: "red", text: "Thất bại" },
  CANCELED: { color: "red", text: "Đã hủy" },
};

function QueueTable({ queue, onCancelForm }) {
  const handleCopy = useCallback((link) => {
    navigator.clipboard.writeText(link);
    message.success("Đã sao chép link!");
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id) => (
          <span className="font-mono text-xs text-gray-500">{id}</span>
        ),
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (title) => <span className="font-semibold">{title}</span>,
      },
      {
        title: "Link",
        dataIndex: "link",
        key: "link",
        render: (link) => (
          <div className="flex items-center gap-2">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline truncate max-w-[180px]"
            >
              {link}
            </a>
            <Tooltip title="Copy link">
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={() => handleCopy(link)}
              />
            </Tooltip>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        width: 100,
        align: "center",
        render: (_, record) => {
          // Chỉ hiển thị nút hủy cho các form đang QUEUED hoặc RUNNING
          const canCancel =
            record.status === "QUEUED" || record.status === "RUNNING";

          if (!canCancel) {
            return <span className="text-gray-400 text-xs">Không thể hủy</span>;
          }

          return (
            <Popconfirm
              title="Hủy form"
              description={`Bạn có chắc chắn muốn hủy form "${record.title}"?`}
              onConfirm={() => onCancelForm?.(record.id, record.title)}
              okText="Hủy form"
              cancelText="Không"
              okType="danger"
            >
              <Tooltip title="Hủy form">
                <Button
                  icon={<StopOutlined />}
                  size="small"
                  type="text"
                  danger
                  className="hover:bg-red-50"
                />
              </Tooltip>
            </Popconfirm>
          );
        },
      },
    ],
    [handleCopy, onCancelForm]
  );

  return (
    <Card className="rounded-2xl border-0 shadow-blue-200/40 bg-white/90 backdrop-blur">
      {queue.length === 0 ? (
        <div className="py-8">
          <Empty
            description={<span className="text-gray-500">Hàng đợi trống.</span>}
          />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={queue}
          rowKey="id"
          pagination={{
            pageSize: 20, // Giới hạn 20 items per page để tối ưu rendering
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} jobs`,
          }}
          scroll={{ x: true }}
          className="mt-2"
          size="middle" // Giảm size để render nhanh hơn
          showSorterTooltip={false} // Tắt tooltip để giảm DOM nodes
        />
      )}
    </Card>
  );
}

export default QueueTable;
