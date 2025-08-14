import { Card } from "antd";
import { StarFilled } from "@ant-design/icons";

function DescriptionSection({ question }) {
  const questionType = question[3];
  const isHeaderDescription = questionType === 8; // Mô tả đầu trang

  return (
    <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
            isHeaderDescription
              ? "bg-gradient-to-br from-green-100 to-emerald-100 ring-green-200"
              : "bg-gradient-to-br from-purple-100 to-violet-100 ring-purple-200"
          }`}
        >
          {isHeaderDescription ? (
            <StarFilled className="text-green-600 text-xl" />
          ) : (
            <StarFilled className="text-purple-600 text-xl" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 mb-3 ${
              isHeaderDescription
                ? "bg-green-50 text-green-700 ring-green-200"
                : "bg-purple-50 text-purple-700 ring-purple-200"
            }`}
          >
            {isHeaderDescription ? "📋 Mô tả đầu trang" : "📝 Mô tả cuối trang"}
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {question[1]}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DescriptionSection;
