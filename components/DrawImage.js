import * as React from "react";
import { useRouter } from "next/router";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import {
  useAccount,
  useSigner,
  useContract,
  useContractRead,
  useSignTypedData,
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWatchPendingTransactions,
} from "wagmi";
import Image from "mui-image";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import rentmarketABI from "@/contracts/rentMarket.json";

const ethUtil = require("ethereumjs-util");

export default function DrawImage() {
  const DRAW_API_URL = "/api/draw";
  const POST_API_URL = "/api/post";
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MARGIN_TOP = "60px";
  const CARD_MIN_WIDTH = 375;
  const CARD_MAX_WIDTH = 420;
  const CARD_PADDING = 1;
  const DISCORD_BOT_TOKEN = process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN;
  const IMAGE_PADDING = 400;
  const [imageUrl, setImageUrl] = React.useState("");
  const [loadingImage, setLoadingImage] = React.useState(false);
  const [imageHeight, setImageHeight] = React.useState(0);
  const router = useRouter();
  const MARGIN_TOP = "40px";

  //*---------------------------------------------------------------------------
  //* Wagmi hook.
  //*---------------------------------------------------------------------------
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);
  const {
    data: dataSigner,
    isError: isErrorSigner,
    isLoading: isLoadingSigner,
  } = useSigner();

  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const {
    data: swrDataAllRentData,
    isError: swrErrorAllRentData,
    isLoading: swrIsLoadingAllRentData,
    isValidating: swrIsValidatingAllRentData,
    status: swrStatusAllRentData,
    refetch: swrRefetchAllRentData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllRentData",
    cacheOnBlock: true,
    cacheTime: 60_000,
    watch: false,
  });
  const {
    data: swrDataRentData,
    isError: swrErrorRentData,
    isLoading: swrIsLoadingRentData,
    isValidating: swrIsValidatingRentData,
    status: swrStatusRentData,
    refetch: swrRefetchRentData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getRegisterData",
    cacheOnBlock: true,
    cacheTime: 60_000,
    watch: false,
    args: [
      process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS,
      process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN,
    ],
  });
  const [rentPaymentNft, setRentPaymentNft] = React.useState(false);

  //* Wait for transactions.
  const { config: configRentNFT, error: errorRentNFT } =
    usePrepareContractWrite({
      address: RENT_MARKET_CONTRACT_ADDRES,
      abi: rentmarketABI.abi,
      functionName: "rentNFT",
      args: [
        process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS,
        process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN,
        process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS,
      ],
      // overrides: { value: nftData.rentFee },
    });
  const {
    data: dataRentNFT,
    isLoading: isLoadingRentNFT,
    isSuccess: isSuccessRentNFT,
    write: writeRentNFT,
  } = useContractWrite(configRentNFT);
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
      // setWriteToastMessage({
      //   snackbarSeverity: AlertSeverity.info,
      //   snackbarMessage: "Renting is finished.",
      //   snackbarTime: new Date(),
      //   snackbarOpen: true,
      // });
      // setIsRenting(false);
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
      // console.log("readRentingData: ", readRentingData);
    },
  });

  //* Get pending transactions.
  useWatchPendingTransactions({
    listener: function (tx) {
      // console.log("tx: ", tx);
    },
  });

  //*---------------------------------------------------------------------------
  //* Handle text input change.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    prompt: "",
    negativePrompt: "",
    modelName: "",
  });
  const { prompt, negativePrompt, modelName } = formValue;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValue((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  React.useEffect(
    function () {
      console.log("call useEffect()");

      //* Check user has rented the payment nft.
      if (swrDataAllRentData) {
        swrDataAllRentData.map(function (rentData) {
          if (
            ethUtil.toChecksumAddress(rentData.renteeAddress) ===
            ethUtil.toChecksumAddress(address)
          ) {
            setRentPaymentNft(true);
          }
        });
      }

      setImageHeight(window.innerHeight - IMAGE_PADDING);

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    },
    [swrDataAllRentData]
  );

  function handleResize() {
    setImageHeight(window.innerHeight - IMAGE_PADDING);
  }

  async function fetchImage() {
    setLoadingImage(true);

    //* Make stable diffusion api option by json.
    const jsonData = {
      prompt: prompt,
      negative_prompt: negativePrompt,
    };

    const fetchResponse = await fetch(DRAW_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });
    // console.log("fetchResponse: ", fetchResponse);

    //* Check error response.
    if (fetchResponse.status !== 200) {
      console.error("jsonResponse.status is not success.");
      setLoadingImage(false);
      return;
    }

    //* Get the stable diffusion api result by json.
    const jsonResponse = await fetchResponse.json();
    // console.log("jsonResponse: ", jsonResponse);
    const imageUrlResponse = jsonResponse.imageUrl[0];
    const meta = jsonResponse.meta;
    console.log("imageUrlResponse: ", imageUrlResponse);
    console.log("meta.negative_prompt: ", meta.negative_prompt);
    console.log("meta.prompt: ", meta.prompt);
    console.log("meta.model: ", meta.model);

    //* Change prompt, negativePrompt, modelName.
    let event = {};
    event.target = { name: "prompt", value: meta.prompt };
    handleChange(event);
    event.target = { name: "negativePrompt", value: meta.negative_prompt };
    handleChange(event);
    event.target = { name: "modelName", value: meta.model };
    handleChange(event);

    //* Post imageUrlResponse and prompt to prompt server.
    const imageUploadResponse = await fetch(POST_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: meta.prompt,
        negativePrompt: meta.negative_prompt,
        imageUrl: imageUrlResponse,
        discordBotToken: DISCORD_BOT_TOKEN,
      }),
    });
    console.log("imageUploadResponse: ", imageUploadResponse);

    if (imageUploadResponse.status !== 200) {
      console.error(`imageUploadResponse: ${imageUploadResponse}`);
      setLoadingImage(false);
      return;
    }

    //* Set image url from image generation server.
    setImageUrl(imageUrlResponse);
    setLoadingImage(false);
  }

  function buildWalletLoginPage() {
    return (
      <>
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
          <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
            <CardMedia component="img" image={PLACEHOLDER_IMAGE_URL} />
            <CardContent
              sx={{
                padding: "10",
              }}
            >
              <Typography variant="h7">
                You should connect wallet with metamask or other wallet. Click
                the upper "Connect Wallet" button.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </>
    );
  }

  function buildLoadingPage() {
    console.log("call buildLoadingPage()");

    return (
      <>
        <Typography>Loading ...</Typography>
      </>
    );
  }

  function buildDrawPage() {
    console.log("call buildDrawPage()");
    console.log("swrDataAllRentData: ", swrDataAllRentData);

    if (rentPaymentNft) {
      return (
        <>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            display="flex"
            flexDirection="column"
          >
            <TextField
              required
              id="outlined-required"
              label="prompt"
              error={prompt === "" ? true : false}
              name="prompt"
              value={prompt}
              onChange={handleChange}
              style={{
                width: "80vw",
              }}
              disabled={loadingImage}
              autoComplete="on"
            />
            <TextField
              required
              id="outlined-required"
              label="negative prompt"
              error={negativePrompt === "" ? true : false}
              name="negativePrompt"
              value={negativePrompt}
              onChange={handleChange}
              style={{
                width: "80vw",
              }}
              disabled={loadingImage}
              autoComplete="on"
            />
            <Button
              variant="contained"
              onClick={fetchImage}
              sx={{
                m: 1,
              }}
              disabled={loadingImage}
            >
              Draw
            </Button>
          </Box>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            {loadingImage ? (
              <Box
                height={imageHeight}
                display="flex"
                flexDirection="row"
                alignItems="center"
              >
                <CircularProgress size={imageHeight * 0.4} />
              </Box>
            ) : (
              <Image
                src={imageUrl}
                height={imageHeight}
                fit="contain"
                duration={100}
                easing="ease"
                shiftDuration={100}
              />
            )}
            <Button
              variant="contained"
              onClick={() => {
                //* Get URI encoded string.
                const imageUrlEncodedString = encodeURIComponent(imageUrl);
                const promptEncodedString = encodeURIComponent(prompt);
                const negativePromptEncodedString =
                  encodeURIComponent(negativePrompt);
                const link = `/mint/${promptEncodedString}/${imageUrlEncodedString}/${negativePromptEncodedString}`;
                router.push(link);
              }}
              sx={{
                width: "80vw",
                marginTop: 1,
              }}
              disabled={loadingImage}
            >
              Mint
            </Button>
          </Box>
        </>
      );
    } else {
      return (
        <>
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
            <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
              <CardMedia component="img" image={PLACEHOLDER_IMAGE_URL} />
              <CardContent
                sx={{
                  padding: "10",
                }}
              >
                <Typography variant="h7">
                  You should rent this nft for drawing image.
                </Typography>
                <Button
                  onClick={function () {
                    console.log("writeRentNFT: ", writeRentNFT);
                    console.log("swrDataRentData: ", swrDataRentData);
                    const rentFee = swrDataRentData.rentFee;
                    console.log("rentFee: ", rentFee);

                    if (writeRentNFT && swrDataRentData) {
                      if (
                        ethUtil.toChecksumAddress(
                          swrDataRentData[0].nftAddress
                        ) ===
                          ethUtil.toChecksumAddress(
                            process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS
                          ) &&
                        swrDataRentData[0].tokenId ===
                          process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN
                      ) {
                        console.log("try to call writeRentNFT()");
                        writeRentNFT?.({
                          value: parseEther(rentFee),
                        });
                      }
                    }
                  }}
                >
                  Rent NFT
                </Button>
              </CardContent>
            </Card>
          </Box>
        </>
      );
    }
  }

  return (
    <>
      <Grid
        container
        spacing={2}
        justifyContent="end"
        sx={{ marginTop: MARGIN_TOP }}
      >
        <Grid item>
          <Web3Button />
        </Grid>
        <Grid item>
          <Web3NetworkSwitch />
        </Grid>
      </Grid>
      {isConnected === false
        ? buildWalletLoginPage()
        : swrDataAllRentData
        ? buildDrawPage()
        : buildLoadingPage()}
    </>
  );
}
