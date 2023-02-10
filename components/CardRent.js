import React from "react";
import { isMobile } from "react-device-detect";
import useSWR from "swr";
import { useRecoilStateLoadable } from "recoil";
import { Base64 } from "js-base64";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import fetchJson from "../lib/fetchJson";
import {
  isWalletConnected,
  decryptData,
  handleLogin,
  AlertSeverity,
  writeToastMessageState,
} from "../lib/util";
import useUser from "../lib/useUser";

function CardRent({
  nftData,
  dataSigner,
  selectedChain,
  address,
  isConnected,
  rentMarketContract,
  promptNftContract,
  signTypedDataAsync,
}) {
  // console.log("call CardRent()");

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  //*---------------------------------------------------------------------------
  //* Define state variables.
  //*---------------------------------------------------------------------------
  const [decryptedPrompt, setDecryptedPrompt] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  //*---------------------------------------------------------------------------
  //* Define hook variables.
  //*---------------------------------------------------------------------------
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
            onClick={async function () {
              if (isWalletConnected({ isConnected, selectedChain }) === false) {
                // console.log("chainName: ", getChainName({ chainId }));
                // setSnackbarSeverity("warning");
                // setSnackbarMessage(
                //   `Change metamask network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`
                // );
                // setOpenSnackbar(true);

                setWriteToastMessage({
                  snackbarSeverity: AlertSeverity.warning,
                  snackbarMessage: `Change metamask network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`,
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });
                return;
              }

              if (isMobile === true) {
                //* Set user login session.
                if (user.isLoggedIn === false) {
                  setWriteToastMessage({
                    snackbarSeverity: AlertSeverity.info,
                    snackbarMessage: "Checking user authentication...",
                    snackbarTime: new Date(),
                    snackbarOpen: true,
                  });

                  try {
                    await handleLogin({
                      mutateUser: mutateUser,
                      address: address,
                      chainId: selectedChain.id,
                      signTypedDataAsync: signTypedDataAsync,
                    });
                  } catch (error) {
                    console.error(error);
                    setWriteToastMessage({
                      snackbarSeverity: AlertSeverity.error,
                      snackbarMessage: `Login error: ${error}`,
                      snackbarTime: new Date(),
                      snackbarOpen: true,
                    });
                    return;
                  }

                  setWriteToastMessage({
                    snackbarSeverity: AlertSeverity.info,
                    snackbarMessage: "Checking is finished.",
                    snackbarTime: new Date(),
                    snackbarOpen: true,
                  });
                }

                //* Get the plain prompt from prompter.
                const body = { tokenId: nftData.tokenId.toNumber() };
                const promptResult = await fetchJson(["/api/prompt"], {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                // console.log("promptResult:", promptResult);

                const decodedPrompt = Base64.decode(
                  promptResult.prompt
                ).toString();
                // console.log("decodedPrompt:", decodedPrompt);

                setDecryptedPrompt(decodedPrompt);
                setOpenDialog(true);
              } else {
                const encryptPromptData = await promptNftContract
                  .connect(dataSigner)
                  .getTokenOwnerPrompt(nftData.tokenId);
                // console.log("encryptPromptData: ", encryptPromptData);

                const encryptData = {
                  ciphertext: encryptPromptData["ciphertext"],
                  ephemPublicKey: encryptPromptData["ephemPublicKey"],
                  nonce: encryptPromptData["nonce"],
                  version: encryptPromptData["version"],
                };
                // console.log("encryptData: ", encryptData);

                const prompt = await decryptData({
                  encryptData: encryptData,
                  decryptAddress: address,
                });
                // console.log("prompt: ", prompt);

                setDecryptedPrompt(prompt);
                setOpenDialog(true);
              }
            }}
          >
            PROMPT
          </Button>
        </CardActions>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Prompt</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {decryptedPrompt}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CardRent;
