import React from "react";
import { isMobile } from "react-device-detect";
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
  AlertSeverity,
  writeToastMessageState,
  writeDialogMessageState,
  handleCheckPrompt,
} from "../lib/util";
import useUser from "../lib/useUser";

function CardOwn({
  nftData,
  dataWalletClient,
  selectedChain,
  address,
  isConnected,
  rentMarketContract,
  promptNftContract,
  signTypedDataAsync,
}) {
  // console.log("call CardOwn()");
  // console.log("nftData: ", nftData);

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
    signer: dataWalletClient,
    tokenId: nftData?.tokenId,
  });
  // console.log("metadataData: ", metadataData);

  const { user, mutateUser } = useUser();
  // const {
  //   data: dataSignTypedData,
  //   isError: isErrorSignTypedData,
  //   isLoading: isLoadingSignTypedData,
  //   isSuccess: isSuccessSignTypedData,
  //   signTypedData,
  //   signTypedDataAsync,
  // } = useSignTypedData({
  //   domain: domain,
  //   types: types,
  //   value: value,
  // });

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

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
            token id: {nftData?.tokenId.toString()}
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
            rent fee: {(nftData?.rentFee / 10n ** 18n).toString()} matic
          </Typography>
        </CardContent>
        <CardActions>
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
                dataWalletClient: dataWalletClient,
                isConnected: isConnected,
                selectedChain: selectedChain,
                address: address,
                mutateUser: mutateUser,
                signTypedDataAsync: signTypedDataAsync,
              });
            }}
          >
            PROMPT
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

export default CardOwn;
