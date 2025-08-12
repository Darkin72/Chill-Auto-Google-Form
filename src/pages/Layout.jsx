import NavBar from "../components/NavBar";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Footer from "../components/Footer";

function Layout() {
  return (
    <>
      <div className="pt-16 min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#dbeafe] to-white/90">
        <NavBar />

        <main>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Footer />
      </div>
    </>
  );
}

export default Layout;
