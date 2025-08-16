import { Table, Button, Tooltip, Tag, Card, Empty, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

function QueueTable({ queue }) {
  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    message.success("Đã sao chép link!");
  };

  const columns = [
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
      render: () => <Tag color="gold">Đang chờ</Tag>,
    },
  ];

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
          pagination={false}
          scroll={{ x: true }}
          className="mt-2"
        />
      )}
    </Card>
  );
}

export default QueueTable;
