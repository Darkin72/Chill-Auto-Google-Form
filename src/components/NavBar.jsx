import Logo from "./Logo";
import Donate from "./Donate";
import NavBarButton from "./NavBarButton";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  HomeOutlined,
  FormOutlined,
  MessageOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const size = "text-xl";

const iconList = {
  homeIcon: <HomeOutlined className={size} />,
  formIcon: <FormOutlined className={size} />,
  contactIcon: <MessageOutlined className={size} />,
  menuIcon: <MenuOutlined className={size} />,
  closeIcon: <CloseOutlined className={size} />,
};

function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-[1000] bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-lg shadow-blue-200/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Logo />
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <NavBarButton to="/" icon={iconList.homeIcon} text="Trang chủ" />
              <NavBarButton
                to="/formfill"
                icon={iconList.formIcon}
                text="Điền form"
              />
              <NavBarButton
                to="/contact"
                icon={iconList.contactIcon}
                text="Liên hệ"
              />
            </div>

            {/* Right side - Desktop */}
            <div className="hidden md:flex">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Donate />
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="md:hidden"
              >
                <Donate />
              </motion.div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? iconList.closeIcon : iconList.menuIcon}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-blue-100 bg-white/90 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                <NavBarButton
                  to="/"
                  icon={iconList.homeIcon}
                  text="Trang chủ"
                  isMobile
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <NavBarButton
                  to="/formfill"
                  icon={iconList.formIcon}
                  text="Điền form"
                  isMobile
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <NavBarButton
                  to="/contact"
                  icon={iconList.contactIcon}
                  text="Liên hệ"
                  isMobile
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

export default NavBar;
