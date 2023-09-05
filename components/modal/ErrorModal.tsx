import React, { useEffect } from "react";
import { Modal, Typography, Box } from "@mui/material";
import { ErrorModalDesktop } from "./ErrorModal.styled";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ErrorModal = ({ open, onClose }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ErrorModalDesktop.Container>
        <ErrorModalDesktop.Typography>{`Error Message`}</ErrorModalDesktop.Typography>
        <ErrorModalDesktop.Typography>{`Error Message Detail`}</ErrorModalDesktop.Typography>
      </ErrorModalDesktop.Container>
    </Modal>
  );
};

export default ErrorModal;
