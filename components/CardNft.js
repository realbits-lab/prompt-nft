import React from "react";
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
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
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
import rentmarketABI from "@/contracts/rentMarket.json";
import promptNFTABI from "@/contracts/promptNFT.json";

export default function CardNft({ nftData }) {
  // console.log("call CardNft()");
  // console.log("nftData: ", nftData);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;
  const SERVICE_ACCOUNT_ADDRESS =
    process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS;

  const CARD_MARGIN_TOP = "60px";
  const CARD_MARGIN_BOTTOM = 600;
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;
  const [cardImageHeight, setCardImageHeight] = React.useState(0);
  const [metadata, setMetadata] = React.useState();
  const { user, mutateUser } = useUser();

  //*---------------------------------------------------------------------------
  //* Wagmi hook
  //*---------------------------------------------------------------------------
  const promptNftContract = getContract({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });
  const { chains, chain: selectedChain } = useNetwork();
  const { address, isConnected } = useAccount();
  const {
    data: dataWalletClient,
    isError: isErrorWalletClient,
    isLoading: isLoadingWalletClient,
  } = useWalletClient();

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
    data: dataTokenURI,
    isError: isErrorTokenURI,
    isLoading: isLoadingTokenURI,
    isValidating: isValidatingTokenURI,
    status: statusTokenURI,
  } = useContractRead({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI.abi,
    functionName: "tokenURI",
    args: [nftData?.tokenId],
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
    args: [nftData?.nftAddress, nftData?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data.renteeAddress: ", data.renteeAddress);
      // console.log("address: ", address);
      if (data.renteeAddress.toLowerCase() === address.toLowerCase()) {
        setIsOwnerOrRentee(true);
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
    args: [nftData?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
      // console.log("address: ", address);
      if (data.toLowerCase() === address.toLowerCase()) {
        setIsOwnerOrRentee(true);
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
      nftData?.tokenId,
      SERVICE_ACCOUNT_ADDRESS,
    ],
    value: nftData?.rentFee,
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

  const [isRenting, setIsRenting] = React.useState(false);
  const [isOwnerOrRentee, setIsOwnerOrRentee] = React.useState();
  // console.log("isOwnerOrRentee: ", isOwnerOrRentee);

  React.useEffect(function () {
    // console.log("call useEffect()");

    setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);

    //* Register window resize event.
    window.addEventListener("resize", function () {
      // console.log("call resize()");
      // console.log("window.innerHeight: ", window.innerHeight);
      setCardImageHeight(window.innerHeight - CARD_MARGIN_BOTTOM);
    });
  }, []);

  function handleCardMediaImageError(e) {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  async function handleRentPayment() {
    if (isOwnerOrRentee === true) {
      await handleCheckPrompt({
        setWriteToastMessage: setWriteToastMessage,
        setWriteDialogMessage: setWriteDialogMessage,
        isMobile: isMobile,
        user: user,
        nftData: nftData,
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

      // console.log("nftData.rentFee: ", nftData.rentFee);
      // console.log("nftData.tokenId: ", nftData.tokenId);
      // console.log("writeRentNFT: ", writeRentNFT);
      setIsRenting(true);
      writeRentNFT?.();
    }
  }

  return (
    <Box
      sx={{
        m: CARD_PADDING,
        marginTop: CARD_MARGIN_TOP,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card>
        {metadata ? (
          <CardMedia
            component="img"
            image={metadata?.image}
            onError={handleCardMediaImageError}
            sx={{
              height: cardImageHeight,
              objectFit: "contain",
            }}
          />
        ) : (
          <Skeleton
            variant="rounded"
            sx={{
              height: cardImageHeight,
            }}
          />
        )}
        <CardContent
          sx={{
            width: "90vw",
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Item</StyledTableCell>
                  <StyledTableCell align="center">Value</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell align="left">Token ID</StyledTableCell>
                  <StyledTableCell align="left">
                    {nftData?.tokenId.toString()}
                  </StyledTableCell>
                </StyledTableRow>

                <StyledTableRow>
                  <StyledTableCell align="left">Name</StyledTableCell>
                  <StyledTableCell align="left">
                    {metadata ? metadata.name : "loading..."}
                  </StyledTableCell>
                </StyledTableRow>

                <StyledTableRow>
                  <StyledTableCell align="left">Description</StyledTableCell>
                  <StyledTableCell align="left">
                    {metadata ? metadata.description : "loading..."}
                  </StyledTableCell>
                </StyledTableRow>

                <StyledTableRow>
                  <StyledTableCell align="left">Opensea</StyledTableCell>
                  <StyledTableCell align="left">
                    {shortenAddress({
                      address: nftData?.nftAddress,
                      withLink: "opensea",
                    })}
                  </StyledTableCell>
                </StyledTableRow>

                <StyledTableRow>
                  <StyledTableCell align="left">Explorer</StyledTableCell>
                  <StyledTableCell align="left">
                    {shortenAddress({
                      address: nftData?.nftAddress,
                      withLink: "scan",
                    })}
                  </StyledTableCell>
                </StyledTableRow>

                <StyledTableRow>
                  <StyledTableCell align="left">
                    <Button
                      size="small"
                      disabled={isRenting}
                      variant="contained"
                      onClick={handleRentPayment}
                    >
                      {isOwnerOrRentee === undefined ? (
                        <Typography>Loading...</Typography>
                      ) : isRenting ? (
                        <Typography>Renting...</Typography>
                      ) : isOwnerOrRentee ? (
                        <Typography>Prompt</Typography>
                      ) : (
                        <Typography>Rent</Typography>
                      )}
                    </Button>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {(
                      Number((nftData?.rentFee * 1000000n) / 10n ** 18n) /
                      1000000
                    ).toString()}{" "}
                    matic
                  </StyledTableCell>
                </StyledTableRow>

                {nftData?.rentFeeByToken ? (
                  <StyledTableRow>
                    <StyledTableCell align="left">
                      <Button
                        size="small"
                        disabled={
                          isRenting || isLoadingRentData || isLoadingOwnerOf
                        }
                        variant="contained"
                        onClick={handleRentPayment}
                      >
                        {isOwnerOrRentee === undefined ? (
                          <Typography>Loading...</Typography>
                        ) : isRenting ? (
                          <Typography>Renting...</Typography>
                        ) : isOwnerOrRentee ? (
                          <Typography>Prompt</Typography>
                        ) : (
                          <Typography>Rent</Typography>
                        )}
                      </Button>
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {(
                        Number(
                          (nftData?.rentFeeByToken * 1000000n) / 10n ** 18n
                        ) / 1000000
                      ).toString()}{" "}
                      token
                    </StyledTableCell>
                  </StyledTableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
