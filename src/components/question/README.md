# Question Components

Folder này chứa các component con được tách ra từ `GoogleFormView.jsx` để dễ quản lý và maintain.

## Cấu trúc:

### Core Components:
- **`Box.jsx`** - Component wrapper với styling Card cơ bản
- **`AISection.jsx`** - Component hiển thị phần Switch bật/tắt AI generation
- **`QuestionHeader.jsx`** - Component hiển thị tiêu đề câu hỏi và trạng thái bắt buộc

### Input Components:
- **`SimpleInput.jsx`** - Component cho text input và textarea
- **`DateInput.jsx`** - Component cho Date picker với các biến thể (có/không có time, year)
- **`TimeInput.jsx`** - Component cho Time picker với các biến thể (có/không có seconds)
- **`OptionsWithRatio.jsx`** - Component cho multiple choice, dropdown, checkbox với tỷ lệ
- **`LinearScaleInput.jsx`** - Component cho linear scale questions
- **`GridQuestion.jsx`** - Component cho grid questions

### Special Components:
- **`DescriptionSection.jsx`** - Component cho description sections (type 6, 8)
- **`Question.jsx`** - Component chính điều phối render các loại câu hỏi

### Export:
- **`index.js`** - File export tập trung tất cả components

## Cách sử dụng:

```jsx
import { Question } from './question';

// Sử dụng trong GoogleFormView
<Question
  question={question}
  answer={questionAnswer}
  updateAnswerContent={updateAnswerContent}
  updateAnswerAI={updateAnswerAI}
  updateAnswerRatios={updateAnswerRatios}
  updateAnswerOther={updateAnswerOther}
  updateAnswerGridRatios={updateAnswerGridRatios}
/>
```

## Lợi ích của việc refactor:

1. **Modular**: Mỗi component có trách nhiệm riêng biệt
2. **Reusable**: Có thể tái sử dụng các component ở các nơi khác
3. **Maintainable**: Dễ dàng sửa đổi và debug từng component riêng lẻ
4. **Testable**: Có thể test từng component độc lập
5. **Scalable**: Dễ dàng thêm loại câu hỏi mới bằng cách tạo component mới

## Date và Time Components:

### DateInput:
- Sử dụng `kind` array để xác định các tính năng:
  - `kind[0] === 1`: Thêm Time input (giờ:phút)
  - `kind[1] === 1`: Thêm year selector
- **Mask Format**: Sử dụng mask format thay vì multiple components
  - `DD/MM HH:mm` (ngày/tháng + giờ:phút)
  - `DD/MM/YYYY HH:mm` (ngày/tháng/năm + giờ:phút)
  - `DD/MM/YYYY` (ngày/tháng/năm)
  - `DD/MM` (chỉ ngày/tháng)
- **Auto Re-render**: Tự động re-render khi `kind` thay đổi sau đồng bộ dữ liệu

### TimeInput:
- Sử dụng `kind` array để xác định format:
  - `kind[0] === 0`: HH:mm format
  - `kind[0] === 1`: HH:mm:ss format
- **Auto Re-render**: Tự động re-render khi `kind` thay đổi sau đồng bộ dữ liệu

### Sync Data Fix:
- Khi nhấn "Đồng bộ dữ liệu", Date/Time components sẽ tự động:
  - Re-render với cấu hình `kind` mới
  - Reset content nếu format thay đổi để tránh conflict
  - Giữ nguyên user input nếu format không đổi
