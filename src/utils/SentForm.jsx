// Helper function to validate ratio values
function isValidRatio(ratio) {
  return Number.isInteger(ratio) && ratio >= 0 && ratio <= 100;
}

export function sendForm(answer) {
  // Kiểm tra xem có câu hỏi bắt buộc nào không
  let hasRequiredQuestions = false;
  for (let id in answer) {
    if (answer[id]["mustAnswer"]) {
      hasRequiredQuestions = true;
      break;
    }
  }

  if (!hasRequiredQuestions) {
    console.log(`Sent form answer (no required questions):`, answer);
    return { success: true, message: "Form đã sắn sàng để gửi !" };
  }

  // Validation cho các câu hỏi bắt buộc
  const errors = [];

  // First: Validate ratios for ALL questions (required and non-required)
  for (let questionId in answer) {
    const answerData = answer[questionId];
    const questionTitle = answerData.title || `Câu hỏi ${questionId}`;
    const questionType = answerData.type;

    // Skip AI generated answers
    if (answerData.ai_generate) continue;

    // Check ratio validation for questions with ratios
    if ([2, 3, 4, 5, 18].includes(questionType)) {
      const ratioEntries = Object.entries(answerData.ratios || {});
      const invalidRatios = ratioEntries.filter(
        ([, ratio]) => !isValidRatio(ratio)
      );
      if (invalidRatios.length > 0) {
        errors.push(
          ` - Câu hỏi "${questionTitle}": Tỷ lệ phải là số nguyên từ 0-100.`
        );
      }
    }

    // Check ratio validation for grid questions
    if (questionType === 7) {
      const gridRatios = answerData.gridRatios || {};
      const invalidGridRatios = Object.entries(gridRatios).filter(
        ([, ratio]) => !isValidRatio(ratio)
      );
      if (invalidGridRatios.length > 0) {
        errors.push(
          ` - Câu hỏi "${questionTitle}": Tỷ lệ phải là số nguyên từ 0-100.`
        );
      }
    }
  }

  // Second: Validate required questions content
  for (let questionId in answer) {
    const answerData = answer[questionId];

    if (!answerData.mustAnswer) continue; // Skip non-required questions

    const questionTitle = answerData.title || `Câu hỏi ${questionId}`;
    const questionType = answerData.type;

    // Case 1: AI generate is true - always valid
    if (answerData.ai_generate) continue;

    // Case 2: Type 0 (Short answer) or Type 1 (Paragraph) - content must not be empty
    if ([0, 1].includes(questionType)) {
      if (!answerData.content || answerData.content.trim() === "") {
        errors.push(
          ` - Câu hỏi "${questionTitle}" là bắt buộc và cần có nội dung trả lời.`
        );
      }
      continue;
    }

    // Case 3: Questions with ratios - at least one ratio must be > 0
    if ([2, 3, 4, 5, 18].includes(questionType)) {
      const ratioEntries = Object.entries(answerData.ratios || {});
      const ratioValues = ratioEntries.map(([, value]) => value);

      const hasValidRatio = ratioValues.some((ratio) => ratio > 0);
      if (!hasValidRatio) {
        errors.push(
          ` - Câu hỏi "${questionTitle}" là bắt buộc và cần có ít nhất một lựa chọn có tỷ lệ lớn hơn 0.`
        );
      }
      continue;
    }

    // Case 4: Grid questions - each row must have at least one option > 0
    if (questionType === 7) {
      const gridRatios = answerData.gridRatios || {};

      // Lấy danh sách các hàng duy nhất từ gridRatios keys
      const rowIndices = [
        ...new Set(
          Object.keys(gridRatios)
            .filter((key) => key.includes("-"))
            .map((key) => parseInt(key.split("-")[0]))
        ),
      ];

      for (const rowIdx of rowIndices) {
        const rowRatios = Object.entries(gridRatios)
          .filter(([key]) => key.startsWith(`${rowIdx}-`))
          .map(([, value]) => value);

        const hasValidRowRatio = rowRatios.some((ratio) => ratio > 0);

        if (!hasValidRowRatio) {
          errors.push(
            ` - Câu hỏi "${questionTitle}" - Hàng ${
              rowIdx + 1
            } là bắt buộc và cần có ít nhất một lựa chọn có tỷ lệ lớn hơn 0.`
          );
        }
      }
      continue;
    }

    // Case 5: Date and Time questions - content must not be empty
    if ([9, 10].includes(questionType)) {
      if (!answerData.content) {
        errors.push(
          ` - Câu hỏi "${questionTitle}" là bắt buộc và cần được điền.`
        );
      }
      continue;
    }
  }

  // Nếu có lỗi validation
  if (errors.length > 0) {
    console.log("Validation errors:", errors);
    return {
      success: false,
      errors: errors,
      message: `Vui lòng hoàn thành các câu hỏi bắt buộc:\n${errors.join(
        "\n"
      )}`,
    };
  }

  // Nếu tất cả validation passed
  console.log(`Sent form answer:`, answer);
  return { success: true, message: "Form đã sắn sàng để gửi !" };
}

const api_endpoint = "http://localhost:8000/submit-answer";

export async function startSendForm(answer, repeat) {
  try {
    console.log("start send form");
    const response = await fetch(api_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer: answer, repeat: repeat }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Form submitted successfully:", data);
      return data;
    } else {
      console.error("Error submitting form:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  return null;
}
