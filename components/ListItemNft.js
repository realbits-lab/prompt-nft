import React from "react";
import { ethers } from "ethers";
import { isMobile } from "react-device-detect";
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useContractRead,
  useSignTypedData,
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWatchPendingTransactions,
} from "wagmi";
import { getContract } from "wagmi/actions";
import { useRecoilStateLoadable } from "recoil";
import moment from "moment";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import promptNFTABI from "@/contracts/promptNFT.json";
import rentmarketABI from "@/contracts/rentMarket.json";
import {
  isWalletConnected,
  AlertSeverity,
  writeToastMessageState,
  writeDialogMessageState,
  handleCheckPrompt,
  shortenAddress,
  getChainId,
} from "@/lib/util";
import useUser from "@/lib/useUser";

export default function ListItemNft({ registerData }) {
  // console.log("call ListItemNft()");
  // console.log("registerData: ", registerData);

  const CARD_MARGIN_TOP = "80px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  const [isRenting, setIsRenting] = React.useState(false);
  const [isOwnerOrRentee, setIsOwnerOrRentee] = React.useState();
  const { user, mutateUser } = useUser();

  //*---------------------------------------------------------------------------
  //* Wagmi hook
  //*---------------------------------------------------------------------------
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const SERVICE_ACCOUNT_ADDRESS =
    process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS;
  const [metadata, setMetadata] = React.useState();
  const { chains, chain: selectedChain } = useNetwork();
  const { address, isConnected } = useAccount();

  const {
    data: dataWalletClient,
    isError: isErrorWalletClient,
    isLoading: isLoadingWalletClient,
  } = useWalletClient();

  const {
    data: dataTokenURI,
    isError: isErrorTokenURI,
    isLoading: isLoadingTokenURI,
    isValidating: isValidatingTokenURI,
    status: statusTokenURI,
  } = useContractRead({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI.abi,
    functionName: "tokenURI",
    args: [registerData?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      fetch(data).then((fetchResult) =>
        fetchResult.blob().then((tokenMetadata) =>
          tokenMetadata.text().then((metadataJsonTextData) => {
            // console.log("metadataJsonTextData: ", metadataJsonTextData);
            const metadata = JSON.parse(metadataJsonTextData);
            // console.log("metadata: ", metadata);
            setMetadata(metadata);
          })
        )
      );
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

  //*---------------------------------------------------------------------------
  //* Wagmi hook
  //*---------------------------------------------------------------------------
  const promptNftContract = getContract({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });

  const domain = {
    chainId: getChainId({
      chainName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
    }),
    name: "Realbits",
  };
  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    Login: [{ name: "contents", type: "string" }],
  };
  const value = {
    contents: process.env.NEXT_PUBLIC_LOGIN_SIGN_MESSAGE,
  };
  const {
    data: dataSignTypedData,
    isError: isErrorSignTypedData,
    isLoading: isLoadingSignTypedData,
    isSuccess: isSuccessSignTypedData,
    signTypedData,
    signTypedDataAsync,
  } = useSignTypedData({
    domain: domain,
    types: types,
    value: value,
  });

  const {
    data: dataRentData,
    isError: isErrorRentData,
    isLoading: isLoadingRentData,
    isValidating: isValidatingRentData,
    status: statusRentData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getRentData",
    args: [registerData?.nftAddress, registerData?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data.renteeAddress: ", data.renteeAddress);
      // console.log("address: ", address);
      if (data.renteeAddress.toLowerCase() === address.toLowerCase()) {
        setIsOwnerOrRentee(true);
      } else {
        setIsOwnerOrRentee(false);
      }
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
  // console.log("isLoadingRentData: ", isLoadingRentData);
  // console.log("isValidatingRentData: ", isValidatingRentData);
  // console.log("dataRentData: ", dataRentData);

  const {
    data: dataOwnerOf,
    isError: isErrorOwnerOf,
    isLoading: isLoadingOwnerOf,
    isValidating: isValidatingOwnerOf,
    status: statusOwnerOf,
  } = useContractRead({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI.abi,
    functionName: "ownerOf",
    args: [registerData?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
      // console.log("address: ", address);
      if (data.toLowerCase() === address.toLowerCase()) {
        setIsOwnerOrRentee(true);
      } else {
        setIsOwnerOrRentee(false);
      }
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
      PROMPT_NFT_CONTRACT_ADDRESS,
      registerData?.tokenId,
      SERVICE_ACCOUNT_ADDRESS,
    ],
    value: registerData?.rentFee,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
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
      setIsRenting(false);
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
    },
    onError(error) {
      // console.log("call onSuccess()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);

      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Renting is finished.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
  });

  //* Get pending transactions.
  useWatchPendingTransactions({
    listener: function (tx) {
      // console.log("tx: ", tx);
    },
  });

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
  //* Prompt dialog variables.
  //*---------------------------------------------------------------------------
  const [writeDialogMessageLoadable, setWriteDialogMessage] =
    useRecoilStateLoadable(writeDialogMessageState);
  const writeDialogMessage =
    writeDialogMessageLoadable?.state === "hasValue"
      ? writeDialogMessageLoadable.contents
      : {
          decyprtedPrompt: undefined,
          openDialog: false,
        };

  async function handleRentPayment() {
    if (isOwnerOrRentee === true) {
      await handleCheckPrompt({
        setWriteToastMessage: setWriteToastMessage,
        setWriteDialogMessage: setWriteDialogMessage,
        isMobile: isMobile,
        user: user,
        nftData: registerData,
        promptNftContract: promptNftContract,
        dataWalletClient: dataWalletClient,
        isConnected: isConnected,
        selectedChain: selectedChain,
        address: address,
        mutateUser: mutateUser,
        signTypedDataAsync: signTypedDataAsync,
      });

      return;
    } else {
      if (isWalletConnected({ isConnected, selectedChain }) === false) {
        setWriteToastMessage({
          snackbarSeverity: AlertSeverity.warning,
          snackbarMessage: `Change blockchain network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`,
          snackbarTime: new Date(),
          snackbarOpen: true,
        });
        return;
      }

      setIsRenting(true);
      writeRentNFT?.();
    }
  }

  return (
    <Box
      sx={{
        minWidth: CARD_MIN_WIDTH,
        maxWidth: CARD_MAX_WIDTH,
      }}
    >
      <Card sx={{ maxWidth: 345, my: 2 }}>
        <CardHeader
          title={metadata?.name}
          subheader={shortenAddress({
            address: registerData.nftAddress,
            token: Number(registerData.tokenId),
            number: 5,
            withLink: "opensea",
          })}
        />
        <CardMedia component="img" image={metadata?.image} alt="prompt image" />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {metadata?.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            disabled={isRenting}
            variant="outlined"
            onClick={handleRentPayment}
          >
            {isOwnerOrRentee === undefined ? (
              <>Loading...</>
            ) : isRenting ? (
              <>Renting...</>
            ) : isOwnerOrRentee ? (
              <>Prompt</>
            ) : (
              <>
                Rent{" "}
                {(
                  Number((registerData?.rentFee * 1000000n) / 10n ** 18n) /
                  1000000
                ).toString()}{" "}
                matic
              </>
            )}
          </Button>
          {registerData?.feeTokenAddress !== ethers.constants.AddressZero && (
            <Button
              size="small"
              variant="outlined"
              disabled={isRenting || isLoadingRentData || isLoadingOwnerOf}
              onClick={handleRentPayment}
            >
              {isOwnerOrRentee === undefined ? (
                <>Loading...</>
              ) : isRenting ? (
                <>Renting...</>
              ) : isOwnerOrRentee ? (
                <></>
              ) : (
                <>
                  Rent{" "}
                  {(
                    Number(
                      (registerData?.rentFeeByToken * 1000000n) / 10n ** 18n
                    ) / 1000000
                  ).toString()}{" "}
                  token
                </>
              )}
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
}
