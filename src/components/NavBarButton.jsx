import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavBarButton({ to, icon, text }) {
  const location = useLocation();
  return (
    <Link
      to={to}
      className={` flex flex-row gap-2 justify-center px-4 py-2 items-center border-b-2 rounded-[10px] ${
        location.pathname === to
          ? " border-blue-300 scale-105"
          : "border-transparent duration-300 hover:scale-105 transition-transform"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}

export default NavBarButton;
