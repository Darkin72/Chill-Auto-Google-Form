import { Fragment, useState } from "react";
import {
  Switch,
  Input,
  Button,
  InputNumber,
  DatePicker,
  TimePicker,
} from "antd";
import apiRequest from "../utils/FormExtractorAPI";
import Loading from "./Loading";
import {
  LeftCircleOutlined,
  UndoOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
const { TextArea } = Input;

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

function GoolgeFormView({ data, setData }) {
  const [loading, setLoading] = useState(false);
  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col items-center justify-center xl:w-[80vw] my-5 w-full max-w-full gap-8">
        <div className="flex w-[100%] justify-around items-center">
          <Button icon={<LeftCircleOutlined />} onClick={() => setData(null)}>
            Quay lại điền link form
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={() => {
              setLoading(true);
              apiRequest(data.link_edit)
                .then((data) => {
                  setData(data);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error("Error:", error);
                  setLoading(false);
                });
            }}
          >
            Đồng bộ dữ liệu
          </Button>
          <Button icon={<FileTextOutlined />}>Hướng dẫn sử dụng</Button>
        </div>
        <div className="flex flex-row justify-center bg-blue-50 hover:shadow-md transition-all duration-200 border-purple-600 border-t-4 px-4 py-6 w-full rounded-4xl items-center">
          <p className="text-[30px] text-left w-[80%] wrap-break-word">
            {data.title}
          </p>
          <div className="flex flex-col items-start justify-center gap-3 w-[22%]">
            <p>Sinh toàn bộ câu trả lời bằng AI</p>
            <Switch />
          </div>
        </div>
        <div className="rounded-4xl grid grid-cols-[20vw_1fr] xl:w-[80vw] w-full gap-y-4 ">
          {data.questions.map((question, index) => {
            switch (question[3]) {
              case 0:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question?.[4]?.[0]?.[2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Câu trả lời cố định</p>
                        <div className="w-[90%]">
                          <Input placeholder="Nhập câu trả lời" />
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 1:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question[4][0][2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Câu trả lời cố định</p>
                        <div className="w-[90%]">
                          <TextArea
                            placeholder="Nhập câu trả lời"
                            autoSize={{ minRows: 2, maxRows: 5 }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 2:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question[4][0][2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Tỷ lệ cố định</p>
                        <div className="w-[90%] flex flex-col gap-2">
                          {question[4][0][1].map((option, idx) => {
                            return (
                              <div
                                className="flex flex-row items-center gap-2"
                                key={idx}
                              >
                                <InputNumber
                                  placeholder="Nhập tỷ lệ"
                                  style={{ width: "20%" }}
                                  min={0}
                                  defaultValue={0}
                                />
                                {option[0] === "" ? (
                                  <div className="flex flex-row items-center gap-2 w-[80%]">
                                    Khác:
                                    <Input placeholder="Mục khác ..." />
                                  </div>
                                ) : (
                                  <p className="w-[80%] overflow-auto wrap-break-word">
                                    {option[0]}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 3:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question[4][0][2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Tỷ lệ cố định</p>
                        <div className="w-[90%] flex flex-col gap-2">
                          {question[4][0][1].map((option, idx) => {
                            return (
                              <div
                                className="flex flex-row items-center gap-2"
                                key={idx}
                              >
                                <InputNumber
                                  placeholder="Nhập tỷ lệ"
                                  style={{ width: "20%" }}
                                  min={0}
                                  defaultValue={0}
                                />
                                <p className="w-[80%] overflow-auto wrap-break-word">
                                  {option[0]}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 4:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question[4][0][2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Tỷ lệ cố định</p>
                        <div className="w-[90%] flex flex-col gap-2">
                          {question[4][0][1].map((option, idx) => {
                            return (
                              <div
                                className="flex flex-row items-center gap-2"
                                key={idx}
                              >
                                <InputNumber
                                  placeholder="Nhập tỷ lệ"
                                  style={{ width: "20%" }}
                                  min={0}
                                  defaultValue={0}
                                />
                                {option[0] === "" ? (
                                  <div className="flex flex-row items-center gap-2 w-[80%]">
                                    Khác:
                                    <Input placeholder="Mục khác ..." />
                                  </div>
                                ) : (
                                  <p className="w-[80%] overflow-auto wrap-break-word">
                                    {option[0]}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 5:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question[4][0][2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Tỷ lệ cố định</p>
                        <div className="w-[90%] flex flex-col gap-2">
                          {question[4][0][1].map((option, idx) => {
                            return (
                              <div
                                className="flex flex-row items-center gap-2"
                                key={idx}
                              >
                                <InputNumber
                                  placeholder="Nhập tỷ lệ"
                                  style={{ width: "20%" }}
                                  min={0}
                                  defaultValue={0}
                                />
                                <p className="w-[80%] overflow-auto wrap-break-word">
                                  {option[0]}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 6:
                break;
              case 7:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question[4][0][2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Tỷ lệ cố định</p>
                        <div className="w-[90%] flex flex-col gap-2">
                          {question[4].map((row, index) => {
                            return (
                              <div
                                key={index}
                                className="w-[90%] flex flex-col gap-2"
                              >
                                {row[3]}
                                {row[1].map((option, idx) => {
                                  console.log(option);
                                  return (
                                    <div
                                      className="flex flex-row items-center gap-2"
                                      key={idx}
                                    >
                                      <InputNumber
                                        placeholder="Nhập tỷ lệ"
                                        style={{ width: "20%" }}
                                        min={0}
                                        defaultValue={0}
                                      />
                                      <p className="w-[80%] overflow-auto wrap-break-word">
                                        {option[0]}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 8:
                break;
              case 9:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question?.[4]?.[0]?.[2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Câu trả lời cố định</p>
                        <div className="w-[90%]">
                          <DatePicker />
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 10:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question?.[4]?.[0]?.[2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Câu trả lời cố định</p>
                        <div className="w-[90%]">
                          <TimePicker />
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              case 18:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question[4][0][2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 !flex-row">
                      <div className="flex flex-col items-start justify-center gap-2 w-[70%]">
                        <p>Tỷ lệ cố định</p>
                        <div className="w-[90%] flex flex-col gap-2">
                          {question[4][0][1].map((option, idx) => {
                            return (
                              <div
                                className="flex flex-row items-center gap-2"
                                key={idx}
                              >
                                <InputNumber
                                  placeholder="Nhập tỷ lệ"
                                  style={{ width: "20%" }}
                                  min={0}
                                  defaultValue={0}
                                />
                                <p className="w-[80%] overflow-auto wrap-break-word">
                                  {option[0]}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-3 w-[30%]">
                        <p>Sinh câu trả lời bằng AI</p>
                        <Switch />
                      </div>
                    </Box>
                  </Fragment>
                );
              default:
                return (
                  <Fragment key={index}>
                    <Box className="border-2 box-border rounded-2xl border-gray-300 justify-start items-start font-bold">
                      {question[1]}
                      <p className="text-red-500 text-sm">
                        {question?.[4]?.[0]?.[2] ? "(Bắt buộc)" : ""}
                      </p>
                    </Box>
                    <Box className="border-2 box-border rounded-2xl border-gray-300">
                      Loại câu hỏi này chưa có trong hệ thống, vui lòng liên hệ
                      để bổ sung.
                    </Box>
                  </Fragment>
                );
            }
          })}
        </div>
      </div>
    </>
  );
}

function Box({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col items-start justify-items-start p-3 pb-5 gap-2 max-w-full bg-blue-50 ${className} hover:shadow-md transition-all duration-200`}
    >
      {children}
    </div>
  );
}

export default GoolgeFormView;
