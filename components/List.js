import React from "react";
import {
  Web3Button,
  Web3NetworkSwitch,
  useWeb3ModalNetwork,
} from "@web3modal/react";
import { useAccount, useSigner, useContract, useSignTypedData } from "wagmi";
import useSWR from "swr";
import { Buffer } from "buffer";
import { Base64 } from "js-base64";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import { isMobile } from "react-device-detect";
import { getChainId, getChainName } from "../lib/util";
import useUser from "../lib/useUser";
import fetchJson, { FetchError } from "../lib/fetchJson";
//* Copy abi file from rent-market repository.
import promptNFTABI from "../contracts/promptNFT.json";
import rentmarketABI from "../contracts/rentMarket.json";

const MessageSnackbar = dynamic(() => import("./MessageSnackbar"), {
  ssr: false,
});

function List({ mode }) {
  // console.log("call List()");

  //*---------------------------------------------------------------------------
  //* Define constant or hook variables.
  //*---------------------------------------------------------------------------
  const { selectedChain, setSelectedChain } = useWeb3ModalNetwork();
  // console.log("selectedChain: ", selectedChain);
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);
  const {
    data: dataSigner,
    isError: isErrorSigner,
    isLoading: isLoadingSigner,
  } = useSigner();
  // console.log("dataSigner: ", dataSigner);
  // console.log("isError: ", isError);
  // console.log("isLoading: ", isLoading);
  const promptNftContract = useContract({
    address: process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });
  // console.log("promptNftContract: ", promptNftContract);
  const rentMarketContract = useContract({
    address: process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI["abi"],
  });
  // console.log("rentMarketContract: ", rentMarketContract);

  //*---------------------------------------------------------------------------
  //* Define user login.
  //*---------------------------------------------------------------------------
  const { user, mutateUser } = useUser();
  //* All properties on a domain are optional
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
    //* Refer to PrimaryType
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
  // console.log("dataSignTypedData: ", dataSignTypedData);
  // console.log("isErrorSignTypedData: ", isErrorSignTypedData);
  // console.log("isLoadingSignTypedData: ", isLoadingSignTypedData);
  // console.log("isSuccessSignTypedData: ", isSuccessSignTypedData);
  // console.log("signTypedData: ", signTypedData);

  const theme = useTheme();

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const API_ALL_URL = process.env.NEXT_PUBLIC_API_ALL_URL;

  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  const NUMBER_PER_PAGE = 5;

  //*---------------------------------------------------------------------------
  //* Define fetcher hook.
  //*---------------------------------------------------------------------------
  const {
    data: getAllResult,
    error,
    isValidating,
    mutate,
  } = useSWR(API_ALL_URL);
  // console.log("-- getAllResult: ", getAllResult);
  // console.log("-- error: ", error);
  // console.log("-- isValidating: ", isValidating);
  // console.log("-- mutate: ", mutate);

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
  //* Other variables.
  //*---------------------------------------------------------------------------
  const [allImageDataCount, setAllImageDataCount] = React.useState(0);
  const [allImageDataArray, setAllImageDataArray] = React.useState([]);

  const [allNftDataCount, setAllNftDataCount] = React.useState(0);
  const [allNftDataArray, setAllNftDataArray] = React.useState([]);

  const [allRegisterDataCount, setAllRegisterDataCount] = React.useState(0);
  const [allRegisterDataArray, setAllRegisterDataArray] = React.useState([]);

  const [allMyRentDataCount, setAllMyRentDataCount] = React.useState(0);
  const [allMyRentDataArray, setAllMyRentDataArray] = React.useState([]);

  const [allMyOwnDataCount, setAllMyOwnDataCount] = React.useState(0);
  const [allMyOwnDataArray, setAllMyOwnDataArray] = React.useState([]);

  const [decryptedPrompt, setDecryptedPrompt] = React.useState("");

  //*---------------------------------------------------------------------------
  //* For pagination.
  //* Keep each page index per menu (image, nft, own, and rent).
  //*---------------------------------------------------------------------------
  const [pageIndex, setPageIndex] = React.useState({
    image: 1,
    nft: 1,
    own: 1,
    rent: 1,
  });
  const [allPageCount, setAllPageCount] = React.useState({
    image: 1,
    nft: 1,
    own: 1,
    rent: 1,
  });
  const handlePageIndexChange = (event, value) => {
    setPageIndex((prevState) => {
      return {
        ...prevState,
        [mode]: value,
      };
    });
  };

  //*---------------------------------------------------------------------------
  //* For dialog.
  //*---------------------------------------------------------------------------
  const [openDialog, setOpenDialog] = React.useState(false);

  //* TODO: Check the multiple calls.
  React.useEffect(() => {
    // console.log("call useEffect()");
    // console.log("mode: ", mode);
    // console.log("selectedChain: ", selectedChain);
    // console.log("address: ", address);
    // console.log("isConnected: ", isConnected);
    // console.log("dataSigner: ", dataSigner);
    // console.log("promptNftContract: ", promptNftContract);

    if (isWalletConnected() === true) {
      initializeNftData();
    }
  }, [selectedChain, address, isConnected, dataSigner, promptNftContract]);

  React.useEffect(
    function () {
      initializeImageData();
    },
    [getAllResult]
  );

  async function initializeImageData() {
    // console.log("call initializeImageData()");

    try {
      //* Get all image prompt and image data.
      // const getAllResult = await fetchJson(API_ALL_URL);
      // const getAllResult = data;
      // console.log("getAllResult: ", getAllResult);
      if (!getAllResult || getAllResult.length === 0) {
        setAllImageDataArray([]);
        setAllImageDataCount(0);
        // setAllPageCount(0);
        setAllPageCount((prevState) => {
          return {
            ...prevState,
            [mode]: 0,
          };
        });
        return;
      }

      setAllImageDataArray(getAllResult.data);
      setAllImageDataCount(getAllResult.data.length);
      // console.log(
      //   "allUnencyptedPromptImages.data.length: ",
      //   allUnencyptedPromptImages.data.length
      // );

      //* Get total page count not from useState but variable directly.
      const totalCount = Math.ceil(getAllResult.data.length / NUMBER_PER_PAGE);
      // console.log("totalCount: ", totalCount);
      // console.log("mode: ", mode);
      setAllPageCount((prevState) => {
        return {
          ...prevState,
          ["image"]: totalCount,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async function initializeNftData() {
    // console.log("call initializeNftData()");

    try {
      //* Get all nft data.
      const { allNftDataCountResult, allNftDataArrayResult } =
        await getAllNftData();
      // console.log("allNftDataCountResult: ", allNftDataCountResult);
      // console.log("allNftDataArrayResult: ", allNftDataArrayResult);
      setAllNftDataCount(allNftDataCountResult);
      setAllNftDataArray(allNftDataArrayResult.reverse());

      //* Get all register data array.
      const { allRegisterDataCountResult, allRegisterDataArrayResult } =
        await getAllRegisterData({
          allNftDataArrayResult: allNftDataArrayResult,
        });
      // console.log("allRegisterDataCountResult: ", allRegisterDataCountResult);
      // console.log("allRegisterDataArrayResult: ", allRegisterDataArrayResult);
      setAllRegisterDataCount(allRegisterDataCountResult);
      setAllRegisterDataArray(allRegisterDataArrayResult.reverse());

      //* Get all my own data array.
      const { myOwnDataCountResult, myOwnDataArrayResult } =
        await getAllMyOwnData({
          owner: address,
          allNftDataArrayResult: allNftDataArrayResult,
        });
      // console.log("myOwnDataCountResult: ", myOwnDataCountResult);
      // console.log("myOwnDataArrayResult: ", myOwnDataArrayResult);
      setAllMyOwnDataCount(myOwnDataCountResult);
      setAllMyOwnDataArray(myOwnDataArrayResult.reverse());

      //* Get all my rent data array.
      const { myRentDataCountResult, myRentDataArrayResult } =
        await getAllMyRentData({
          myAccount: address,
          allNftDataArrayResult: allNftDataArrayResult,
        });
      // console.log("myRentDataCountResult: ", myRentDataCountResult);
      // console.log("myRentDataArrayResult: ", myRentDataArrayResult);
      setAllMyRentDataCount(myRentDataCountResult);
      setAllMyRentDataArray(myRentDataArrayResult.reverse());

      //* Get total page count not from useState but variable directly.
      let allCount = 0;
      switch (mode) {
        case "image":
          allCount = allImageDataCount;
          break;

        case "nft":
          allCount = allNftDataCountResult;
          break;

        case "own":
          allCount = myOwnDataCountResult;
          break;

        case "rent":
          allCount = myRentDataCountResult;
          break;
      }
      const totalCount = Math.ceil(allCount / NUMBER_PER_PAGE);
      // console.log("totalCount: ", totalCount);
      // console.log("mode: ", mode);
      setAllPageCount((prevState) => {
        return {
          ...prevState,
          [mode]: totalCount,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async function decryptData({ encryptData, decryptAddress }) {
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

  async function getAllNftData() {
    // console.log("call getAllNftData()");
    // console.log("dataSigner: ", dataSigner);
    // console.log("promptNftContract: ", promptNftContract);

    //* If no signer, return zero data.
    if (!promptNftContract || !dataSigner) {
      // console.log("promptNftContract or signer is null or undefined.");
      // console.log("promptNftContract: ", promptNftContract);
      // console.log("dataSigner: ", dataSigner);
      //* Return error.
      return {
        allNftDataCountResult: 0,
        allNftDataArrayResult: [],
      };
    }

    //* Get all nft data from nft contract.
    const totalSupplyBigNumber = await promptNftContract
      .connect(dataSigner)
      .totalSupply();
    // console.log("totalSupplyBigNumber: ", totalSupplyBigNumber);
    const allNftCountResult = totalSupplyBigNumber.toNumber();
    // console.log("allNftCountResult: ", allNftCountResult);

    //* TODO: Make async later.
    //* TODO: Archieve metadata whenever minting and use it in this initial process.
    //* TODO: Get total data from prompt market contract with getAllRegisterData function.
    //* Get all metadata per each token as to token uri.
    let allNftDataResultArray = [];
    for (let i = 0; i < allNftCountResult; i++) {
      //* Get token id and uri.
      const tokenId = await promptNftContract
        .connect(dataSigner)
        .tokenByIndex(i);
      const tokenURI = await promptNftContract
        .connect(dataSigner)
        .tokenURI(tokenId);

      //* Get token metadata from token uri.
      const fetchResult = await fetch(tokenURI);
      const tokenMetadata = await fetchResult.blob();
      const metadataJsonTextData = await tokenMetadata.text();
      const metadataJsonData = JSON.parse(metadataJsonTextData);

      //* Add token metadata.
      allNftDataResultArray.push({
        tokenId: tokenId,
        metadata: metadataJsonData,
      });
    }
    // console.log("allNftDataResultArray: ", allNftDataResultArray);

    //* Return token data array.
    return {
      allNftDataCountResult: allNftDataResultArray.length,
      allNftDataArrayResult: allNftDataResultArray,
    };
  }

  async function getAllRegisterData({ allNftDataArrayResult }) {
    if (!rentMarketContract || !dataSigner) {
      console.error("rentMarketContract or signer is null or undefined.");
      return {
        allRegisterDataCountResult: 0,
        allRegisterDataArrayResult: [],
      };
    }

    //* Get all nft data from rentmarket contract.
    const allRegisterDataArray = await rentMarketContract
      .connect(dataSigner)
      .getAllRegisterData();
    // console.log("allRegisterDataArray: ", allRegisterDataArray);

    const allRegisterDataWithMetadataArray = allRegisterDataArray
      .map((registerElement) => {
        // console.log("registerElement.tokenId: ", registerElement.tokenId);
        const nftDataFoundIndex = allNftDataArrayResult.findIndex(
          (nftElement) => {
            // console.log("nftElement.tokenId: ", nftElement.tokenId);
            return registerElement.tokenId.eq(nftElement.tokenId);
          }
        );
        // console.log("nftDataFoundIndex: ", nftDataFoundIndex);

        if (nftDataFoundIndex !== -1) {
          // Nft should be in register data.
          return {
            tokenId: registerElement.tokenId,
            rentFee: registerElement.rentFee,
            feeTokenAddress: registerElement.feeTokenAddress,
            rentFeeByToken: registerElement.rentFeeByToken,
            rentDuration: registerElement.rentDuration,
            metadata: allNftDataArrayResult[nftDataFoundIndex].metadata,
          };
        }
      })
      .filter((element) => element !== undefined);
    // console.log(
    //   "allRegisterDataWithMetadataArray: ",
    //   allRegisterDataWithMetadataArray
    // );

    //* Return token data array.
    return {
      allRegisterDataCountResult: allRegisterDataWithMetadataArray.length,
      allRegisterDataArrayResult: allRegisterDataWithMetadataArray,
    };
  }

  async function getAllMyOwnData({ owner, allNftDataArrayResult }) {
    // console.log("call getAllMyOwnData()");
    // console.log("dataSigner: ", dataSigner);

    //* If no signer, return zero data.
    if (!promptNftContract || !dataSigner) {
      //* Return error.
      return {
        myOwnDataCountResult: 0,
        myOwnDataArrayResult: [],
      };
    }

    //* Get total supply of prompt nft.
    const totalSupplyBigNumber = await promptNftContract
      .connect(dataSigner)
      .balanceOf(owner);
    // console.log("totalSupply: ", totalSupply);
    const totalSupply = totalSupplyBigNumber.toNumber();

    //* Get all metadata per each token as to token uri.
    let tokenDataArray = [];
    for (let i = 0; i < totalSupply; i++) {
      //* Get token id and uri.
      const tokenId = await promptNftContract
        .connect(dataSigner)
        .tokenOfOwnerByIndex(owner, i);
      const tokenURI = await promptNftContract
        .connect(dataSigner)
        .tokenURI(tokenId);

      //* Get token metadata from token uri.
      //* TODO: Make async later.
      const fetchResult = await fetch(tokenURI);
      const tokenMetadata = await fetchResult.blob();
      const metadataJsonTextData = await tokenMetadata.text();
      const metadataJsonData = JSON.parse(metadataJsonTextData);

      //* Add token metadata.
      tokenDataArray.push({
        tokenId: tokenId,
        metadata: metadataJsonData,
      });
    }
    // console.log("tokenURIArray: ", tokenURIArray);

    //* Return token data array.
    return {
      myOwnDataCountResult: totalSupply,
      myOwnDataArrayResult: tokenDataArray,
    };
  }

  async function getAllMyRentData({ myAccount, allNftDataArrayResult }) {
    if (!rentMarketContract || !dataSigner) {
      console.error("rentMarketContract or signer is null or undefined.");
      return {
        myRentDataCountResult: 0,
        myRentDataArrayResult: [],
      };
    }

    const allRentDataResult = await rentMarketContract
      .connect(dataSigner)
      .getAllRentData();

    const allRentDataArrayWithMetadata = allRentDataResult
      .filter(
        (rentElement) =>
          rentElement.renteeAddress.localeCompare(myAccount, undefined, {
            sensitivity: "accent",
          }) === 0
      )
      .map((rentElement) => {
        const nftDataFoundIndex = allNftDataArrayResult.findIndex(
          (nftElement) => {
            return rentElement.tokenId.eq(nftElement.tokenId) === true;
          }
        );

        if (nftDataFoundIndex !== -1) {
          // Nft should be in register data.
          return {
            tokenId: rentElement.tokenId,
            rentFee: rentElement.rentFee,
            feeTokenAddress: rentElement.feeTokenAddress,
            rentFeeByToken: rentElement.rentFeeByToken,
            rentDuration: rentElement.rentDuration,
            metadata: allNftDataArrayResult[nftDataFoundIndex].metadata,
          };
        }
      })
      .filter((element) => element !== undefined);
    // console.log("allRentDataArrayWithMetadata: ", allRentDataArrayWithMetadata);

    // Return all my rent data array.
    return {
      myRentDataCountResult: allRentDataArrayWithMetadata.length,
      myRentDataArrayResult: allRentDataArrayWithMetadata,
    };
  }

  async function handleLogin({ mutateUser, address, chainId }) {
    // console.log("call handleLogin()");
    // console.log("chainId: ", chainId);

    const publicAddress = address.toLowerCase();
    // console.log("publicAddress: ", publicAddress);

    try {
      //* Check user with public address and receive nonce as to user.
      //* If user does not exist, back-end would add user data.
      const jsonResult = await fetchJson(`/api/nonce/${publicAddress}`);
      // console.log("jsonResult: ", jsonResult);
    } catch (error) {
      throw error;
    }

    //* Popup MetaMask confirmation modal to sign message with nonce data.
    const signMessageResult = await signTypedDataAsync();
    // console.log("signMessageResult: ", signMessageResult);

    //* Send signature to back-end on the /auth route.
    //* Call /api/login and set mutate user data with response data.
    const body = { publicAddress, signature: signMessageResult };
    try {
      mutateUser(
        await fetchJson("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
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

  async function handleLogout({ mutateUser }) {
    try {
      mutateUser(await fetchJson("/api/logout", { method: "POST" }), false);
    } catch (error) {
      if (error instanceof FetchError) {
        console.error(error.data.message);
      } else {
        console.error("An unexpected error happened:", error);
      }
      throw error;
    }
  }
  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    // console.log("imageUrl: ", imageUrl);
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  const ImageCardList = React.useCallback(
    function ImageCardList(props) {
      if (isValidating === true) {
        return <LoadingPage />;
      }

      if (allImageDataArray.length === 0) {
        return (
          <NoContentPage
            message={
              "This service is just started. Soon, image list with prompt will be updated."
            }
          />
        );
      }

      return allImageDataArray.map((imageData, idx) => {
        // console.log("idx: ", idx);
        // console.log("pageIndex.image: ", pageIndex.image);
        // console.log("imageData: ", imageData);
        // Check idx is in pagination.
        // pageIndex.image starts from 1.
        // idx starts from 0.
        if (
          idx >= (pageIndex.image - 1) * NUMBER_PER_PAGE &&
          idx < pageIndex.image * NUMBER_PER_PAGE
        ) {
          return (
            <Box sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }} key={idx}>
              <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
                <CardMedia
                  component="img"
                  image={imageData.imageUrl}
                  onError={handleCardMediaImageError}
                />
                <CardContent>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                    component="div"
                  >
                    {imageData.prompt}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          );
        }
      });
    },
    [allImageDataArray.length, pageIndex.image, isValidating]
  );

  const RegisterCardList = React.useCallback(
    function RegisterCardList(props) {
      if (allRegisterDataArray.length === 0) {
        return <NoContentPage message={"No prompt NFT."} />;
      }

      return allRegisterDataArray.map((nftData, idx) => {
        // console.log("idx: ", idx);
        // console.log("pageIndex.nft: ", pageIndex.nft);
        //* Check idx is in pagination.
        //* pageIndex.nft starts from 1.
        //* idx starts from 0.
        if (
          idx >= (pageIndex.nft - 1) * NUMBER_PER_PAGE &&
          idx < pageIndex.nft * NUMBER_PER_PAGE
        ) {
          return (
            <Box sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }} key={idx}>
              <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
                <CardMedia
                  component="img"
                  // width={100}
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
                    onClick={async () => {
                      if (mode === "nft" && isWalletConnected() === false) {
                        // console.log("chainName: ", getChainName({ chainId }));
                        setSnackbarSeverity("warning");
                        setSnackbarMessage(
                          `Change blockchain network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`
                        );
                        setOpenSnackbar(true);
                        return;
                      }

                      if (!rentMarketContract || !dataSigner) {
                        console.error(
                          "rentMarketContract or signer is null or undefined."
                        );
                        return;
                      }

                      //* Rent this nft with rent fee.
                      try {
                        const tx = await rentMarketContract
                          .connect(dataSigner)
                          .rentNFT(
                            process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
                            nftData.tokenId,
                            process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS,
                            {
                              value: nftData.rentFee,
                            }
                          );
                        const txResult = await tx.wait();
                      } catch (error) {
                        console.error(error);
                        setSnackbarSeverity("error");
                        setSnackbarMessage(
                          error.data.message
                            ? error.data.message
                            : error.message
                        );
                        setOpenSnackbar(true);
                      }
                    }}
                  >
                    RENT
                  </Button>
                </CardActions>
              </Card>
            </Box>
          );
        }
      });
    },
    [allRegisterDataArray.length, pageIndex.nft]
  );

  const OwnCardList = React.useCallback(
    function OwnCardList(props) {
      // console.log("call OwnCardList()");
      // console.log("allMyOwnDataCount: ", allMyOwnDataCount);

      if (allMyOwnDataArray.length === 0) {
        return (
          <NoContentPage message={"You do not have any image prompt NFT."} />
        );
      }

      return allMyOwnDataArray.map((nftData, idx) => {
        // console.log("nftData: ", nftData);
        // console.log("idx: ", idx);
        // console.log("pageIndex.own: ", pageIndex.own);
        // Check idx is in pagination.
        // pageIndex.own starts from 1.
        // idx starts from 0.
        if (
          idx >= (pageIndex.own - 1) * NUMBER_PER_PAGE &&
          idx < pageIndex.own * NUMBER_PER_PAGE
        ) {
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
                        const promptResult = await fetchJson("/api/prompt", {
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
    },
    [allMyOwnDataArray.length, pageIndex.own]
  );

  const RentCardList = React.useCallback(
    function RentCardList(props) {
      if (allMyRentDataArray.length === 0) {
        return (
          <NoContentPage
            message={"You have not yet rented any image prompt NFT."}
          />
        );
      }

      return allMyRentDataArray.map((nftData, idx) => {
        // console.log("nftData: ", nftData);
        // console.log("idx: ", idx);
        // console.log("pageIndex.rent: ", pageIndex.rent);
        // Check idx is in pagination.
        // pageIndex.rent starts from 1.
        // idx starts from 0.
        if (
          idx >= (pageIndex.rent - 1) * NUMBER_PER_PAGE &&
          idx < pageIndex.rent * NUMBER_PER_PAGE
        ) {
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
                      //* Check the wallet connection.
                      if (mode === "rent" && isWalletConnected() === false) {
                        // console.log("chainName: ", getChainName({ chainId }));
                        setSnackbarSeverity("warning");
                        setSnackbarMessage(
                          `Change metamask network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`
                        );
                        setOpenSnackbar(true);
                        return;
                      }

                      //* Check user login session.
                      // if (user.isLoggedIn === false) {
                      //   try {
                      //     await handleLogin({
                      //       mutateUser: mutateUser,
                      //       address: address,
                      //       chainId: selectedChain.id,
                      //     });
                      //   } catch (error) {
                      //     console.error(error);
                      //     setSnackbarSeverity("error");
                      //     setSnackbarMessage(`Login error: ${error}`);
                      //     setOpenSnackbar(true);
                      //     return;
                      //   }
                      // }
                      await handleLogout({ mutateUser: mutateUser });
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

                      //* Get the prompt.
                      const body = { tokenId: nftData.tokenId.toNumber() };
                      const promptResult = await fetchJson("/api/prompt", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      });
                      // console.log("promptResult:", promptResult);
                      const decodedPrompt = Base64.decode(
                        promptResult.prompt
                      ).toString();
                      // console.log("decodedPrompt:", decodedPrompt);

                      //* Show the prompt dialog
                      setDecryptedPrompt(decodedPrompt);
                      setOpenDialog(true);
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
    },
    [allMyRentDataArray.length, pageIndex.rent]
  );

  function isWalletConnected() {
    // console.log("call isWalletConnected()");
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
      // console.log("return false");
      return false;
    } else {
      // console.log("return true");
      return true;
    }
  }

  function NoLoginPage() {
    // console.log("theme: ", theme);
    return (
      <Box
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
          <CardMedia component="img" image={PLACEHOLDER_IMAGE_URL} />
          <Grid
            container
            justifyContent="space-around"
            marginTop={3}
            marginBottom={1}
          >
            <Grid item>
              <Web3Button />
            </Grid>
            <Grid item>
              <Web3NetworkSwitch />
            </Grid>
          </Grid>
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <Typography variant="h7" color={theme.palette.text.primary}>
              Click Connect Wallet button above.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  function LoadingPage() {
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
        {mode !== "image" ? (
          <Grid container spacing={2} justifyContent="space-around" padding={2}>
            <Grid item>
              <Web3Button />
            </Grid>
            <Grid item>
              <Web3NetworkSwitch />
            </Grid>
          </Grid>
        ) : null}
        <CircularProgress sx={{ width: "50vw" }} />
      </Box>
    );
  }

  const NoContentPage = React.useCallback(
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
          {mode !== "image" ? (
            <Grid
              container
              spacing={2}
              justifyContent="space-around"
              padding={2}
            >
              <Grid item>
                <Web3Button />
              </Grid>
              <Grid item>
                <Web3NetworkSwitch />
              </Grid>
            </Grid>
          ) : null}
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
    },
    [mode]
  );

  return (
    <div>
      <Box
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        {mode === "image" ? (
          <div>
            <ImageCardList />
          </div>
        ) : mode === "nft" ? (
          <div>
            {isWalletConnected() === false ? (
              <NoLoginPage />
            ) : (
              <RegisterCardList />
            )}
          </div>
        ) : mode === "own" ? (
          <div>
            {isWalletConnected() === false ? <NoLoginPage /> : <OwnCardList />}
          </div>
        ) : mode === "rent" ? (
          <div>
            {isWalletConnected() === false ? <NoLoginPage /> : <RentCardList />}
          </div>
        ) : (
          <div>
            <ImageCardList />
          </div>
        )}

        <Box sx={{ m: 5 }}>
          <Pagination
            count={allPageCount[mode]}
            page={pageIndex[mode]}
            onChange={handlePageIndexChange}
            variant="outlined"
            sx={{
              padding: "10",
              ul: {
                "& .MuiPaginationItem-root": {
                  color: "darkgrey",
                  "&.Mui-selected": {
                    background: "lightcyan",
                    color: "darkgrey",
                  },
                },
              },
            }}
          />
        </Box>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Prompt</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {decryptedPrompt}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
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

export default List;
