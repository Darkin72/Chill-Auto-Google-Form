import { useContext } from "react";
import { DataContext } from "../context/DataContext";

function NotFoundPage() {
  const { data, setData } = useContext(DataContext);
  return (
    <>
      <button
        onClick={() => {
          setData("HELLO");
          console.log("Data", data);
        }}
      >
        Hello
      </button>
    </>
  );
}

export default NotFoundPage;
