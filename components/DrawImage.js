import React from "react";
import { useRouter } from "next/router";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import dynamic from "next/dynamic";
import { useRecoilStateLoadable } from "recoil";
import {
  useAccount,
  useNetwork,
  useContractRead,
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
import fetchJson, { FetchError } from "@/lib/fetchJson";
import useUser from "@/lib/useUser";
import { handleSignMessage, handleAuthenticate } from "@/components/User";
import { sleep, writeToastMessageState, AlertSeverity } from "@/lib/util";
const MessageSnackbar = dynamic(() => import("./MessageSnackbar"), {
  ssr: false,
});

export default function DrawImage() {
  // console.log("call DrawImage()");

  const DEFAULT_MODEL_NAME = "runwayml/stable-diffusion-v1-5";
  const DRAW_API_URL = "/api/draw";
  const POST_API_URL = "/api/post";
  const UPLOAD_IMAGE_TO_S3_URL = "/api/upload-image-to-s3";
  const FETCH_RESULT_API_URL = "/api/fetch-result";
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const DISCORD_BOT_TOKEN = process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN;
  const CARD_MARGIN_TOP = "60px";
  const CARD_MIN_WIDTH = 375;
  const CARD_MAX_WIDTH = 420;
  const CARD_PADDING = 1;
  const IMAGE_PADDING = 450;
  const { user, mutateUser } = useUser();
  const [imageUrl, setImageUrl] = React.useState("");
  const [loadingImage, setLoadingImage] = React.useState(false);
  const [imageHeight, setImageHeight] = React.useState(0);
  const router = useRouter();
  const MARGIN_TOP = "60px";

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
    prompt: "",
    negativePrompt: "",
    modelName: DEFAULT_MODEL_NAME,
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

  //*---------------------------------------------------------------------------
  //* Wagmi hook.
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PAYMENT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS;
  const PAYMENT_NFT_TOKEN_ID = process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN;
  const SERVICE_ACCOUNT_ADDRESS =
    process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS;
  const { address, isConnected } = useAccount();
  const { chains, chain: selectedChain } = useNetwork();
  const [paymentNftRentFee, setPaymentNftRentFee] = React.useState();
  const [currentTimestamp, setCurrentTimestamp] = React.useState();
  const [imageFetchEndTime, setImageFetchEndTime] = React.useState();
  const [paymentNftRentEndTime, setPaymentNftRentEndTime] = React.useState();

  const {
    data: dataAllRentData,
    isError: errorAllRentData,
    isLoading: isLoadingAllRentData,
    isValidating: isValidatingAllRentData,
    status: statusAllRentData,
    refetch: refetchAllRentData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllRentData",
    // cacheOnBlock: true,
    // cacheTime: 60_000,
    // watch: false,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      data.map(function (rentData) {
        // console.log("rentData: ", rentData);
        if (
          rentData.renteeAddress.toLowerCase() === address?.toLowerCase() &&
          rentData.nftAddress.toLowerCase() ===
            PAYMENT_NFT_CONTRACT_ADDRESS.toLowerCase() &&
          Number(rentData.tokenId) === Number(PAYMENT_NFT_TOKEN_ID)
        ) {
          const rentEndTime =
            Number(rentData.rentStartTimestamp) + Number(rentData.rentDuration);
          // console.log("rentEndTime: ", rentEndTime);
          setPaymentNftRentEndTime(rentEndTime);
        }
      });
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
    data: dataRentData,
    isError: errorRentData,
    isLoading: isLoadingRentData,
    isValidating: isValidatingRentData,
    status: statusRentData,
    refetch: refetchRentData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getRegisterData",
    args: [PAYMENT_NFT_CONTRACT_ADDRESS, PAYMENT_NFT_TOKEN_ID],
    // cacheOnBlock: true,
    // cacheTime: 60_000,
    // watch: false,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
      // console.log("rentFee: ", Number(data.rentFee) / Math.pow(10, 18));
      setPaymentNftRentFee(Number(data.rentFee) / Math.pow(10, 18));
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

  const { config: configPrepareRentNFT, error: errorPrepareRentNFT } =
    usePrepareContractWrite({
      address: RENT_MARKET_CONTRACT_ADDRES,
      abi: rentmarketABI.abi,
      functionName: "rentNFT",
      args: [
        PAYMENT_NFT_CONTRACT_ADDRESS,
        PAYMENT_NFT_TOKEN_ID,
        SERVICE_ACCOUNT_ADDRESS,
      ],
      enabled: false,
      onError(error) {
        // console.log("call onError()");
        // console.log("error: ", error);
      },
      onMutate(args, overrides) {
        // console.log("call onMutate()");
        // console.log("args: ", args);
        // console.log("overrides: ", overrides);
      },
      onSettled(data, error) {
        // console.log("call onSettled()");
        // console.log("data: ", data);
        // console.log("error: ", error);
      },
      onSuccess(data) {
        // console.log("call onSuccess()");
        // console.log("data: ", data);
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
      PAYMENT_NFT_CONTRACT_ADDRESS,
      PAYMENT_NFT_TOKEN_ID,
      SERVICE_ACCOUNT_ADDRESS,
    ],
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.success,
        snackbarMessage:
          "Rent transaction is just started and wait a moment...",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onError(error) {
      // console.log("call onSuccess()");
      // console.log("error: ", error);
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: `${error}`,
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  const {
    data: dataRentNFTTx,
    isError: isErrorRentNFTTx,
    isLoading: isLoadingRentNFTTx,
  } = useWaitForTransaction({
    hash: dataRentNFT?.hash,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      updateUserData()
        .then(() => {
          setWriteToastMessage({
            snackbarSeverity: AlertSeverity.success,
            snackbarMessage: "Renting is finished successfully.",
            snackbarTime: new Date(),
            snackbarOpen: true,
          });
        })
        .catch((error) => {
          setWriteToastMessage({
            snackbarSeverity: AlertSeverity.error,
            snackbarMessage: "Updating user data is falied.",
            snackbarTime: new Date(),
            snackbarOpen: true,
          });
        });
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: "Renting is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  useWatchPendingTransactions({
    listener: function (tx) {
      // console.log("tx: ", tx);
    },
  });

  async function updateUserData() {
    // console.log("call updateUserData()");

    const body = { publicAddress: address };
    try {
      mutateUser(
        await fetchJson(
          { url: "/api/login" },
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        )
      );
    } catch (error) {
      if (error instanceof FetchError) {
        console.error(error.data.message);
      } else {
        console.error("An unexpected error happened:", error);
      }

      throw error;
    }
  }

  //* Initialize.
  React.useEffect(function () {
    // console.log("call useEffect()");

    momentDurationFormatSetup(moment);

    setImageHeight(window.innerHeight - IMAGE_PADDING);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  //* TODO: No reload.
  // useInterval(() => {
  //   console.log("call useInterval()");

  //   const timestamp = Math.floor(Date.now() / 1000);
  //   // console.log("timestamp: ", timestamp);
  //   setCurrentTimestamp((previousTimestamp) => timestamp);
  // }, 1000);

  function useInterval(callback, delay) {
    const savedCallback = React.useRef();

    React.useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    React.useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  function handleResize() {
    setImageHeight(window.innerHeight - IMAGE_PADDING);
  }

  async function fetchImage() {
    let inputPrompt = prompt;
    let inputNegativePrompt = negativePrompt;
    let inputModelName = modelName;

    setLoadingImage(true);

    if (!prompt || prompt === "") {
      setSnackbarSeverity("warning");
      setSnackbarMessage("Prompt is empty.");
      setOpenSnackbar(true);

      setLoadingImage(false);

      return;
    }

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
      console.error("fetchResponse.status is not 200.");
      setSnackbarSeverity("warning");
      setSnackbarMessage("Drawing image failed.");
      setOpenSnackbar(true);

      setLoadingImage(false);

      return;
    }

    //* Get the stable diffusion api result by json.
    const jsonResponse = await fetchResponse.json();
    // console.log("jsonResponse: ", jsonResponse);

    //* Check error response.
    if (
      jsonResponse.status !== "processing" &&
      jsonResponse.status !== "success"
    ) {
      console.error("jsonResponse.status is not processing or success.");

      setSnackbarSeverity("warning");
      setSnackbarMessage("Drawing image failed.");
      setOpenSnackbar(true);

      setLoadingImage(false);

      return;
    }

    //* Handle fetch result.
    let imageUrlResponse;
    if (jsonResponse.status === "processing") {
      const eta = jsonResponse.eta;
      const timestamp = Math.floor(Date.now() / 1000);
      setImageFetchEndTime(timestamp + eta);

      await sleep((eta + 1) * 1000);
      setImageFetchEndTime(undefined);

      const fetchJsonData = {
        id: jsonResponse.id,
      };
      const fetchResultResponse = await fetch(FETCH_RESULT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fetchJsonData),
      });

      //* Check error response.
      if (fetchResultResponse.status !== 200) {
        console.error("jsonResponse.status is not success.");

        setSnackbarSeverity("warning");
        setSnackbarMessage("Fetching image failed.");
        setOpenSnackbar(true);

        setLoadingImage(false);
        return;
      }

      //* Get the stable diffusion api result by json.
      const jsonResponse = await fetchResultResponse.json();
      // console.log("jsonResponse: ", jsonResponse);

      //* Set image url.
      imageUrlResponse = jsonResponse.output[0];
    }

    if (jsonResponse.status === "success") {
      imageUrlResponse = jsonResponse.imageUrl[0];
      const meta = jsonResponse.meta;
      // console.log("imageUrlResponse: ", imageUrlResponse);
      // console.log("meta.negative_prompt: ", meta.negative_prompt);
      // console.log("meta.prompt: ", meta.prompt);
      // console.log("meta.model: ", meta.model);

      //* Change prompt, negativePrompt, modelName.
      let event = {};
      event.target = { name: "prompt", value: meta.prompt };
      handleChange(event);
      event.target = { name: "negativePrompt", value: meta.negative_prompt };
      handleChange(event);
      event.target = { name: "modelName", value: meta.model };
      handleChange(event);

      inputPrompt = meta.prompt;
      inputNegativePrompt = meta.negative_prompt;
      inputModelName = meta.model;
    }

    setImageUrl(imageUrlResponse);
    setLoadingImage(false);
    return;

    //* Upload image to S3.
    const uploadImageJsonData = {
      imageUrl: imageUrlResponse,
    };
    let responseUploadImageToS3;
    try {
      responseUploadImageToS3 = await fetch(UPLOAD_IMAGE_TO_S3_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadImageJsonData),
      });
    } catch (error) {
      console.error(`responseUploadImageToS3: ${responseUploadImageToS3}`);

      setSnackbarSeverity("warning");
      setSnackbarMessage(`Image url(${imageUrlResponse}) is invalid.`);
      setOpenSnackbar(true);

      setLoadingImage(false);
      return;
    }

    if (responseUploadImageToS3.status !== 200) {
      console.error(`responseUploadImageToS3: ${responseUploadImageToS3}`);

      setSnackbarSeverity("warning");
      setSnackbarMessage("S3 upload failed.");
      setOpenSnackbar(true);

      setLoadingImage(false);
      return;
    }
    const imageUploadJsonResponse = await responseUploadImageToS3.json();
    // console.log("imageUploadJsonResponse: ", imageUploadJsonResponse);

    //* Post image and prompt to prompt server.
    const imageUploadResponse = await fetch(POST_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: inputPrompt,
        negativePrompt: inputNegativePrompt,
        imageUrl: imageUploadJsonResponse.url,
        discordBotToken: DISCORD_BOT_TOKEN,
      }),
    });
    // console.log("imageUploadResponse: ", imageUploadResponse);

    if (imageUploadResponse.status !== 200) {
      console.error(`imageUploadResponse: ${imageUploadResponse}`);

      setSnackbarSeverity("warning");
      setSnackbarMessage(`Image upload response error: ${imageUploadResponse}`);
      setOpenSnackbar(true);

      setLoadingImage(false);

      return;
    }

    //* Set image url from image generation server.
    setImageUrl(imageUploadJsonResponse.url);
    setLoadingImage(false);
  }

  async function postImage({ postImageUrl, inputPrompt, inputNegativePrompt }) {
    //* Upload image to S3.
    const uploadImageJsonData = {
      imageUrl: postImageUrl,
    };
    let responseUploadImageToS3;
    try {
      responseUploadImageToS3 = await fetch(UPLOAD_IMAGE_TO_S3_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadImageJsonData),
      });
    } catch (error) {
      console.error(`responseUploadImageToS3: ${responseUploadImageToS3}`);

      setSnackbarSeverity("warning");
      setSnackbarMessage(`Image url(${imageUrlResponse}) is invalid.`);
      setOpenSnackbar(true);

      setLoadingImage(false);
      return;
    }

    if (responseUploadImageToS3.status !== 200) {
      console.error(`responseUploadImageToS3: ${responseUploadImageToS3}`);

      setSnackbarSeverity("warning");
      setSnackbarMessage("S3 upload failed.");
      setOpenSnackbar(true);

      setLoadingImage(false);
      return;
    }
    const imageUploadJsonResponse = await responseUploadImageToS3.json();
    // console.log("imageUploadJsonResponse: ", imageUploadJsonResponse);

    //* Post image and prompt to prompt server.
    const imageUploadResponse = await fetch(POST_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: inputPrompt,
        negativePrompt: inputNegativePrompt,
        imageUrl: imageUploadJsonResponse.url,
        discordBotToken: DISCORD_BOT_TOKEN,
      }),
    });
    // console.log("imageUploadResponse: ", imageUploadResponse);

    if (imageUploadResponse.status !== 200) {
      console.error(`imageUploadResponse: ${imageUploadResponse}`);

      setSnackbarSeverity("warning");
      setSnackbarMessage(`Image upload response error: ${imageUploadResponse}`);
      setOpenSnackbar(true);

      setLoadingImage(false);

      return;
    }

    //* Set image url from image generation server.
    setImageUrl(imageUploadJsonResponse.url);
    setLoadingImage(false);
  }

  function WalletConnectPage() {
    return (
      <>
        <Box
          sx={{
            marginTop: "200px",
          }}
        >
          <Typography variant="h3">Connect Wallet</Typography>
        </Box>
      </>
    );
  }

  function WalletLoginPage() {
    return (
      <>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{ marginTop: "50px" }}
        >
          <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
            <CardMedia
              component="img"
              image={PLACEHOLDER_IMAGE_URL}
              height={"200px"}
            />
            <CardContent
              sx={{
                padding: "10",
              }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={async () => {
                  if (!address) {
                    setWriteToastMessage({
                      snackbarSeverity: AlertSeverity.warning,
                      snackbarMessage: "Wallet is not connected.",
                      snackbarTime: new Date(),
                      snackbarOpen: true,
                    });
                    return;
                  }

                  const publicAddress = address.toLowerCase();
                  // console.log("publicAddress: ", publicAddress);

                  // console.log("selectedChain.id: ", selectedChain.id);
                  const signMessageResult = await handleSignMessage({
                    accountAddress: publicAddress,
                    chainId: selectedChain.id,
                  });
                  // console.log("signMessageResult: ", signMessageResult);
                  // console.log("handleAuthenticate: ", handleAuthenticate);

                  // Send signature to back-end on the /auth route.
                  await handleAuthenticate({
                    publicAddress: publicAddress,
                    signature: signMessageResult,
                    mutateUser,
                  });
                }}
              >
                LOGIN
              </Button>
            </CardContent>
          </Card>
        </Box>
      </>
    );
  }

  function LoadingPage() {
    // console.log("call buildLoadingPage()");

    return (
      <>
        <Typography>Loading ...</Typography>
      </>
    );
  }

  function PaymentPage() {
    return (
      <>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{ marginTop: "50px" }}
        >
          <Card
            sx={{
              minWidth: CARD_MIN_WIDTH,
              maxWidth: CARD_MAX_WIDTH,
            }}
          >
            <CardMedia
              component="img"
              image={PLACEHOLDER_IMAGE_URL}
              height={"200px"}
            />
            <CardContent
              sx={{
                padding: "10",
              }}
            >
              <Typography variant="h5">
                You have to rent NFT for drawing.
              </Typography>
              <Button
                disabled={isLoadingRentNFT || isLoadingRentNFTTx}
                fullWidth
                sx={{ marginTop: "10px" }}
                variant="contained"
                onClick={function () {
                  if (writeRentNFT && dataRentData) {
                    writeRentNFT?.({
                      value: dataRentData.rentFee,
                    });
                  }
                }}
              >
                {isLoadingRentNFT || isLoadingRentNFTTx ? (
                  <Typography>
                    Renting NFT... ({paymentNftRentFee} matic)
                  </Typography>
                ) : (
                  <Typography>Rent NFT ({paymentNftRentFee} matic)</Typography>
                )}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </>
    );
  }

  const ImagePage = React.useCallback(
    function ImagePage(promps) {
      // console.log("call ImagePage()");
      // console.log("imageUrl: ", imageUrl);
      // console.log("imageHeight: ", imageHeight);

      return (
        <Image
          src={imageUrl}
          height={imageHeight}
          fit="contain"
          duration={10}
          easing="ease"
          shiftDuration={10}
        />
      );
    },
    [imageUrl, imageHeight]
  );

  function DrawPage() {
    // console.log("call DrawPage()");
    // console.log("currentTimestamp: ", currentTimestamp);
    // console.log("paymentNftRentEndTime: ", paymentNftRentEndTime);

    return (
      <>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          display="flex"
          flexDirection="column"
        >
          {isLoadingRentData || !paymentNftRentEndTime || !currentTimestamp ? (
            <Typography>Remaining time is ...</Typography>
          ) : paymentNftRentEndTime &&
            currentTimestamp &&
            currentTimestamp < paymentNftRentEndTime ? (
            <Typography color="black">
              {moment
                .duration((paymentNftRentEndTime - currentTimestamp) * 1000)
                .format()}
            </Typography>
          ) : (
            <Typography>Rent finished</Typography>
          )}
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
            sx={{ m: 2 }}
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
            sx={{ m: 2 }}
            disabled={loadingImage}
            autoComplete="on"
          />
        </Box>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
        	{/*//*TODO: Show image fetch time. */}
          {/* {imageFetchEndTime && (
            <Typography color="black">
              {moment
                .duration((imageFetchEndTime - currentTimestamp) * 1000)
                .hours()}
              :
              {moment
                .duration((imageFetchEndTime - currentTimestamp) * 1000)
                .minutes()}
              :
              {moment
                .duration((imageFetchEndTime - currentTimestamp) * 1000)
                .seconds()}{" "}
              /
              {moment
                .duration((imageFetchEndTime - currentTimestamp) * 1000)
                .humanize()}
            </Typography>
          )} */}

          <Grid container>
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
                m: 1,
              }}
              disabled={!imageUrl || loadingImage}
            >
              Mint
            </Button>

            <Button
              variant="contained"
              onClick={() =>
                postImage({
                  postImageUrl: imageUrl,
                  inputPrompt: prompt,
                  inputNegativePrompt: negativePrompt,
                })
              }
              sx={{
                m: 1,
              }}
              disabled={!imageUrl || loadingImage}
            >
              Publish
            </Button>
          </Grid>
        </Box>
      </>
    );
  }

  function ContentPage() {
    if (isConnected === false) {
      return <WalletConnectPage />;
    }

    if (!dataAllRentData) {
      return <LoadingPage />;
    }

    if (user === undefined || user.isLoggedIn === false) {
      return <WalletLoginPage />;
    }
    if (user !== undefined && user.rentPaymentNft === true) {
      return <DrawPage />;
    } else {
      return <PaymentPage />;
    }
  }

  return (
    <>
      <Grid
        container
        spacing={2}
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
        sx={{ marginTop: MARGIN_TOP }}
      >
        <Grid item>
          <Web3Button />
        </Grid>
        <Grid item>
          <Web3NetworkSwitch />
        </Grid>
      </Grid>

      <ContentPage />

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
        <ImagePage />
      )}

      <MessageSnackbar
        open={openSnackbar}
        autoHideDuration={10000}
        onClose={handleCloseSnackbar}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />
    </>
  );
}
