import React from "react";
import useSWR from "swr";
import { useRecoilStateLoadable } from "recoil";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import {
  isWalletConnected,
  AlertSeverity,
  writeToastMessageState,
} from "../lib/util";

function CardNft({
  nftData,
  dataSigner,
  selectedChain,
  address,
  isConnected,
  rentMarketContract,
  promptNftContract,
}) {
  // console.log("call CardNft()");

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  const {
    data: metadataData,
    error: metadataError,
    isValidating: metadataIsValidating,
  } = useSWR({
    command: "getMetadata",
    promptNftContract: promptNftContract,
    signer: dataSigner,
    tokenId: nftData.tokenId,
  });

  //* --------------------------------------------------------------------------
  //* Snackbar variables.
  //* --------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);
  const writeToastMessage =
    writeToastMessageLoadable?.state === "hasValue"
      ? writeToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: "",
          snackbarTime: new Date(),
          snackbarOpen: true,
        };

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  return (
    <Box sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }}>
      <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
        {metadataData ? (
          <CardMedia
            component="img"
            image={metadataData ? metadataData.image : ""}
            onError={handleCardMediaImageError}
          />
        ) : (
          <Skeleton
            variant="rounded"
            width={CARD_MIN_WIDTH}
            height={CARD_MIN_WIDTH}
          />
        )}
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            token id: {nftData.tokenId.toNumber()}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            name: {metadataData ? metadataData.name : ""}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            description: {metadataData ? metadataData.description : ""}
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
              if (isWalletConnected({ isConnected, selectedChain }) === false) {
                setWriteToastMessage({
                  snackbarSeverity: AlertSeverity.warning,
                  snackbarMessage: `Change blockchain network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`,
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });
                return;
              }

              if (!rentMarketContract || !dataSigner) {
                console.error(
                  "rentMarketContract or signer is null or undefined."
                );
                return;
              }

              //* Rent this nft with rent fee.
              // console.log("nftData.rentFee: ", nftData.rentFee);
              // console.log("nftData.tokenId: ", nftData.tokenId);
              // console.log("rentMarketContract: ", rentMarketContract);
              // console.log("dataSigner: ", dataSigner);
              // console.log(
              //   "process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS: ",
              //   process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS
              // );
              // console.log(
              //   "process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS: ",
              //   process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS
              // );
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
                console.error("error: ", error);
                setWriteToastMessage({
                  snackbarSeverity: AlertSeverity.error,
                  snackbarMessage: error.data
                    ? error.data.message
                    : error.message,
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });
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

export default CardNft;
