import { useState } from "react";
import Logo from "./Logo";
import Donate from "./Donate";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <>
      <nav className="flex flex-row justify-between items-center w-screen h-[7vh] border-b-2 border-gray-300 fixed top-0 left-0 z-[1000] bg-[#F5F5F5]">
        <Logo />
        <div className="flex flex-row gap-4">
          <Link to="/">Trang chủ</Link>
          <Link to="/">Giới thiệu</Link>
          <Link to="/">Liên hệ</Link>
        </div>
        <Donate />
      </nav>
    </>
  );
}

export default NavBar;
