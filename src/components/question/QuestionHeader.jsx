import { StarFilled } from "@ant-design/icons";
import Box from "./Box";

function QuestionHeader({ question }) {
  return (
    <Box className="mb-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10 ring-1 ring-blue-100">
          <StarFilled className="text-amber-600 text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {question[1]}
          </h3>
          {question?.[4]?.[0]?.[2] === 1 ? (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-1 text-xs ring-1 ring-red-200">
              <span>
                {question[3] === 7
                  ? "Yêu cầu một phản hồi trong mỗi hàng"
                  : "Bắt buộc"}
              </span>
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-1 text-xs ring-1 ring-green-200">
              <span>Không bắt buộc</span>
            </div>
          )}
        </div>
      </div>
    </Box>
  );
}

export default QuestionHeader;
