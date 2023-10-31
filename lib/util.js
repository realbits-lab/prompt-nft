import React from "react";
import { v4 as uuidv4, v1 } from "uuid";
import { Buffer } from "buffer";
import { Base64 } from "js-base64";
import { atom, selector } from "recoil";
import Link from "@mui/material/Link";
import Portal from "@mui/material/Portal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import fetchJson from "@/lib/fetchJson";

const networks = {
  maticmum: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: "Mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  },
};

export function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

export const shortenAddress = ({
  address,
  token = undefined,
  number = 4,
  withLink = "",
  color = "#0000FF",
}) => {
  // console.log("call shortenAddress()");
  // console.log("address: ", address);
  // console.log("withLink: ", withLink);
  // console.log("token: ", token);

  const POLYGON_MATICMUM_SCAN_URL = "https://mumbai.polygonscan.com/address/";
  const POLYGON_MATIC_SCAN_URL = "https://polygonscan.com/address/";
  const OPENSEA_MATIC_URL = "https://opensea.io/assets/matic/";
  const OPENSEA_MATIC_SEARCH_URL = "https://opensea.io/assets?search[query]=";
  const OPENSEA_MATICMUM_URL = "https://testnets.opensea.io/assets/mumbai/";
  const OPENSEA_MATICMUM_SEARCH_URL =
    "https://testnets.opensea.io/assets?search[query]=";
  let stringLength = 0;
  let middleString = "";

  let openseaUrl;
  let polygonScanUrl;
  if (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK === "matic") {
    if (token) {
      openseaUrl = `${OPENSEA_MATIC_URL}${address}/${token}`;
    } else {
      openseaUrl = `${OPENSEA_MATIC_SEARCH_URL}${address}`;
    }
    polygonScanUrl = `${POLYGON_MATIC_SCAN_URL}${address}`;
  } else if (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK === "maticmum") {
    if (token) {
      openseaUrl = `${OPENSEA_MATICMUM_URL}${address}/${token}`;
    } else {
      openseaUrl = `${OPENSEA_MATICMUM_SEARCH_URL}${address}`;
    }
    polygonScanUrl = `${POLYGON_MATICMUM_SCAN_URL}${address}`;
  } else {
    openseaUrl = "";
    polygonScanUrl = "";
  }

  // Check number maximum.
  if (number > 19 || number < 1) {
    stringLength = 20;
    middleString = "";
  } else {
    stringLength = number;
    middleString = "...";
  }

  if (
    (typeof address === "string" || address instanceof String) &&
    address.length > 0
  ) {
    let addressString;
    if (token) {
      addressString = `${address.substring(
        0,
        number + 2
      )}${middleString}${address.substring(address.length - number)}/${truncate(
        token,
        3
      )}`;
    } else {
      addressString = `${address.substring(
        0,
        number + 2
      )}${middleString}${address.substring(address.length - number)}`;
    }

    switch (withLink) {
      case "maticscan":
      case "scan":
        return (
          <Link href={polygonScanUrl} target="_blank" color={color}>
            {addressString}
          </Link>
        );

      case "opensea_matic":
      case "opensea_maticmum":
      case "opensea":
        return (
          <Link href={openseaUrl} target="_blank" color={color}>
            {addressString}
          </Link>
        );

      default:
        return addressString;
    }
  } else {
    return "n/a";
  }
};

export async function handleLogin({
  mutateUser,
  address,
  chainId,
  signTypedDataAsync,
}) {
  // console.log("call handleLogin()");
  // console.log("mutateUser: ", mutateUser);
  // console.log("address: ", address);
  // console.log("signTypedDataAsync: ", signTypedDataAsync);
  // console.log("chainId: ", chainId);

  const publicAddress = address.toLowerCase();
  // console.log("publicAddress: ", publicAddress);

  // try {
  //   //* Check user with public address and receive nonce as to user.
  //   //* If user does not exist, back-end would add user data.
  //   const jsonResult = await fetchJson({ url: `/api/nonce/${publicAddress}` });
  //   console.log("jsonResult: ", jsonResult);
  // } catch (error) {
  //   console.error(error);
  //   throw error;
  // }

  //* Popup MetaMask confirmation modal to sign message with nonce data.
  //* TODO: Handle function import.
  const signMessageResult = await signTypedDataAsync();
  console.log("signMessageResult: ", signMessageResult);

  //* Send signature to back-end on the /auth route.
  //* Call /api/login and set mutate user data with response data.
  const body = { publicAddress, signature: signMessageResult };
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
    console.error("An unexpected error happened:", error);
    throw error;
  }
}

