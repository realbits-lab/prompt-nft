import React, { useEffect } from "react";
import { useRouter } from "next/router";
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
import rentmarketABI from "@/contracts/rentMarket.json";
import fetchJson, { FetchError } from "@/lib/fetchJson";
import useUser from "@/lib/useUser";
import {
  sleep,
  writeToastMessageState,
  AlertSeverity,
} from "@/lib/util";
import faucetTokenABI from "@/contracts/faucetToken.json";
import WalletProfile from "@/components/WalletProfile";

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

const LoginWrapper = () => {
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

  return <div>LoginWrapper</div>;
};

export default LoginWrapper;
