import { Card } from "antd";

const StatsSection = () => {
  return (
    <section className="container mx-auto px-4 md:px-6 lg:px-10 py-10 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Tiết kiệm thời gian, tăng hiệu suất
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl">
            Công cụ được tối ưu cho quy mô từ cá nhân tới nhóm. Tự động hóa quy
            trình, giảm thao tác lặp lại và đảm bảo kết quả nhất quán.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Tự động điền thông minh",
              "Hỗ trợ đa dạng câu hỏi",
              "Tùy chỉnh tỷ lệ trả lời",
              "Không cần cài đặt phức tạp",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-gray-700">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-600" />{" "}
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            variant="borderless"
            className="rounded-[2rem] shadow-lg bg-white/90"
          >
            <div className="p-6">
              <p className="text-sm text-gray-500">Thời gian xử lý</p>
              <div className="mt-2 text-4xl font-extrabold">-80%</div>
              <p className="mt-1 text-gray-600">So với nhập thủ công</p>
            </div>
          </Card>
          <Card
            variant="borderless"
            className="rounded-[2rem] shadow-lg bg-white/90"
          >
            <div className="p-6">
              <p className="text-sm text-gray-500">Độ chính xác</p>
              <div className="mt-2 text-4xl font-extrabold">100%</div>
              <p className="mt-1 text-gray-600">Đảm bảo đúng tỷ lệ</p>
            </div>
          </Card>
          <Card
            variant="borderless"
            className="rounded-[2rem] shadow-lg bg-white/90"
          >
            <div className="p-6">
              <p className="text-sm text-gray-500">Dễ sử dụng</p>
              <div className="mt-2 text-4xl font-extrabold">{"< 5 phút"}</div>
              <p className="mt-1 text-gray-600">Thiết lập ban đầu</p>
            </div>
          </Card>
          <Card
            variant="borderless"
            className="rounded-[2rem] shadow-lg bg-white/90"
          >
            <div className="p-6">
              <p className="text-sm text-gray-500">Khả năng mở rộng</p>
              <div className="mt-2 text-4xl font-extrabold">Hàng loạt</div>
              <p className="mt-1 text-gray-600">
                Gửi số lượng lớn form theo cấu hình.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
