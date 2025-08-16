import { Alert, Form, Modal, Button, Space, InputNumber, Checkbox } from "antd";
import { startSendForm } from "../utils/SentForm";
import { useState } from "react";
import noti from "./Notification";
const FormModal = ({
  link,
  isModalOpen,
  setIsModalOpen,
  message = "Hello",
  loading,
  answer,
  title,
  handleSubmitFinalForm,
}) => {
  const [sending, setSending] = useState(false);
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Modal
        title={sending ? "Đang gửi ... " : "Trạng thái form"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={!sending}
        maskClosable={false}
        loading={sending ? sending : loading}
        keyboard={false}
        footer={
          message.startsWith("Form đã sắn sàng để gửi !") ? (
            <></>
          ) : (
            <Space>
              <Button onClick={handleCancel}>OK</Button>
            </Space>
          )
        }
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Alert
            message={message.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
            type={
              message.startsWith("Form đã sắn sàng để gửi !")
                ? "success"
                : "error"
            }
          />
          {message.startsWith("Form đã sắn sàng để gửi !") && (
            <Form
              layout="vertical"
              onFinish={async (values) => {
                console.log("Giá trị form:", values);
                setSending(true);
                try {
                  const res = await startSendForm(answer, values, link, title);
                  if (res.ok) {
                    noti.success(
                      "Đã gửi form thành công!",
                      "Form đã được gửi đến server."
                    );
                    console.log("Success:", res.data);
                    handleSubmitFinalForm();
                  } else {
                    if (res.kind === "HTTP") {
                      noti.error(
                        "Lỗi từ server!",
                        res.message || "Server trả về lỗi khi xử lý form."
                      );
                    } else if (res.kind === "TIMEOUT") {
                      noti.warning(
                        "Timeout!",
                        "Request bị timeout, vui lòng thử lại."
                      );
                    } else {
                      noti.warning(
                        "Lỗi mạng!",
                        "Không thể kết nối tới máy chủ, vui lòng liên hệ để xử lý."
                      );
                    }
                    console.log("Error:", res);
                  }
                } catch (error) {
                  noti.error(
                    "Lỗi không xác định!",
                    "Đã có lỗi xảy ra khi gửi form."
                  );
                  console.log("Unexpected error:", error);
                } finally {
                  setSending(false);
                }
              }}
              initialValues={{
                times: 1,
                randomize: false,
                repeat: { minutes: 1, hours: 0 },
              }}
              onReset={() => {
                console.log("Form reseted");
              }}
            >
              <Form.Item
                label="Số lần điền form"
                name="times"
                rules={[
                  { required: true, message: "Vui lòng nhập số lần!" },
                  {
                    validator: (_, v) =>
                      Number.isInteger(v) && v >= 1 && v <= 50
                        ? Promise.resolve()
                        : Promise.reject(new Error("Chỉ nhận số nguyên 1–50")),
                  },
                ]}
              >
                <InputNumber min={1} max={50} step={1} />
              </Form.Item>
              <Form.Item
                name="randomize"
                valuePropName="checked"
                extra="Đảm bảo điền đúng số lượng form trong 10 tiếng"
              >
                <Checkbox>Thời gian điền form ngẫu nhiên</Checkbox>
              </Form.Item>
              <Form.Item
                label="Khoảng cách giữa các lần gửi"
                shouldUpdate={(prev, cur) => prev.randomize !== cur.randomize}
              >
                {({ getFieldValue }) => {
                  const disabled = !!getFieldValue("randomize");
                  return (
                    <Space wrap>
                      <Form.Item
                        noStyle
                        name={["repeat", "minutes"]}
                        dependencies={["randomize"]}
                        rules={
                          disabled
                            ? []
                            : [
                                {
                                  validator: (_, v) =>
                                    Number.isInteger(v) && v >= 1 && v <= 59
                                      ? Promise.resolve()
                                      : Promise.reject(new Error("Phút 1–12")),
                                },
                              ]
                        }
                      >
                        <InputNumber
                          min={1}
                          max={12}
                          step={1}
                          disabled={disabled}
                          addonAfter="phút"
                          style={{ width: 160 }}
                        />
                      </Form.Item>
                    </Space>
                  );
                }}
              </Form.Item>
              <Space>
                <Button htmlType="reset">Reset</Button>
                <Button type="primary" htmlType="submit">
                  Bắt đầu gửi
                </Button>
              </Space>
            </Form>
          )}
        </Space>
      </Modal>
    </>
  );
};
export default FormModal;
