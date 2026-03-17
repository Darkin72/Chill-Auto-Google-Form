import { InputNumber } from "antd";
import Box from "./Box";
import AISection from "./AISection";

function GridQuestion({
  question,
  isGenerate,
  setAIGenerated,
  gridRatios = {},
  onGridRatioChange,
  questionId, // Đây sẽ là array cho grid questions
}) {
  return (
    <Box>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tỷ lệ lưới cố định
          </label>
          <div className="space-y-6">
            {question[4].map((row, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="font-medium text-gray-800 text-sm">{row[3]}</h4>
                <div className="space-y-2 pl-4">
                  {row[1].map((option, optIdx) => (
                    <div className="flex items-center gap-3" key={optIdx}>
                      <InputNumber
                        placeholder="Tỷ lệ"
                        className="!rounded-xl"
                        style={{ width: "100px" }}
                        min={0}
                        max={100}
                        value={
                          gridRatios[`${idx}-${optIdx}`] === null ||
                          gridRatios[`${idx}-${optIdx}`] === undefined
                            ? null
                            : gridRatios[`${idx}-${optIdx}`]
                        }
                        onChange={(value) =>
                          onGridRatioChange &&
                          onGridRatioChange(
                            idx,
                            optIdx,
                            value === null ? 0 : value
                          )
                        }
                        disabled={isGenerate}
                      />
                      <p className="flex-1 text-sm text-gray-700">
                        {option[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <AISection
          isGenerate={isGenerate}
          setAIGenerated={setAIGenerated}
          questionId={questionId} // Truyền array questionIds
        />
      </div>
    </Box>
  );
}

export default GridQuestion;
