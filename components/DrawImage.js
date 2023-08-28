import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { utils } from "ethers";
import { formatEther } from "viem";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import { useRecoilStateLoadable } from "recoil";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWatchPendingTransactions,
  useWalletClient,
} from "wagmi";
import { getContract } from "@wagmi/core";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import rentmarketABI from "@/contracts/rentMarket.json";
import fetchJson, { FetchError } from "@/lib/fetchJson";
import useUser from "@/lib/useUser";
import { sleep, writeToastMessageState, AlertSeverity } from "@/lib/util";
import faucetTokenABI from "@/contracts/faucetToken.json";
import WalletProfile from "@/components/WalletProfile";

export default function DrawImage() {
  // console.log("call DrawImage()");

  const RENT_MARKET_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const DEFAULT_MODEL_NAME = "runwayml/stable-diffusion-v1-5";
  const DRAW_API_URL = "/api/draw";
  const POST_API_URL = "/api/post";
  const POSTED_API_URL = "/api/posted";
  const UPLOAD_IMAGE_TO_S3_URL = "/api/upload-image-to-s3";
  const FETCH_RESULT_API_URL = "/api/fetch-result";
  const DISCORD_BOT_TOKEN = process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN;
  const CARD_MARGIN_TOP = "60px";
  const CARD_MIN_WIDTH = 375;
  const CARD_MAX_WIDTH = 420;
  const IMAGE_PADDING = 450;
  const { user, mutateUser } = useUser();
  // console.log("user: ", user);
  const [imageUrl, setImageUrl] = React.useState("");
  const [loadingImage, setLoadingImage] = React.useState(false);
  const [postingImage, setPostingImage] = React.useState(false);
  const [isImageDrawn, setIsImageDrawn] = React.useState(false);
  const [isImagePosted, setIsImagePosted] = React.useState(false);
  const [imageHeight, setImageHeight] = React.useState(0);
  const router = useRouter();

  //*---------------------------------------------------------------------------
  //* Snackbar.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  //*---------------------------------------------------------------------------
  //* Prompt input.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    prompt: "",
    negativePrompt: "",
    modelName: DEFAULT_MODEL_NAME,
  });
  const { prompt, negativePrompt, modelName } = formValue;
  const handleChange = (event) => {
    // console.log("call handleChange()");

    const { name, value } = event.target;
    setFormValue((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  //*---------------------------------------------------------------------------
  //* Wagmi.
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PAYMENT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS;
  const PAYMENT_NFT_TOKEN_ID = process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN;
  const SERVICE_ACCOUNT_ADDRESS =
    process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS;
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  const { address, isConnected } = useAccount();
  const { chains, chain } = useNetwork();

  const { data: walletClient } = useWalletClient({
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      switch (BLOCKCHAIN_NETWORK) {
        case "localhost":
        default:
          data.addChain({ chain: localhost });
          break;

        case "matic":
          data.addChain({ chain: polygon });
          break;

        case "maticmum":
          data.addChain({ chain: polygonMumbai });
          break;
      }
    },
  });

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
  });

  const { data: dataRentData, isLoading: isLoadingRentData } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getRegisterData",
    args: [PAYMENT_NFT_CONTRACT_ADDRESS, PAYMENT_NFT_TOKEN_ID],
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
    });

  const {
    data: dataRentNFTByToken,
    error: errorRentNFTByToken,
    isError: isErrorRentNFTByToken,
    isIdle: isIdleRentNFTByToken,
    isLoading: isLoadingRentNFTByToken,
    isSuccess: isSuccessRentNFTByToken,
    write: writeRentNFTByToken,
    status: statusRentNFTByToken,
  } = useContractWrite({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI?.abi,
    functionName: "rentNFTByToken",
    // args: [
    //   PAYMENT_NFT_CONTRACT_ADDRESS,
    //   PAYMENT_NFT_TOKEN_ID,
    //   SERVICE_ACCOUNT_ADDRESS,
    // ],
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
  });

  useWatchPendingTransactions({
    listener: function (tx) {
      // console.log("tx: ", tx);
    },
  });

  useEffect(
    function () {
      // console.log("call useEffect()");
      // console.log("window.ethereum: ", window.ethereum);

      momentDurationFormatSetup(moment);

      setImageHeight(window.innerHeight - IMAGE_PADDING);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    },
    [user]
  );

  //* TODO: No reload.
  // useInterval(() => {
  //   console.log("call useInterval()");

  //   const timestamp = Math.floor(Date.now() / 1000);
  //   // console.log("timestamp: ", timestamp);
  //   setCurrentTimestamp((previousTimestamp) => timestamp);
  // }, 1000);

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
    setIsImageDrawn(false);
    setLoadingImage(true);

    let inputPrompt = prompt;
    let inputNegativePrompt = negativePrompt;
    let inputModelName = modelName;

    if (!prompt || prompt === "") {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: "Prompt is empty.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });

      setLoadingImage(false);

      return;
    }

    //* Make stable diffusion api option by json.
    const jsonData = {
      prompt: prompt,
      negative_prompt: negativePrompt,
    };

    let fetchResponse;
    try {
      fetchResponse = await fetch(DRAW_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });
      console.log("fetchResponse: ", fetchResponse);
    } catch (error) {
      console.error(error);
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: "Fetch draw api call is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
      return;
    }

    //* Check error response.
    if (fetchResponse.status !== 200) {
      console.error("fetchResponse.status is not 200.");
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: "Drawing image is failed..",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });

      setLoadingImage(false);

      return;
    }

    //* Get the stable diffusion api result by json.
    const jsonResponse = await fetchResponse.json();

    //* Check error response.
    if (
      jsonResponse.status !== "processing" &&
      jsonResponse.status !== "success"
    ) {
      console.error("jsonResponse.status is not processing or success.");

      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: "Drawing image is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });

      setLoadingImage(false);

      return;
    }

    //* Handle fetch result.
    let imageUrlResponse;
    if (jsonResponse.status === "processing") {
      // console.log("jsonResponse: ", jsonResponse);
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

        setWriteToastMessage({
          snackbarSeverity: AlertSeverity.warning,
          snackbarMessage: "Fetching image is failed.",
          snackbarTime: new Date(),
          snackbarOpen: true,
        });

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
      event.target = {
        name: "negativePrompt",
        value: meta.negative_prompt,
      };
      handleChange(event);
      event.target = { name: "modelName", value: meta.model };
      handleChange(event);

      inputPrompt = meta.prompt;
      inputNegativePrompt = meta.negative_prompt;
      inputModelName = meta.model;
    }

    setImageUrl(imageUrlResponse);
    setLoadingImage(false);
    setIsImagePosted(false);
    setIsImageDrawn(true);

    return;
  }

  async function postImage({ postImageUrl, inputPrompt, inputNegativePrompt }) {
    setPostingImage(true);

    // //* Check the duplicate prompt.
    // const postedResponse = await fetch(POSTED_API_URL, {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     prompt: inputPrompt,
    //   }),
    // });

    // if (postedResponse.status === 200) {
    //   console.error("postedResponse: ", postedResponse);

    //   setWriteToastMessage({
    //     snackbarSeverity: AlertSeverity.warning,
    //     snackbarMessage: "Prompt is already posted.",
    //     snackbarTime: new Date(),
    //     snackbarOpen: true,
    //   });

    //   setIsImagePosted(false);
    //   setPostingImage(false);

    //   return;
    // }

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

      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: `Image url(${postImageUrl}) is invalid.`,
        snackbarTime: new Date(),
        snackbarOpen: true,
      });

      setIsImagePosted(false);
      setPostingImage(false);
      return;
    }

    if (responseUploadImageToS3.status !== 200) {
      console.error(`responseUploadImageToS3: ${responseUploadImageToS3}`);

      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: "S3 uploading is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });

      setIsImagePosted(false);
      setPostingImage(false);
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

      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: `Image upload response error: ${imageUploadResponse}`,
        snackbarTime: new Date(),
        snackbarOpen: true,
      });

      setIsImagePosted(false);
      setPostingImage(false);

      return;
    }

    //* Set image url from image generation server.
    setImageUrl(imageUploadJsonResponse.url);
    setIsImagePosted(true);
    setPostingImage(false);
  }

  function PaymentByTokenPage() {
    return (
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
            mt: CARD_MARGIN_TOP,
          }}
        >
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <Typography variant="h6">
              You have to rent NFT for 1-day drawing.
            </Typography>
            <Button
              disabled={isLoadingRentNFT || isLoadingRentNFTTx}
              fullWidth
              sx={{ marginTop: "10px" }}
              variant="contained"
              onClick={async function () {
                if (writeRentNFT && dataRentData) {
                  const contract = getContract({
                    address: dataRentData.feeTokenAddress,
                    abi: faucetTokenABI.abi,
                  });
                  // console.log("contract: ", contract);

                  const { r, s, v, deadline } = await erc20PermitSignature({
                    owner: address,
                    spender: RENT_MARKET_CONTRACT_ADDRESS,
                    amount: dataRentData.rentFeeByToken,
                    contract,
                    chain,
                  });

                  writeRentNFTByToken?.({
                    // value: dataRentData.rentFeeByToken,
                    args: [
                      PAYMENT_NFT_CONTRACT_ADDRESS,
                      PAYMENT_NFT_TOKEN_ID,
                      SERVICE_ACCOUNT_ADDRESS,
                      deadline,
                      v,
                      r,
                      s,
                    ],
                  });
                }
              }}
            >
              {isLoadingRentNFT || isLoadingRentNFTTx ? (
                <Typography>
                  Renting NFT... (
                  {formatEther(dataRentData?.rentFeeByToken || BigInt(0))}{" "}
                  token)
                </Typography>
              ) : (
                <Typography>
                  Rent NFT (
                  {formatEther(dataRentData?.rentFeeByToken || BigInt(0))}{" "}
                  token)
                </Typography>
              )}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  function PaymentPage() {
    return (
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
            mt: CARD_MARGIN_TOP,
          }}
        >
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <Typography variant="h6">
              You have to rent NFT for 1-day drawing.
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
                  Renting NFT... (
                  {formatEther(dataRentData?.rentFee || BigInt(0))} matic)
                </Typography>
              ) : (
                <Typography>
                  Rent NFT ({formatEther(dataRentData?.rentFee || BigInt(0))}{" "}
                  matic)
                </Typography>
              )}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  async function erc20PermitSignature({
    owner,
    spender,
    amount,
    contract,
    chain,
  }) {
    // console.log("call erc20PermitSignature()");
    // console.log("owner: ", owner);
    // console.log("spender: ", spender);
    // console.log("amount: ", amount);
    // console.log("contract: ", contract);
    // console.log("chain: ", chain);

    try {
      //* Deadline is 20 minutes later from current timestamp.
      const transactionDeadline = Date.now() + 20 * 60;
      // console.log("transactionDeadline: ", transactionDeadline);
      const nonce = await contract.read.nonces({ args: [owner] });
      // console.log("nonce: ", nonce);
      const contractName = await contract.read.name();
      // console.log("contractName: ", contractName);

      const EIP712Domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ];
      // console.log("chain: ", chain);
      const domain = {
        name: contractName,
        version: "1",
        chainId: chain.id,
        verifyingContract: contract.address,
      };
      const Permit = [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ];
      const message = {
        owner,
        spender,
        value: amount.toString(),
        nonce: nonce.toString(16),
        deadline: transactionDeadline,
      };
      const msgParams = JSON.stringify({
        types: {
          EIP712Domain,
          Permit,
        },
        domain,
        primaryType: "Permit",
        message,
      });

      const params = [address, msgParams];
      const method = "eth_signTypedData_v4";
      // console.log("params: ", params);
      // console.log("method: ", method);

      const signature = await ethereum.request({
        method,
        params,
      });
      // console.log("signature: ", signature);

      // console.log("utils: ", utils);
      //* TODO: In ethers ^5.7.2 version. In ethers version 6, got error.
      const signData = utils.splitSignature(signature);
      // console.log("signData: ", signData);

      const { r, s, v } = signData;
      return {
        r,
        s,
        v,
        deadline: transactionDeadline,
      };
    } catch (error) {
      console.error("error: ", error);
      return error;
    }
  }

  //* Fix mui textfield problem about focus.
  //* https://github.com/mui/material-ui/issues/783
  return (
    <>
      <WalletProfile />

      {user?.rentPaymentNft === false ? (
        <>
          <PaymentPage />
          <PaymentByTokenPage />
        </>
      ) : (
        <>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            display="flex"
            flexDirection="column"
            sx={{ mt: CARD_MARGIN_TOP }}
          >
            {/*//* Show rent status.                                         */}
            {isLoadingRentData ||
            !paymentNftRentEndTime ||
            !currentTimestamp ? (
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

            {/*//* Prompt input.                                             */}
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
            sx={{
              width: "100%",
            }}
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

            {/*//* Show action step for draw, post, and mint.                */}
            <Box sx={{ width: "100%" }}>
              <Stepper
                activeStep={isImageDrawn ? 1 : isImagePosted ? 2 : -1}
                alternativeLabel
              >
                <Step>
                  <StepLabel>
                    <Button
                      variant="contained"
                      onClick={fetchImage}
                      sx={{
                        m: 1,
                      }}
                      disabled={loadingImage}
                    >
                      {loadingImage ? (
                        <Typography>Drawing...</Typography>
                      ) : (
                        <Typography>Draw</Typography>
                      )}
                    </Button>
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel>
                    {" "}
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
                      disabled={
                        !imageUrl ||
                        loadingImage ||
                        postingImage ||
                        isImagePosted
                      }
                    >
                      {postingImage ? (
                        <Typography>Posting...</Typography>
                      ) : isImagePosted ? (
                        <Typography>Posted</Typography>
                      ) : (
                        <Typography>Post</Typography>
                      )}
                    </Button>
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel>
                    {" "}
                    <Button
                      variant="contained"
                      onClick={() => {
                        //* Get URI encoded string.
                        const imageUrlEncodedString =
                          encodeURIComponent(imageUrl);
                        const promptEncodedString = encodeURIComponent(prompt);
                        const negativePromptEncodedString =
                          encodeURIComponent(negativePrompt);
                        const link = `/mint/${promptEncodedString}/${imageUrlEncodedString}/${negativePromptEncodedString}`;
                        router.push(link);
                      }}
                      sx={{
                        m: 1,
                      }}
                      disabled={!imageUrl || loadingImage || !isImagePosted}
                    >
                      Mint
                    </Button>
                  </StepLabel>
                </Step>
              </Stepper>
            </Box>

            {/*//* Show image.                                               */}
            {loadingImage ? (
              <Box
                height={imageHeight}
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
              >
                <CircularProgress size={imageHeight * 0.4} />
              </Box>
            ) : (
              <Card
                sx={{
                  width: "80%",
                  minWidth: 200,
                  maxWidth: 600,
                  minHeight: 200,
                  maxHeight: 600,
                  marginTop: "20px",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ height: imageHeight, width: "100%" }}
                  image={imageUrl}
                  title={prompt}
                  onError={(e) => {
                    e.target.src = "/no-image.png";
                  }}
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                  ></Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prompt}
                  </Typography>
                </CardContent>
                <CardActions></CardActions>
              </Card>
            )}
          </Box>
        </>
      )}
    </>
  );
}
