import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import styled from "styled-components";

const CARD_MARGIN_TOP = "60px";
const CARD_PADDING = 1;

//* Height of bottom pagination button and bar.

interface Props {
  cardImageHeight: number;
}

const CardImageDesktop = {
  Container: styled(Box)`
    margin: ${CARD_PADDING};
    margin-top: ${CARD_MARGIN_TOP};

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `,

  ImageCard: styled(CardMedia)<Props>`
    height: ${({ cardImageHeight }) => cardImageHeight};
  `,

  CardContentWrapper: styled(CardContent)`
    width: 90vw;
  `,

  Typography: styled(Typography)`
    font-size: 14;
  `,
};

export { CardImageDesktop };
