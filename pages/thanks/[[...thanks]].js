import React from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

function ThanksPage() {
  //*---------------------------------------------------------------------------
  //* Define constance variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  const router = useRouter();
  const imageUrl = router.query.thanks[0];
  console.log("imageUrl: ", imageUrl);

  const handleCardMediaImageError = (e) => {
    // console.log("call handleCardMediaImageError()");
    // console.log("imageUrl: ", imageUrl);
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  };

  return (
    <Box
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
        <CardMedia
          component="img"
          image={imageUrl}
          onError={handleCardMediaImageError}
        />
        <CardContent
          sx={{
            padding: "10",
          }}
        >
          <Typography variant="caption">
            Thanks for minting your image with prompt. We save your encrypted
            prompt to contract and you can find that with metamask decrypt
            function.
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={async () => {}}>
            <Typography variant="h5">
              <Link href="/list/nft">Go to view other images</Link>
            </Typography>
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default ThanksPage;
