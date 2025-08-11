import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <div className="pt-[7vh] min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#dbeafe] to-white/90">
        <NavBar />

        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;
