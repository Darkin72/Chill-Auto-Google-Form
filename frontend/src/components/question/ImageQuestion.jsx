import { Skeleton } from "antd";
import Box from "./Box";

function ImageQuestion({ question }) {
  const renderImageContent = () => {
    let imageUrl = null;
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Question image"
          style={{
            width: question[6][2][0],
            height: question[6][2][1],
            objectFit: "cover",
            borderRadius: "6px",
          }}
        />
      );
    }

    return (
      <Skeleton.Image
        style={{
          width: question[6][2][0],
          height: question[6][2][1],
        }}
        active
      />
    );
  };

  return (
    <Box>
      <div className="space-y-4">
        <div>
          <div className="border border-gray-200 rounded-md p-3">
            {renderImageContent()}
          </div>
        </div>
      </div>
    </Box>
  );
}

export default ImageQuestion;
