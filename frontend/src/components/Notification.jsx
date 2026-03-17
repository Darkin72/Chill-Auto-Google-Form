// 1 file duy nhất để gọi noti ở mọi nơi
import { notification } from "antd";

// (Tuỳ chọn) đặt cấu hình mặc định toàn cục
notification.config({
  placement: "topRight", // topLeft | topRight | bottomLeft | bottomRight
  duration: 3, // giây; 0 = không tự tắt
  maxCount: 5, // giới hạn số noti hiển thị
});

const DEFAULTS = {
  showProgress: true,
  pauseOnHover: true,
};

export const noti = {
  //
  open: (opts = {}) => notification.open({ ...DEFAULTS, ...opts }),
  success: (message, description, opts = {}) =>
    notification.success({ ...DEFAULTS, message, description, ...opts }),
  error: (message, description, opts = {}) =>
    notification.error({ ...DEFAULTS, message, description, ...opts }),
  info: (message, description, opts = {}) =>
    notification.info({ ...DEFAULTS, message, description, ...opts }),
  warning: (message, description, opts = {}) =>
    notification.warning({ ...DEFAULTS, message, description, ...opts }),

  // Cập nhật 1 noti đang mở bằng key
  update: (key, opts = {}) => notification.open({ key, ...DEFAULTS, ...opts }),

  // Đóng tất cả
  closeAll: () => notification.destroy(),
};

export default noti;
