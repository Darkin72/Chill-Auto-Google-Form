import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function NavBarButton({ to, icon, text, isMobile = false, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (isMobile) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-500"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <div className={`${isActive ? "text-blue-600" : "text-gray-500"}`}>
          {icon}
        </div>
        <span className="font-medium text-sm">{text}</span>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link
        to={to}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200/50"
            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 backdrop-blur-sm"
        }`}
      >
        <div
          className={`transition-colors duration-200 ${
            isActive ? "text-white" : "text-current"
          }`}
        >
          {icon}
        </div>
        <span className="hidden sm:inline">{text}</span>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 -z-10"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Hover effect */}
        {!isActive && (
          <div className="absolute inset-0 rounded-full bg-blue-50/0 hover:bg-blue-50/80 transition-colors duration-200 -z-10" />
        )}
      </Link>
    </motion.div>
  );
}

export default NavBarButton;