export async function decryptData({ encryptData, decryptAddress }) {
  // console.log("call decyptData()");
  // console.log("decryptAddress: ", decryptAddress);

  //* Check input data error.
  if (!encryptData || !decryptAddress) {
    return;
  }

  const ct = `0x${Buffer.from(JSON.stringify(encryptData), "utf8").toString(
    "hex"
  )}`;

  const decrypt = await window.ethereum.request({
    method: "eth_decrypt",
    params: [ct, decryptAddress],
  });

  return Base64.decode(decrypt);
}

export function isWalletConnected({ isConnected, selectedChain }) {
  console.log("call isWalletConnected()");
  // console.log("isConnected: ", isConnected);
  // console.log("selectedChain: ", selectedChain);
  // if (selectedChain) {
  //   console.log(
  //     "getChainName({ chainId: selectedChain.id }): ",
  //     getChainName({ chainId: selectedChain.id })
  //   );
  // }
  // console.log(
  //   "getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK }): ",
  //   getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK })
  // );
  if (
    isConnected === false ||
    selectedChain === undefined ||
    getChainName({ chainId: selectedChain.id }) !==
      getChainName({
        chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
      })
  ) {
    console.log("return false");
    return false;
  } else {
    console.log("return true");
    return true;
  }
}

export function getChainId({ chainName }) {
  let chainId;
  if (chainName === "localhost") {
    chainId = 1337;
  } else if (chainName === "maticmum") {
    chainId = 80001;
  } else if (chainName === "matic") {
    chainId = 137;
  } else {
    chainId = 0;
  }
  return chainId;
}

export function getChainName({ chainId }) {
  // https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.js
  const chainIds = {
    0: "kardia",
    1: "ethereum",
    5: "goerli",
    6: "kotti",
    8: "ubiq",
    10: "optimism",
    19: "songbird",
    20: "elastos",
    25: "cronos",
    30: "rsk",
    40: "telos",
    50: "xdc",
    52: "csc",
    55: "zyx",
    56: "binance",
    57: "syscoin",
    60: "gochain",
    61: "ethereumclassic",
    66: "okexchain",
    70: "hoo",
    82: "meter",
    87: "nova network",
    88: "tomochain",
    100: "xdai",
    106: "velas",
    108: "thundercore",
    122: "fuse",
    128: "heco",
    137: "matic",
    200: "xdaiarb",
    246: "energyweb",
    250: "fantom",
    269: "hpb",
    288: "boba",
    321: "kucoin",
    336: "shiden",
    361: "theta",
    416: "sx",
    534: "candle",
    592: "astar",
    820: "callisto",
    888: "wanchain",
    1088: "metis",
    1231: "ultron",
    1284: "moonbeam",
    1285: "moonriver",
    1337: "localhost",
    2000: "dogechain",
    2020: "ronin",
    2222: "kava",
    4689: "iotex",
    5050: "xlc",
    5551: "nahmii",
    6969: "tombchain",
    8217: "klaytn",
    9001: "evmos",
    10000: "smartbch",
    31337: "localhost",
    32659: "fusion",
    42161: "arbitrum",
    42170: "arb-nova",
    42220: "celo",
    42262: "oasis",
    43114: "avalanche",
    47805: "rei",
    55555: "reichain",
    71402: "godwoken",
    80001: "maticmum",
    333999: "polis",
    888888: "vision",
    1313161554: "aurora",
    1666600000: "harmony",
    11297108109: "palm",
    836542336838601: "curio",
  };

  // console.log("chainId: ", chainId);
  // console.log("Number(chainId): ", Number(chainId));
  if (typeof chainId === "string" || chainId instanceof String) {
    if (chainId.startsWith("0x") === true) {
      return chainIds[Number(chainId)];
    } else {
      return chainId;
    }
  } else if (isInt(chainId) === true) {
    return chainIds[chainId];
  }
}

export function checkBlockchainNetwork({ inputChainId }) {
  // console.log("inputChainId: ", inputChainId);
  const chainName = getChainName({ chainId: inputChainId });
  // console.log("chainName: ", chainName);

  if (chainName === process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    return true;
  } else {
    return false;
  }
}

