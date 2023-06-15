import * as React from "react";
import { ethers } from "ethers";
import { useAccount, useSigner, useContract, useNetwork } from "wagmi";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { isMobile } from "react-device-detect";
import { encrypt } from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import { Base64 } from "js-base64";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

import { isWalletConnected } from "@/lib/util";
import fetchJson from "@/lib/fetchJson";

const MessageSnackbar = dynamic(() => import("./MessageSnackbar"), {
  ssr: false,
});
import promptNFTABI from "../contracts/promptNFT.json";

function Mint({
  inputImageUrl,
  inputPrompt,
  inputNegativePrompt,
  inputModelName,
}) {
  //*----------------------------------------------------------------------------
  //* Define constance variables.
  //*----------------------------------------------------------------------------
  const DEFAULT_MODEL_NAME = "STABLE_DIFFUSION";
  const CARD_MARGIN_BOTTOM = 500;
  const { chains, chain: selectedChain } = useNetwork();
  // console.log("selectedChain: ", selectedChain);
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);
  const { data: signer, isError, isLoading } = useSigner();
  // console.log("signer: ", signer);
  // console.log("isError: ", isError);
  // console.log("isLoading: ", isLoading);
  const promptNftContract = useContract({
    address: process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });
  // console.log("promptNftContract: ", promptNftContract);

  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const THANKS_PAGE = "/thanks/";

  //*---------------------------------------------------------------------------
  //* Handle snackbar.
  //*---------------------------------------------------------------------------
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("info");
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  //*---------------------------------------------------------------------------
  //* Handle text input change.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    inputName: "",
    inputDescription: "",
  });
  const { inputName, inputDescription } = formValue;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValue((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  //*---------------------------------------------------------------------------
  //* Handle metamask.
  //*---------------------------------------------------------------------------
  const router = useRouter();

  //*---------------------------------------------------------------------------
  //* Other variables.
  //*---------------------------------------------------------------------------
  const [imageUrl, setImageUrl] = React.useState("");
  const [promptText, setPromptText] = React.useState("");
  const [modelName, setModelName] = React.useState("");
  const [negativePromptText, setNegativePromptText] = React.useState("");
  const [buttonMessage, setButtonMessage] = React.useState("MINT");
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [cardImageHeight, setCardImageHeight] = React.useState(0);

  React.useEffect(() => {
    console.log("call useEffect()");
    console.log("inputImageUrl: ", inputImageUrl);
    console.log("inputPrompt: ", inputPrompt);
    console.log("inputNegativePrompt: ", inputNegativePrompt);
    console.log("isConnected: ", isConnected);
    console.log("selectedChain: ", selectedChain);
    console.log(
      "isWalletConnected(): ",
      isWalletConnected({ isConnected, selectedChain })
    );

    const initialize = async () => {
      setImageUrl(inputImageUrl || "");
      setPromptText(inputPrompt || "");
      setNegativePromptText(inputNegativePrompt || "");
      setModelName(inputModelName || DEFAULT_MODEL_NAME);

      try {
        if (isWalletConnected({ isConnected, selectedChain }) === false) {
          return;
        }
      } catch (error) {
        console.error(error);
      }
    };

    initialize();

    setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);

    //* Register window resize event.
    window.addEventListener("resize", function () {
      // console.log("call resize()");
      // console.log("window.innerHeight: ", window.innerHeight);
      setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);
    });
  }, [inputImageUrl, inputPrompt, inputNegativePrompt, inputModelName]);

  async function uploadMetadata({ name, description, inputImageUrl }) {
    // console.log("call uploadMetadata()");
    // console.log("inputImageUrl: ", inputImageUrl);
    // console.log("imageUrl: ", imageUrl);

    const response = await axios.post("/api/upload-to-s3", {
      name: name,
      description: description,
      inputImageUrl: inputImageUrl,
    });
    // console.log("response: ", response);
    if (response.data.url) {
      return response.data.url;
    } else {
      return response.data.error;
    }
  }

  async function encryptData({ prompt, negativePrompt }) {
    // console.log("call encryptData()");
    // console.log("prompt: ", prompt);

    //* Make encrypted data with encryption public key from metamask.
    // console.log("address: ", address);
    const encryptionPublicKey = await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [address],
    });
    // console.log("encryptionPublicKey: ", encryptionPublicKey);

    const base64EncryptionPublicKey = Buffer.from(
      encryptionPublicKey,
      "base64"
    );
    // console.log("base64EncryptionPublicKey: ", base64EncryptionPublicKey);

    const encryptPrompt = encrypt({
      publicKey: base64EncryptionPublicKey.toString("base64"),
      data: Base64.encode(prompt).toString(),
      version: "x25519-xsalsa20-poly1305",
    });
    // console.log("enc: ", enc);
    const encryptNegativePrompt = encrypt({
      publicKey: base64EncryptionPublicKey.toString("base64"),
      data: Base64.encode(negativePrompt).toString(),
      version: "x25519-xsalsa20-poly1305",
    });

    return { encryptPrompt, encryptNegativePrompt };
  }

  async function mintPromptNft({
    prompt,
    negativePrompt,
    modelName,
    tokenURI,
    contractOwnerEncryptPromptData,
    contractOwnerEncryptNegativePromptData,
  }) {
    // console.log("call mintPromptNft()");
    // console.log("prompt: ", prompt);
    // console.log("negativePrompt: ", negativePrompt);

    //* Check undefined error.
    if (
      !tokenURI ||
      !contractOwnerEncryptPromptData ||
      !contractOwnerEncryptNegativePromptData
    ) {
      // console.log("tokenURI: ", tokenURI);
      // console.log(
      //   "contractOwnerEncryptPromptData: ",
      //   contractOwnerEncryptPromptData
      // );
      // console.log(
      //   "contractOwnerEncryptNegativePromptData: ",
      //   contractOwnerEncryptNegativePromptData
      // );
      return;
    }

    const {
      encryptPrompt: tokenOwnerEncryptPromptData,
      encryptNegativePrompt: tokenOwnerEncryptNegativePromptData,
    } = await encryptData({
      prompt: prompt,
      negativePrompt: negativePrompt,
    });
    // console.log("tokenOwnerEncryptPromptData: ", tokenOwnerEncryptPromptData);
    // console.log(
    //   "tokenOwnerEncryptNegativePromptData: ",
    //   tokenOwnerEncryptNegativePromptData
    // );

    //* Mint nft with encrypted data.
    // console.log("signerRef.current: ", signerRef.current);
    // console.log("address: ", address);
    let contractSigner;
    if (isMobile) {
    	//* TODO: Change 2 version.
      //* https://docs.walletconnect.com/2.0/advanced/migration-from-v1.x/dapps
      const provider = new WalletConnectProvider({
        rpc: {
          137: "https://rpc-mainnet.maticvigil.com",
          80001: "https://rpc-mumbai.maticvigil.com/",
        },
        infuraId: process.env.NEXT_PUBLIC_INFURA_KEY,
      });

      // * Enable session (triggers QR Code modal).
      await provider.enable();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      // console.log("web3Provider: ", web3Provider);
      contractSigner = web3Provider.getSigner();
      // console.log("signer: ", signer);
    } else {
      contractSigner = signer;
    }
    // console.log("promptNftContract: ", promptNftContract);
    // console.log("contractSigner: ", contractSigner);
    // console.log("address: ", address);
    // console.log("tokenURI: ", tokenURI);
    // console.log("tokenOwnerEncryptPromptData: ", tokenOwnerEncryptPromptData);
    // console.log(
    //   "tokenOwnerEncryptNegativePromptData: ",
    //   tokenOwnerEncryptNegativePromptData
    // );
    // console.log(
    //   "contractOwnerEncryptPromptData: ",
    //   contractOwnerEncryptPromptData
    // );
    // console.log(
    //   "contractOwnerEncryptNegativePromptData: ",
    //   contractOwnerEncryptNegativePromptData
    // );

    //* Add tokenOwnerEncryptNegativePromptData and contractOwnerEncryptNegativePromptData.
    const tx = await promptNftContract
      .connect(contractSigner)
      .safeMint(
        address,
        tokenURI,
        modelName,
        tokenOwnerEncryptPromptData,
        tokenOwnerEncryptNegativePromptData,
        contractOwnerEncryptPromptData,
        contractOwnerEncryptNegativePromptData
      );
    const response = await tx.wait();
    // console.log("response: ", response);

    //* Return token id.
    return response;
  }

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    // console.log("imageUrl: ", imageUrl);

    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

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
              disabled={
                isWalletConnected({ isConnected, selectedChain }) === true &&
                buttonDisabled === false
                  ? false
                  : true
              }
              style={{
                width: "100%",
                paddingRight: "15px",
                marginRight: "15px",
                marginLeft: "15px",
              }}
              onClick={async function () {
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
                  isWalletConnected({ isConnected, selectedChain }) === false
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
                    setButtonDisabled(true);
                    setSnackbarSeverity("warning");
                    setSnackbarMessage("This image prompt is already minted.");
                    setOpenSnackbar(true);
                    return;
                  }
                } catch (error) {
                  console.error(error);
                  setButtonDisabled(true);
                  setSnackbarSeverity("warning");
                  setSnackbarMessage("This image prompt is already minted.");
                  setOpenSnackbar(true);
                  return;
                }

                //* Upload image to s3.
                try {
                  //* Add waiting message to snackbar.
                  //* Upload metadata and image to s3.
                  setButtonDisabled(true);

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
                  // console.log("tokenURI: ", tokenURI);

                  //* Get contract owner encrypted prompt.
                  const fetchResponse = await fetchJson(
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
                  })
                    .then(function (tx) {
                      // console.log("tx: ", tx);
                      // console.log("tx.transactionHash: ", tx.transactionHash);

                      //* Go to thanks page.
                      const imageUrlEncodedString =
                        encodeURIComponent(imageUrl);
                      router.push(`${THANKS_PAGE}${imageUrlEncodedString}`);
                    })
                    .catch(async function (error) {
                      console.error(error);

                      //* If mint failed, revert encrypted prompt to plain prompt(use flag).
                      //* Sync cypto flag and event logs later.
                      const fetchResponse = await fetchJson(
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
                      );

                      //* Show error message in snack bar.
                      setSnackbarSeverity("error");
                      setSnackbarMessage(error.toString());
                      setOpenSnackbar(true);

                      //* Make mint button disabled.
                      setButtonMessage("MINT");
                      setButtonDisabled(false);
                    });

                  setButtonMessage(<CircularProgress />);
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              <Typography>{buttonMessage}</Typography>
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
}

export default Mint;
