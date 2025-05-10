import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

function Layout() {
  return (
    <>
      <div className="pt-[7vh] min-h-screen bg-[#FFFDF6]">
        <NavBar />

        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;
