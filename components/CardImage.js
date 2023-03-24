import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

function CardImage({ imageData }) {
  // console.log("call CardImage()");
  // console.log("imageData: ", imageData);

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MARGIN_TOP = "60px";
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;
  
  //* Height of bottom pagination button and bar.
  const CARD_MARGIN_BOTTOM = 200;

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

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  return (
    <Box
      sx={{
        m: CARD_PADDING,
        marginTop: CARD_MARGIN_TOP,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card>
        {imageData ? (
          <CardMedia
            component="img"
            image={imageData ? imageData.imageUrl : ""}
            onError={handleCardMediaImageError}
            sx={{
              objectFit: "contain",
              width: "90vw",
              // height: "50vh",
              height: cardImageHeight,
            }}
          />
        ) : (
          <Skeleton
            variant="rounded"
            width={CARD_MIN_WIDTH}
            height={CARD_MIN_WIDTH}
          />
        )}
        <CardContent
          sx={{
            width: "90vw",
          }}
        >
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {imageData.prompt}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CardImage;
