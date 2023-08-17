import React from "react";
import { CardImageDesktop } from "./CardImage.styled";
import Card from "@mui/material/Card";
import { Skeleton } from "@mui/material";

const CARD_MIN_WIDTH = 375;
const CARD_MARGIN_BOTTOM = 200;
const PLACEHOLDER_IMAGE_URL =
  process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;

interface Props {
  imageData: any;
}

const CardImage = ({ imageData }: Props) => {
  const [cardImageHeight, setCardImageHeight] = React.useState(0);

  React.useEffect(function () {
    // console.log("call useEffect()");
    setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);

    //* Register window resize event.
    window.addEventListener("resize", function () {
      // console.log("call resize()");
      // console.log("window.innerHeight: ", window.innerHeight);
      setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);
    });
  });

  const handleCardMediaImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    // console.log("call handleCardMediaImageError()");
    e.currentTarget.onerror = null;
    PLACEHOLDER_IMAGE_URL &&
      (e.currentTarget.src = PLACEHOLDER_IMAGE_URL);
  };

  return (
    <CardImageDesktop.Container>
      <Card>
        {imageData ? (
          <CardImageDesktop.ImageCard
            image={imageData?.imageUrl || ""}
            onError={handleCardMediaImageError}
            cardImageHeight={cardImageHeight}
          />
        ) : (
          <Skeleton
            variant="rounded"
            width={CARD_MIN_WIDTH}
            height={CARD_MIN_WIDTH}
          />
        )}
        <CardImageDesktop.CardContentWrapper>
          <CardImageDesktop.Typography
            color="text.secondary"
            gutterBottom
          >
            {imageData?.pronpt}
          </CardImageDesktop.Typography>
        </CardImageDesktop.CardContentWrapper>
      </Card>
    </CardImageDesktop.Container>
  );
};

export default CardImage;