// https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
export const isInt = (value) => {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
};

export function getUniqueKey() {
  // return Math.random().toString(16).slice(2);
  return uuidv4();
}

export const AlertSeverity = {
  error: "error",
  warning: "warning",
  info: "info",
  success: "success",
};

export const writeDialogMessageState = atom({
  key: `writeDialogMessageState/${v1()}`,
  decyprtedPrompt: undefined,
  openDialog: false,
});

export const readDialogMessageState = selector({
  key: `readDialogMessageState/${v1()}`,
  get: ({ get }) => {
    const dialogMessageState = get(writeDialogMessageState);
    return dialogMessageState;
  },
});

export const writeToastMessageState = atom({
  key: `writeToastMessageState/${v1()}`,
  snackbarSeverity: AlertSeverity.info,
  snackbarMessage: "",
  snackbarTime: "time",
  snackbarOpen: true,
});

export const readToastMessageState = selector({
  key: `readToastMessageState/${v1()}`,
  get: ({ get }) => {
    const toastMessageState = get(writeToastMessageState);
    return toastMessageState;
  },
});

export const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export function RBSnackbar({ open, message, severity, currentTime }) {
  const [openToast, setOpenToast] = React.useState(false);
  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenToast(false);
  };

  React.useEffect(() => {
    // console.log("useEffect open: ", open);
    // console.log("useEffect message: ", message);
    // console.log("useEffect severity: ", severity);
    // console.log("useEffect currentTime: ", currentTime);
    if (
      (typeof message === "string" || message instanceof String) &&
      message.length > 0
    ) {
      setOpenToast(open);
    } else {
      setOpenToast(false);
    }
  }, [open, message, severity, currentTime, currentTime]);

  return (
    <Portal>
      <Snackbar
        open={openToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={5000}
        onClose={handleToastClose}
        sx={{ width: "90vw" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Portal>
  );
}

export const handleChangeNetwork = async ({ networkName }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
};

export async function handleCheckPrompt({
  setWriteToastMessage,
  setWriteDialogMessage,
  isMobile,
  user,
  nftData,
  promptNftContract,
  dataWalletClient,
  isConnected,
  selectedChain,
  address,
  mutateUser,
  signTypedDataAsync,
}) {
  // console.log("call handleCheckPrompt()");

  if (isWalletConnected({ isConnected, selectedChain }) === false) {
    // console.log("chainName: ", getChainName({ chainId }));
    setWriteToastMessage({
      snackbarSeverity: AlertSeverity.warning,
      snackbarMessage: `Change wallet network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`,
      snackbarTime: new Date(),
      snackbarOpen: true,
    });
    return;
  }

  //* TODO: Handle own data and claim function later.
  //* Set user login session.
  if (user.isLoggedIn === false) {
    setWriteToastMessage({
      snackbarSeverity: AlertSeverity.info,
      snackbarMessage: "Checking user authentication...",
      snackbarTime: new Date(),
      snackbarOpen: true,
    });
    // const signMessageResult = await signTypedDataAsync();
    // console.log("signMessageResult: ", signMessageResult);

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
  setWriteToastMessage({
    snackbarSeverity: AlertSeverity.info,
    snackbarMessage: "Trying to find the prompt...",
    snackbarTime: new Date(),
    snackbarOpen: true,
  });

  const body = { tokenId: Number(nftData.tokenId) };
  const promptResult = await fetchJson(
    { url: "/api/prompt" },
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  // console.log("promptResult:", promptResult);
  // console.log("promptResult.error:", promptResult.error);

  if (promptResult.prompt === undefined) {
    setWriteToastMessage({
      snackbarSeverity: AlertSeverity.error,
      snackbarMessage: promptResult.error.toString(),
      snackbarTime: new Date(),
      snackbarOpen: true,
    });
  } else {
    const decodedPrompt = Base64.decode(promptResult.prompt).toString();
    // console.log("decodedPrompt:", decodedPrompt);

    setWriteDialogMessage({
      decyprtedPrompt: decodedPrompt,
      openDialog: true,
    });

    setWriteToastMessage({
      snackbarSeverity: AlertSeverity.info,
      snackbarMessage: undefined,
      snackbarTime: new Date(),
      snackbarOpen: false,
    });
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
