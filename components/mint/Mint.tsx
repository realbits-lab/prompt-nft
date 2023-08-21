import * as React from "react";
import {
  useAccount,
  useWalletClient,
  useNetwork,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { encrypt } from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import { Base64 } from "js-base64";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios";
import { isWalletConnected } from "@/lib/util";
import fetchJson from "@/lib/fetchJson";
import promptNFTABI from "@/contracts/promptNFT.json";
//*----------------------------------------------------------------------------
//* Define constance variables.
//*----------------------------------------------------------------------------
const PROMPT_NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;
const CARD_MARGIN_BOTTOM = 500;

const MessageSnackbar = dynamic(() => import("../MessageSnackbar"), {
  ssr: false,
});

interface Props {
  inputImageUrl: any;
  inputPrompt: any;
  inputNegativePrompt: any;
  inputModelName: any;
}

const Mint = ({
  inputImageUrl,
  inputPrompt,
  inputNegativePrompt,
  inputModelName,
}: Props) => {
  const { chains, chain: selectedChain } = useNetwork();
  // console.log("selectedChain: ", selectedChain);
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);
  const { data: signer, isError, isLoading } = useWalletClient();
  // console.log("signer: ", signer);
  // console.log("isError: ", isError);
  // console.log("isLoading: ", isLoading);
  const [isMinting, setIsMinting] = React.useState(false);

  // const promptNftContract = useContract({
  //   address: process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
  //   abi: promptNFTABI.abi,
  // });
  const {
    data: dataSafeMint,
    error: errorSafeMint,
    isError: isErrorSafeMint,
    isIdle: isIdleSafeMint,
    isLoading: isLoadingSafeMint,
    isSuccess: isSuccessSafeMint,
    write: writeSafeMint,
    status: statusSafeMint,
  } = useContractWrite({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI.abi,
    functionName: "safeMint",
  });

  const {
    data: dataSafeMintTx,
    isError: isErrorSafeMintTx,
    isLoading: isLoadingSafeMintTx,
  } = useWaitForTransaction({
    hash: dataSafeMint?.hash,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      //* TODO: Remove moim post.

      //* Go to thanks page.
      const imageUrlEncodedString = encodeURIComponent(imageUrl);
      router.push(`${THANKS_PAGE}${imageUrlEncodedString}`);
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);

      console.error(error);

      //* If mint failed, revert encrypted prompt to plain prompt(use flag).
      //* Sync cypto flag and event logs later.
      fetchJson(
        { url: "/api/uncrypt" },
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageUrl,
          }),
        }
      ).then((fetchResponse) => {
        setSnackbarSeverity("error");
        setSnackbarMessage(error.toString());
        setOpenSnackbar(true);
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
      setIsMinting(false);
    },
  });

  const handleClickMintBUtton = async () => {
    // console.log("call onClick()");

    setSnackbarSeverity("info");
    setSnackbarMessage("Checking image files...");
    setOpenSnackbar(true);

    //* Check name field is empty.
    if (inputName === "") {
      setSnackbarSeverity("warning");
      setSnackbarMessage("Input NFT name.");
      setOpenSnackbar(true);
      return;
    }

    //* Check description field is empty.
    if (inputDescription === "") {
      setSnackbarSeverity("warning");
      setSnackbarMessage("Input NFT description.");
      setOpenSnackbar(true);
      return;
    }

    //* Check wallet is connected.
    if (
      isWalletConnected({
        isConnected,
        selectedChain,
      }) === false
    ) {
      setSnackbarSeverity("warning");
      setSnackbarMessage(
        "No wallet connection. Please connect wallet."
      );
      setOpenSnackbar(true);

      return;
    }

    //* Check image url is already minted with crypt flag.
    try {
      const checkCryptResponse = await fetchJson(
        { url: "/api/check-crypt" },
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputImageUrl: imageUrl,
          }),
        }
      );
      // console.log("checkCryptResponse: ", checkCryptResponse);
      if (checkCryptResponse.data === "ok") {
        setSnackbarSeverity("warning");
        setSnackbarMessage("This image prompt is already minted.");
        setOpenSnackbar(true);
        return;
      }
    } catch (error) {
      console.error(error);
      setSnackbarSeverity("warning");
      setSnackbarMessage("This image prompt is already minted.");
      setOpenSnackbar(true);
      return;
    }

    setSnackbarSeverity("info");
    setSnackbarMessage(
      "Uploading image data to metadata repository..."
    );
    setOpenSnackbar(true);

    const tokenURI = await uploadMetadata({
      name: inputName,
      description: inputDescription,
      inputImageUrl: imageUrl,
    });
    console.log("tokenURI: ", tokenURI);

    let fetchResponse;
    try {
      //* Get contract owner encrypted prompt.
      fetchResponse = await fetchJson(
        { url: "/api/crypt" },
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageUrl,
            prompt: promptText,
            negativePrompt: negativePromptText,
          }),
        }
      );
      // console.log("fetchResponse: ", fetchResponse);
    } catch (error) {
      console.error(error);
    }

    //* Mint prompt NFT.
    setSnackbarSeverity("info");
    setSnackbarMessage(
      "Minting a prompt nft is just started. Please wait about 30 seconds for transaction. Even if you close this window, transaction will be going on."
    );
    setOpenSnackbar(true);

    mintPromptNft({
      prompt: promptText,
      negativePrompt: negativePromptText,
      modelName: modelName,
      tokenURI: tokenURI,
      contractOwnerEncryptPromptData:
        fetchResponse.contractOwnerEncryptPromptData,
      contractOwnerEncryptNegativePromptData:
        fetchResponse.contractOwnerEncryptNegativePromptData,
    });
  };

  return (
    <div>
      <Box
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
      >
        <Card>
          {inputImageUrl ? (
            <CardMedia
              component="img"
              image={imageUrl}
              onError={handleCardMediaImageError}
              sx={{
                objectFit: "contain",
                height: cardImageHeight,
              }}
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="50vh"
              sx={{ height: "50vh" }}
            >
              <CircularProgress />
            </Box>
          )}
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <TextField
              required
              error={inputName === "" ? true : false}
              id="outlined-required"
              label="Name"
              name="inputName"
              value={inputName}
              onChange={handleChange}
              InputProps={{ style: { fontSize: 12 } }}
              style={{
                width: "100%",
                paddingRight: "15px",
              }}
              helperText="Input name."
            />
            <TextField
              required
              error={inputDescription === "" ? true : false}
              id="outlined-required"
              label="Description"
              name="inputDescription"
              value={inputDescription}
              onChange={handleChange}
              InputProps={{ style: { fontSize: 12 } }}
              style={{
                width: "100%",
                paddingRight: "15px",
              }}
              helperText="Input description."
            />
            <TextField
              required
              id="outlined-required"
              label="Prompt"
              name="prompt"
              value={promptText}
              inputProps={{ readOnly: true, style: { fontSize: 12 } }}
              style={{
                width: "100%",
                paddingRight: "15px",
              }}
            />
            <TextField
              required
              id="outlined-required"
              label="Negative Prompt"
              name="negative-prompt"
              value={negativePromptText}
              inputProps={{ readOnly: true, style: { fontSize: 12 } }}
              style={{
                width: "100%",
                paddingRight: "15px",
              }}
            />
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              disabled={isMinting}
              // disabled={
              //   isWalletConnected({ isConnected, selectedChain }) === true &&
              //   buttonDisabled === false
              //     ? false
              //     : true
              // }
              style={{
                width: "100%",
                paddingRight: "15px",
                marginRight: "15px",
                marginLeft: "15px",
              }}
              onClick={handleClickMintBUtton}
            >
              {isMinting ? (
                <Typography>Minting...</Typography>
              ) : (
                <Typography>Mint</Typography>
              )}
            </Button>
          </CardActions>
        </Card>
      </Box>

      <MessageSnackbar
        open={openSnackbar}
        autoHideDuration={10000}
        onClose={handleCloseSnackbar}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />
    </div>
  );
};

export default Mint;
