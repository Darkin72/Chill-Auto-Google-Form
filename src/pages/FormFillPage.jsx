import { useState } from "react";
import Loading from "../components/Loading";
import GoolgeFormView from "../components/GoogleFormView";
import apiRequest from "../utils/FormExtractorAPI";
import noti from "../components/Notification";
import { Input, Button } from "antd";
const { Search } = Input;

function FormFillPage() {
  const [link, setLink] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  function resetForm() {
    setLink("");
    setLoading(false);
  }

  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col items-center justify-center">
        {data === null ? (
          <form
            className="flex flex-col items-center justify-between pt-[30vh]"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const form = new FormData(e.currentTarget); // an toàn hơn e.target
                const link = (form.get("link") || "").toString().trim(); // input phải có name="link"
                if (!link) {
                  setStatus("error");
                  noti.error("Không có link cần điền form !");
                  return;
                }

                const res = await apiRequest(link);
                if (res.ok) {
                  noti.success("Đã tìm thấy form !");
                  setData(res.data);
                  resetForm();
                } else {
                  noti.error(
                    "Link không hợp lệ !",
                    "Không tìm thấy form từ link của bạn !"
                  );
                  resetForm();
                }
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="w-[99vw] md:w-[75vw] text-2xl ">
              <Search
                placeholder="Nhập link google form có chứa edit ..."
                size="large"
                allowClear
                value={link}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "") setStatus("");
                  else setStatus("error");
                  setLink(v);
                }}
                status={status}
                enterButton={
                  <Button type="primary" htmlType="submit">
                    Truy cập form
                  </Button>
                }
                onSearch={() => {}}
                name="link"
              />
            </div>
          </form>
        ) : (
          <GoolgeFormView data={data} setData={setData} />
        )}
      </div>
    </>
  );
}

export default FormFillPage;
