import { Alert, Form, Modal, Button, Space, InputNumber, Checkbox } from "antd";
import { startSendForm } from "../utils/SentForm";
import { useState } from "react";
const FormModal = ({
  isModalOpen,
  setIsModalOpen,
  message = "Hello",
  loading,
  answer,
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
              onFinish={(values) => {
                console.log("Giá trị form:", values);
                setSending(true);
                startSendForm(answer, values)
                  .then((data) => {
                    console.log(data);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                setTimeout(() => {
                  setSending(false);
                }, 2000);
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
                      Number.isInteger(v) && v >= 1 && v <= 1000
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Chỉ nhận số nguyên 0–1000")
                          ),
                  },
                ]}
              >
                <InputNumber min={0} max={1000} step={1} />
              </Form.Item>
              <Form.Item
                name="randomize"
                valuePropName="checked"
                extra="Đảm bảo điền đúng số lượng form trong nhiều nhất là 2 ngày"
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
                                    Number.isInteger(v) && v >= 0 && v <= 59
                                      ? Promise.resolve()
                                      : Promise.reject(new Error("Phút 0–59")),
                                },
                              ]
                        }
                      >
                        <InputNumber
                          min={0}
                          max={59}
                          step={1}
                          disabled={disabled}
                          addonAfter="phút"
                          style={{ width: 160 }}
                        />
                      </Form.Item>

                      <Form.Item
                        noStyle
                        name={["repeat", "hours"]}
                        dependencies={["randomize"]}
                        rules={
                          disabled
                            ? []
                            : [
                                {
                                  validator: (_, v) =>
                                    Number.isInteger(v) && v >= 0 && v <= 23
                                      ? Promise.resolve()
                                      : Promise.reject(new Error("Giờ 0–23")),
                                },
                              ]
                        }
                      >
                        <InputNumber
                          min={0}
                          max={23}
                          step={1}
                          disabled={disabled}
                          addonAfter="giờ"
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
