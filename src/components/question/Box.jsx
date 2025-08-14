import { Card } from "antd";

function Box({ children, className = "" }) {
  return (
    <Card
      className={`rounded-[2rem] border-0 shadow-xl shadow-blue-200/40 bg-white/90 backdrop-blur ${className}`}
      styles={{ body: { padding: 24 } }}
    >
      {children}
    </Card>
  );
}

export default Box;
