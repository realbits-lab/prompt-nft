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
import CardOwn from "./CardOwn";

function ListOwn({ allMyOwnDataArray, pageIndex }) {
  // console.log("call OwnCardList()");
  // console.log("allMyOwnDataCount: ", allMyOwnDataCount);
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const NUMBER_PER_PAGE = 5;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  if (allMyOwnDataArray.length === 0) {
    return <NoContentPage message={"You do not have any image prompt NFT."} />;
  }

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
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

  return allMyOwnDataArray.map((nftData, idx) => {
    // console.log("nftData: ", nftData);
    // console.log("idx: ", idx);
    // console.log("pageIndex: ", pageIndex);
    // Check idx is in pagination.
    // pageIndex.own starts from 1.
    // idx starts from 0.
    if (
      idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
      idx < pageIndex * NUMBER_PER_PAGE
    ) {
      return <CardOwn nftData={nftData} />;
      return (
        <Box sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }} key={idx}>
          <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
            <CardMedia
              component="img"
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
  });
}

export default ListOwn;
