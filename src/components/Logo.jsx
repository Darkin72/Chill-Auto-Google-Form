import logo from "/logo.jpg";
import { Link } from "react-router-dom";

function Logo() {
  return (
    <>
      <Link
        to="/"
        className="flex flex-row items-center gap-2 mx-10 my-2 max-w-[10vw] "
      >
        <img
          src={logo}
          alt="logo"
          className="w-10 h-10 rounded-full border-2 border-gray-300"
        />
        <h1 className="text-2xl font-bold">Chill</h1>
      </Link>
    </>
  );
}

export default Logo;
