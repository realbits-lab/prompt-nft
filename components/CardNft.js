import React from "react";
import { isMobile } from "react-device-detect";
import useSWR from "swr";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWatchPendingTransactions,
} from "wagmi";
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
  writeDialogMessageState,
  handleCheckPrompt,
} from "../lib/util";
import rentmarketABI from "../contracts/rentMarket.json";
import useUser from "../lib/useUser";

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
  // console.log("nftData: ", nftData);

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;
  const SERVICE_ACCOUNT_ADDRESS =
    process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS;

  const CARD_MARGIN_TOP = "60px";
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
    tokenId: nftData ? nftData.tokenId : 0,
  });
  const { user, mutateUser } = useUser();

  //* Wait for transactions.
  const { config } = usePrepareContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "rentNFT",
    args: [
      PROMPT_NFT_CONTRACT_ADDRESS,
      nftData.tokenId,
      SERVICE_ACCOUNT_ADDRESS,
    ],
    overrides: { value: nftData.rentFee },
  });
  const contractWrite = useContractWrite(config);
  // console.log("contractWrite: ", contractWrite);
  // console.log("contractWrite.write: ", contractWrite.write);
  // console.log("contractWrite.status: ", contractWrite.status);
  // console.log("contractWrite.data?.hash: ", contractWrite.data?.hash);
  const waitForTransaction = useWaitForTransaction({
    hash: contractWrite.data?.hash,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("call onSuccess()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Renting is finished.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
      setIsRenting(false);
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
      // console.log("readRentingData: ", readRentingData);
    },
  });
  // console.log("waitForTransaction: ", waitForTransaction);
  // console.log("waitForTransaction.data: ", waitForTransaction.data);
  // console.log("waitForTransaction.status: ", waitForTransaction.status);

  //* Get pending transactions.
  useWatchPendingTransactions({
    listener: function (tx) {
      console.log("tx: ", tx);
    },
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

  //* --------------------------------------------------------------------------
  //* Prompt dialog variables.
  //* --------------------------------------------------------------------------
  const [writeDialogMessageLoadable, setWriteDialogMessage] =
    useRecoilStateLoadable(writeDialogMessageState);
  const writeDialogMessage =
    writeDialogMessageLoadable?.state === "hasValue"
      ? writeDialogMessageLoadable.contents
      : {
          decyprtedPrompt: undefined,
          openDialog: false,
        };

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  const [isRenting, setIsRenting] = React.useState(false);

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
        {metadataData ? (
          <CardMedia
            component="img"
            image={metadataData ? metadataData.image : ""}
            onError={handleCardMediaImageError}
            sx={{
              objectFit: "cover",
              width: "90vw",
              height: "50vh",
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
            # {nftData.tokenId.toNumber()} /{" "}
            {metadataData ? metadataData.name : ""} /{" "}
            {metadataData ? metadataData.description : ""} /{" "}
            {nftData.rentFee / Math.pow(10, 18)} matic
          </Typography>
        </CardContent>
        <CardActions>
          {nftData.isOwn === true || nftData.isRent === true ? (
            <Button
              size="small"
              onClick={async function () {
                await handleCheckPrompt({
                  setWriteToastMessage: setWriteToastMessage,
                  setWriteDialogMessage: setWriteDialogMessage,
                  isMobile: isMobile,
                  user: user,
                  nftData: nftData,
                  promptNftContract: promptNftContract,
                  dataSigner: dataSigner,
                  isConnected: isConnected,
                  selectedChain: selectedChain,
                  address: address,
                  mutateUser: mutateUser,
                });
              }}
            >
              PROMPT
            </Button>
          ) : isRenting === true ? (
            <Typography
              color="text.secondary"
              variant="h7"
              gutterBottom
              component="div"
            >
              RENTING
            </Typography>
          ) : (
            <>
              <Button
                size="medium"
                variant="contained"
                onClick={async () => {
                  if (
                    isWalletConnected({ isConnected, selectedChain }) === false
                  ) {
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

                  setWriteToastMessage({
                    snackbarSeverity: AlertSeverity.info,
                    snackbarMessage: "Trying to rent this nft...",
                    snackbarTime: new Date(),
                    snackbarOpen: true,
                  });

                  try {
                    setIsRenting(true);
                    // console.log("contractWrite: ", contractWrite);
                    const tx = await contractWrite.writeAsync();
                    // console.log("tx: ", tx);

                    // console.log("tx: ", tx);
                    // const tx = await rentMarketContract
                    //   .connect(dataSigner)
                    //   .rentNFT(
                    //     process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
                    //     nftData.tokenId,
                    //     process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS,
                    //     {
                    //       value: nftData.rentFee,
                    //     }
                    //   );
                    // const txResult = await tx.wait();
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
                    setIsRenting(false);
                    return;
                  }

                  setWriteToastMessage({
                    snackbarSeverity: AlertSeverity.info,
                    snackbarMessage:
                      "Rent transaction is just started and wait a moment...",
                    snackbarTime: new Date(),
                    snackbarOpen: true,
                  });
                }}
              >
                RENT
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </Box>
  );
}

export default CardNft;
