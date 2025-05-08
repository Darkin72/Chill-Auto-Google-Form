import { useState } from "react";
import donateIcon from "/donate.png";
import { Link } from "react-router-dom";

function Donate() {
  return (
    <>
      <Link
        to="donate"
        className="flex flex-col items-center mx-10 max-w-[10vw]"
      >
        <img
          src={donateIcon}
          alt="logo"
          className="w-10 h-10 rounded-full border-2 border-gray-300"
        />
        <h1 className="text-[13px] font-bold">Donate me!!!</h1>
      </Link>
    </>
  );
}

export default Donate;
