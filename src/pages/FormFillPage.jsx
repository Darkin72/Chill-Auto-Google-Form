import { useState } from "react";
import Loading from "../components/Loading";
import GoolgeFormView from "../components/GoogleFormView";
import apiRequest from "../utils/FormExtractorAPI";
import { Input, Button } from "antd";
const { Search } = Input;

function FormFillPage() {
  const [link, setLink] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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
            onSubmit={(e) => {
              setLoading(true);
              e.preventDefault();
              apiRequest(e.target.link.value)
                .then((data) => {
                  setData(data);
                  resetForm();
                })
                .catch((error) => {
                  console.error("Error:", error);
                  resetForm();
                });
            }}
          >
            <div className="w-[99vw] md:w-[75vw] text-2xl ">
              <Search
                placeholder="Nhập link google form có chứa edit ..."
                size="large"
                allowClear
                value={link}
                onChange={(e) => setLink(e.target.value)}
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
