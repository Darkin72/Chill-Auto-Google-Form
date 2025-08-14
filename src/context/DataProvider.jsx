import React, { useMemo, useState, useEffect, useCallback } from "react";

import { DataContext } from "./DataContext";

function generateBlankAnswer(data) {
  return data?.questions
    ? data.questions
        .filter((q) => q[4]?.[0]?.[0] || q[3] === 8) // Lấy những câu hỏi có ID hoặc type = 8
        .map((q, index) => ({
          questionId: q[4]?.[0]?.[0] || null,
          index: index,
          title: q[1],
          content: "",
          ai_generate: false,
          mustAnswer: q[4]?.[0]?.[2] || 0,
          type: q[3],
          ratios: (() => {
            // Tạo ratios mặc định cho các loại câu hỏi có options
            if ([2, 3, 4, 5, 18].includes(q[3])) {
              const options = q[4][0][1] || [];
              return Object.fromEntries(options.map((val) => [val[0], 0]));
            }
            return {};
          })(),
          otherValue: "",
          gridRatios: (() => {
            // Tạo gridRatios mặc định cho Grid questions (type 7)
            if (q[3] === 7) {
              const gridRatios = {};
              q[4].forEach((row, rowIdx) => {
                if (row[1]) {
                  row[1].forEach((_, optIdx) => {
                    gridRatios[`${rowIdx}-${optIdx}`] = 0;
                  });
                }
              });
              return gridRatios;
            }
            return {};
          })(),
          kind: (() => {
            // Special value for Date, time and grid to classify
            // Date
            if (q[3] === 9) {
              return q[4]?.[0]?.[7] || null;
            }
            //Time
            if (q[3] === 10) {
              return q[4]?.[0]?.[6] || null;
            }
            // Grid
            if (q[3] === 7) {
              return q[4]?.[0]?.[11] || null;
            }
            return null;
          })(),
        }))
    : [];
}

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [answer, setAnswer] = useState([]);

  // Cập nhật answer khi data thay đổi, nhưng giữ lại các giá trị đã cấu hình
  useEffect(() => {
    if (!data) {
      setAnswer([]);
      return;
    }

    const newInitialAnswer = generateBlankAnswer(data);

    // Chỉ cập nhật khi có thay đổi trong structure hoặc khi answer đang trống
    setAnswer((prev) => {
      // Nếu answer trống hoặc có thay đổi về số lượng câu hỏi
      if (prev.length === 0 || prev.length !== newInitialAnswer.length) {
        return newInitialAnswer;
      }

      // Kiểm tra xem có câu hỏi mới không bằng cách so sánh questionId
      const prevQuestionIds = prev.map((item) => item.questionId);
      const newQuestionIds = newInitialAnswer.map((item) => item.questionId);
      const hasNewQuestions = newQuestionIds.some(
        (id) => !prevQuestionIds.includes(id)
      );

      // Kiểm tra xem có kind thay đổi cho Date/Time questions không
      const hasKindChanges = newInitialAnswer.some((newItem) => {
        const existingItem = prev.find(
          (p) => p.questionId === newItem.questionId
        );
        if (existingItem && (newItem.type === 9 || newItem.type === 10)) {
          return (
            JSON.stringify(existingItem.kind) !== JSON.stringify(newItem.kind)
          );
        }
        return false;
      });

      if (hasNewQuestions || hasKindChanges) {
        // Merge giữ lại các giá trị cũ và thêm các câu hỏi mới
        const merged = [...newInitialAnswer];
        newInitialAnswer.forEach((newItem, index) => {
          const existingItem = prev.find(
            (p) => p.questionId === newItem.questionId
          );
          if (existingItem) {
            // Kiểm tra nếu là Date/Time question và kind đã thay đổi
            const isDateTimeQuestion =
              newItem.type === 9 || newItem.type === 10;
            const kindChanged =
              JSON.stringify(existingItem.kind) !==
              JSON.stringify(newItem.kind);

            if (isDateTimeQuestion && kindChanged) {
              // Reset content khi kind thay đổi để tránh format conflict
              merged[index] = {
                ...existingItem,
                kind: newItem.kind,
                content: "", // Reset content
                type: newItem.type, // Đảm bảo type được cập nhật
                title: newItem.title, // Cập nhật title nếu cần
                mustAnswer: newItem.mustAnswer, // Cập nhật mustAnswer nếu cần
              };
            } else {
              // Cập nhật các thông tin khác nhưng giữ nguyên user input
              merged[index] = {
                ...existingItem,
                kind: newItem.kind,
                type: newItem.type,
                title: newItem.title,
                mustAnswer: newItem.mustAnswer,
              };
            }
          }
        });
        return merged;
      }

      // Không có thay đổi, giữ nguyên answer hiện tại
      return prev;
    });
  }, [data]);

  // Các hàm cập nhật answer
  const updateAnswerContent = useCallback((questionId, content) => {
    setAnswer((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, content } : item
      )
    );
  }, []);

  const updateAnswerAI = useCallback((questionId, ai_generate) => {
    setAnswer((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, ai_generate } : item
      )
    );
  }, []);

  const updateAnswerRatios = useCallback((questionId, ratios) => {
    setAnswer((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, ratios } : item
      )
    );
  }, []);

  const updateAnswerOther = useCallback((questionId, otherValue) => {
    setAnswer((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, otherValue } : item
      )
    );
  }, []);

  const updateAnswerGridRatios = useCallback((questionId, gridRatios) => {
    setAnswer((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, gridRatios } : item
      )
    );
  }, []);

  // Helper function để convert answer array thành object format (backward compatibility)
  const getAnswerAsObject = useCallback(() => {
    return Object.fromEntries(answer.map((item, index) => [index, item]));
  }, [answer]);

  const value = useMemo(
    () => ({
      data,
      setData,
      answer,
      setAnswer,
      updateAnswerContent,
      updateAnswerAI,
      updateAnswerRatios,
      updateAnswerOther,
      updateAnswerGridRatios,
      getAnswerAsObject,
    }),
    [
      data,
      answer,
      updateAnswerContent,
      updateAnswerAI,
      updateAnswerRatios,
      updateAnswerOther,
      updateAnswerGridRatios,
      getAnswerAsObject,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
