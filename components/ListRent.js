import React from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardRent from "./CardRent";

function ListRent({ allMyRentDataArray, pageIndex }) {
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const NUMBER_PER_PAGE = 5;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  function NoContentPage({ message }) {
    return (
      <Box
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Grid container spacing={2} justifyContent="space-around" padding={2}>
          <Grid item>
            <Web3Button />
          </Grid>
          <Grid item>
            <Web3NetworkSwitch />
          </Grid>
        </Grid>
        <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
          <CardMedia component="img" image={PLACEHOLDER_IMAGE_URL} />
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <Typography variant="h7">{message}</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (allMyRentDataArray.length === 0) {
    return (
      <NoContentPage
        message={"You have not yet rented any image prompt NFT."}
      />
    );
  }

  return allMyRentDataArray.map((nftData, idx) => {
    // console.log("nftData: ", nftData);
    // console.log("idx: ", idx);
    // console.log("pageIndex: ", pageIndex);
    // Check idx is in pagination.
    // pageIndex.rent starts from 1.
    // idx starts from 0.
    if (
      idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
      idx < pageIndex * NUMBER_PER_PAGE
    ) {
      return <CardRent nftData={nftData} />;
    }
  });
}

export default ListRent;
