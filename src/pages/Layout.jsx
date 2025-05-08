import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

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
