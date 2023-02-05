import React from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function ListNft({ allNftDataArray, pageIndex }) {
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const NUMBER_PER_PAGE = 5;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  React.useEffect(
    function () {
      console.log("call useEffect()");
      console.log("allNftDataArray: ", allNftDataArray);
      console.log("pageIndex: ", pageIndex);
    },
    [allNftDataArray, pageIndex]
  );

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    // console.log("imageUrl: ", imageUrl);
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

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

  const NftCardList = React.useCallback(
    function NftCardList(props) {
      console.log("call NftCardList()");

      if (allNftDataArray.length === 0) {
        return <NoContentPage message={"No prompt NFT."} />;
      }

      return allNftDataArray.map((nftData, idx) => {
        // console.log("idx: ", idx);
        // console.log("pageIndex: ", pageIndex);
        //* Check idx is in pagination.
        //* pageIndex starts from 1.
        //* idx starts from 0.
        if (
          idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
          idx < pageIndex * NUMBER_PER_PAGE
        ) {
          return (
            <Box sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }} key={idx}>
              <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
                <CardMedia
                  component="img"
                  // width={100}
                  image={nftData.metadata.image}
                  onError={handleCardMediaImageError}
                />
                <CardContent>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    token id: {nftData.tokenId.toNumber()}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                    component="div"
                  >
                    name: {nftData.metadata.name}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                    component="div"
                  >
                    description: {nftData.metadata.description}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                    component="div"
                  >
                    rent fee: {nftData.rentFee / Math.pow(10, 18)} matic
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={async () => {
                      if (mode === "nft" && isWalletConnected() === false) {
                        // console.log("chainName: ", getChainName({ chainId }));
                        setSnackbarSeverity("warning");
                        setSnackbarMessage(
                          `Change blockchain network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`
                        );
                        setOpenSnackbar(true);
                        return;
                      }

                      if (!rentMarketContract || !dataSigner) {
                        console.error(
                          "rentMarketContract or signer is null or undefined."
                        );
                        return;
                      }

                      //* Rent this nft with rent fee.
                      try {
                        const tx = await rentMarketContract
                          .connect(dataSigner)
                          .rentNFT(
                            process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
                            nftData.tokenId,
                            process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS,
                            {
                              value: nftData.rentFee,
                            }
                          );
                        const txResult = await tx.wait();
                      } catch (error) {
                        console.error(error);
                        setSnackbarSeverity("error");
                        setSnackbarMessage(
                          error.data.message
                            ? error.data.message
                            : error.message
                        );
                        setOpenSnackbar(true);
                      }
                    }}
                  >
                    RENT
                  </Button>
                </CardActions>
              </Card>
            </Box>
          );
        }
      });
    },
    [allNftDataArray.length, pageIndex]
  );

  return <NftCardList />;
}

export default ListNft;
