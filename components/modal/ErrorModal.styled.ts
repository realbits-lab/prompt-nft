import styled from "styled-components";
import { Typography, Box } from "@mui/material";

const ErrorModalDesktop = {
  Container: styled(Box)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 300px;
    height: 100px;
    display: flex;
    flex-direction: column;
    background-color: white;
    border: 1px solid black;
    border-radius: 5px;
    gap: 5px;

    padding: 5px;
  `,
  Typography: styled(Typography)`
    font-size: 14px;
    font-weight: bold;
  `,
};

export { ErrorModalDesktop };
