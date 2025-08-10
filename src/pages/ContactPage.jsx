import { useState } from "react";
import { Modal, Button } from "antd";
function ContactPage() {
  const [openModel, setOpenModal] = useState(false);
  function handleOk() {
    setOpenModal(() => {
      setOpenModal(false);
    });
  }
  function handleCancel() {
    setOpenModal(() => {
      setOpenModal(false);
    });
  }
  return (
    <>
      <Button
        onClick={() => {
          setOpenModal(true);
        }}
      >
        hello
      </Button>
      <h1>THIS IS CONTACT PAGE</h1>
      <Modal
        title="Basic Modal"
        closable={{ "aria-label": "Custom Close Button" }}
        centered
        open={openModel}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
}

export default ContactPage;
