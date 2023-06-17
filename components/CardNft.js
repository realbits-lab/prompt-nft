import React from "react";
import { isMobile } from "react-device-detect";
import useSWR from "swr";
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useContractRead,
  useSignTypedData,
  useContractEvent,
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
} from "@/lib/util";
import useUser from "@/lib/useUser";
import rentmarketABI from "@/contracts/rentMarket.json";
import promptNFTABI from "@/contracts/promptNFT.json";

export default function CardNft({
  nftData,
  dataWalletClient,
  promptNftContract,
  signTypedDataAsync,
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
  const CARD_MARGIN_BOTTOM = 250;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;
  const [cardImageHeight, setCardImageHeight] = React.useState(0);
  const [metadata, setMetadata] = React.useState();
  const { user, mutateUser } = useUser();

  //*---------------------------------------------------------------------------
  //* Wagmi hook
  //*---------------------------------------------------------------------------
  const { chains, chain: selectedChain } = useNetwork();
  const { address, isConnected } = useAccount();

  const {
    data: dataTokenURI,
    isError: isErrorTokenURI,
    isLoading: isLoadingTokenURI,
    isValidating: isValidatingTokenURI,
    status: statusTokenURI,
  } = useContractRead({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI.abi,
    functionName: "tokenURI",
    args: [nftData?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      fetch(data).then((fetchResult) =>
        fetchResult.blob().then((tokenMetadata) =>
          tokenMetadata.text().then((metadataJsonTextData) => {
            // console.log("metadataJsonTextData: ", metadataJsonTextData);
            const metadata = JSON.parse(metadataJsonTextData);
            // console.log("metadata: ", metadata);
            setMetadata(metadata);
          })
        )
      );
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });

  const {
    data: dataIsOwnerOrRenter,
    isError: isErrorIsOwnerOrRenter,
    isLoading: isLoadingIsOwnerOrRenter,
    isValidating: isValidatingIsOwnerOrRenter,
    status: statusIsOwnerOrRenter,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "isOwnerOrRenter",
    args: [address],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      console.log("call onSettled()");
      console.log("data: ", data);
      console.log("error: ", error);
    },
  });

  const {
    data: dataRentNFT,
    error: errorRentNFT,
    isError: isErrorRentNFT,
    isIdle: isIdleRentNFT,
    isLoading: isLoadingRentNFT,
    isSuccess: isSuccessRentNFT,
    write: writeRentNFT,
    status: statusRentNFT,
  } = useContractWrite({
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
  const waitForTransaction = useWaitForTransaction({
    hash: dataRentNFT?.hash,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("call onSuccess()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);

      setIsRenting(false);
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Renting is finished.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
  });

  //* Get pending transactions.
  useWatchPendingTransactions({
    listener: function (tx) {
      // console.log("tx: ", tx);
    },
  });

  //*---------------------------------------------------------------------------
  //* Snackbar variables.
  //*---------------------------------------------------------------------------
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

  //*---------------------------------------------------------------------------
  //* Prompt dialog variables.
  //*---------------------------------------------------------------------------
  const [writeDialogMessageLoadable, setWriteDialogMessage] =
    useRecoilStateLoadable(writeDialogMessageState);
  const writeDialogMessage =
    writeDialogMessageLoadable?.state === "hasValue"
      ? writeDialogMessageLoadable.contents
      : {
          decyprtedPrompt: undefined,
          openDialog: false,
        };

  React.useEffect(function () {
    // console.log("call useEffect()");

    setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);

    //* Register window resize event.
    window.addEventListener("resize", function () {
      // console.log("call resize()");
      // console.log("window.innerHeight: ", window.innerHeight);
      setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);
    });
  }, []);

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
        {metadata ? (
          <CardMedia
            component="img"
            image={metadata?.image}
            onError={handleCardMediaImageError}
            sx={{
              objectFit: "contain",
              width: "90vw",
              height: cardImageHeight,
            }}
          />
        ) : (
          <Skeleton
            variant="rounded"
            sx={{
              width: "90vw",
              height: cardImageHeight,
            }}
          />
        )}
        <CardContent
          sx={{
            width: "90vw",
          }}
        >
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            # {nftData.tokenId.toString()} /{" "}
            {metadata ? metadata.name : "loading..."} /{" "}
            {metadata ? metadata.description : "loading..."} /{" "}
            {(nftData.rentFee / 10n ** 18n).toString()} matic
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            disabled={isRenting}
            variant="contained"
            onClick={async function () {
              if (dataIsOwnerOrRenter === true) {
                await handleCheckPrompt({
                  setWriteToastMessage: setWriteToastMessage,
                  setWriteDialogMessage: setWriteDialogMessage,
                  isMobile: isMobile,
                  user: user,
                  nftData: nftData,
                  promptNftContract: promptNftContract,
                  dataWalletClient: dataWalletClient,
                  isConnected: isConnected,
                  selectedChain: selectedChain,
                  address: address,
                  mutateUser: mutateUser,
                  signTypedDataAsync: signTypedDataAsync,
                });

                return;
              } else {
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

                //* Rent this nft with rent fee.
                // console.log("nftData.rentFee: ", nftData.rentFee);
                // console.log("nftData.tokenId: ", nftData.tokenId);
                setWriteToastMessage({
                  snackbarSeverity: AlertSeverity.info,
                  snackbarMessage: "Trying to rent this nft...",
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });

                setIsRenting(true);
                writeRentNFT?.();

                setWriteToastMessage({
                  snackbarSeverity: AlertSeverity.info,
                  snackbarMessage:
                    "Rent transaction is just started and wait a moment...",
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });
              }
            }}
          >
            {isRenting ? (
              <Typography>Renting...</Typography>
            ) : (
              <Typography>View Prompt</Typography>
            )}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
