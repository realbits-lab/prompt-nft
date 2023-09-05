import React, { useState } from "react";
import ErrorModal from "@/components/modal/ErrorModal";
import { Button } from "@mui/material";

const Test = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleClickButton = () => {
    setOpenModal(false);
  };

  return (
    <div>
      <Button
        onClick={() => {
          setOpenModal(true);
        }}
      >
        {"Error Button"}
      </Button>
      {openModal && (
        <ErrorModal open={openModal} onClose={handleClickButton} />
      )}
    </div>
  );
};

export default Test;
