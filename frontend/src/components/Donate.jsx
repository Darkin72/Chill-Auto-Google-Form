import { Link } from "react-router-dom";
import donateIcon from "/donate.png";

function Donate() {
  return (
    <Link
      to="donate"
      className="duration-300 hover:scale-105 inline-flex items-center gap-2 px-3 py-1 mr-5 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-tranform shadow-md"
    >
      <img
        src={donateIcon}
        alt="Donate icon"
        className="w-6 h-6 rounded-full border border-gray-400"
      />
      <span className="text-sm font-semibold text-gray-800">Donate me!!!</span>
    </Link>
  );
}

export default Donate;
