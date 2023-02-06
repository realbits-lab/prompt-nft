import React from "react";
import { useSigner, useContract } from "wagmi";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import promptNFTABI from "../contracts/promptNFT.json";
import rentmarketABI from "../contracts/rentMarket.json";
import { FetchType } from "../lib/fetchJson";

function CardNft({ nftData }) {
  console.log("call CardNft()");

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  //*---------------------------------------------------------------------------
  //* Define hook variables.
  //*---------------------------------------------------------------------------
  const {
    data: dataSigner,
    isError: isErrorSigner,
    isLoading: isLoadingSigner,
  } = useSigner();

  const promptNftContract = useContract({
    address: process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });

  const rentMarketContract = useContract({
    address: process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI["abi"],
  });

  const {
    data: metadataData,
    error: metadataError,
    isValidating: metadataIsValidating,
  } = useSWR([
    "getMetadata",
    FetchType.PROVIDER,
    promptNftContract,
    dataSigner,
    nftData.tokenId,
  ]);

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  return (
    <Box sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }}>
      <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
        <CardMedia
          component="img"
          image={metadataData ? metadataData.image : ""}
          onError={handleCardMediaImageError}
        />
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
              if (mode === "own" && isWalletConnected() === false) {
                // console.log("chainName: ", getChainName({ chainId }));
                setSnackbarSeverity("warning");
                setSnackbarMessage(
                  `Change metamask network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`
                );
                setOpenSnackbar(true);
                return;
              }

              if (isMobile === true) {
                //* Set user login session.
                if (user.isLoggedIn === false) {
                  try {
                    await handleLogin({
                      mutateUser: mutateUser,
                      address: address,
                      chainId: selectedChain.id,
                    });
                  } catch (error) {
                    console.error(error);
                    setSnackbarSeverity("error");
                    setSnackbarMessage(`Login error: ${error}`);
                    setOpenSnackbar(true);
                    return;
                  }
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
    </Box>
  );
}

export default CardNft;
