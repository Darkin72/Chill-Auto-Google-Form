import { useState } from "react";
import qr from "/qr.jpg";
import cf from "/coffee.png";

function DonatePage() {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-x-10 h-[93vh]">
      <div className="flex flex-col items-center gap-10 max-w-[30vw]">
        <span className="text-2xl">
          Mọi sự đóng góp của bạn đều rất quý giá và sẽ giúp tôi phát triển dự
          án này hơn nữa.
        </span>
        <span className="text-2xl">
          Chúc bạn một ngày tốt lành và hy vọng bạn sẽ có những trải nghiệm
          tuyệt vời với dự án này!
        </span>
        <img src={cf} className="max-h-[10vh] min-h-[3vh] inline"></img>
      </div>
      <img src={qr} className="h-96"></img>
    </div>
  );
}

export default DonatePage;
