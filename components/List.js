import React from "react";
import {
  Web3Button,
  Web3NetworkSwitch,
  useWeb3ModalNetwork,
} from "@web3modal/react";
import {
  useAccount,
  useSigner,
  useContract,
  useContractRead,
  useSignTypedData,
  useContractEvent,
} from "wagmi";
import useSWR from "swr";
import { useRecoilValueLoadable } from "recoil";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import {
  getChainId,
  isWalletConnected,
  readRentingDataState,
} from "../lib/util";
import promptNFTABI from "../contracts/promptNFT.json";
import rentmarketABI from "../contracts/rentMarket.json";
import ListImage from "./ListImage";
import CarouselImage from "./CarouselImage";
import ListNft from "./ListNft";
import CarouselNft from "./CarouselNft";
import ListOwn from "./ListOwn";
import ListRent from "./ListRent";

function List({ mode }) {
  // console.log("call List()");
  // console.log("mode: ", mode);

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const API_ALL_URL = process.env.NEXT_PUBLIC_API_ALL_URL;
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  // console.log("RENT_MARKET_CONTRACT_ADDRES: ", RENT_MARKET_CONTRACT_ADDRES);
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;

  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  //*---------------------------------------------------------------------------
  //* Define hook variables.
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
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });
  // console.log("promptNftContract: ", promptNftContract);
  const rentMarketContract = useContract({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI["abi"],
  });
  // console.log("rentMarketContract: ", rentMarketContract);

  //* Listen contract event.
  useContractEvent({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI["abi"],
    eventName: "RentNFT",
    listener(node, label, owner) {
      // console.log("node: ", node);
      // console.log("label: ", label);
      // console.log("owner: ", owner);
      swrRefetchRentData();
    },
  });

  useContractEvent({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI["abi"],
    eventName: "UnrentNFT",
    listener(node, label, owner) {
      // console.log("node: ", node);
      // console.log("label: ", label);
      // console.log("owner: ", owner);
      swrRefetchRentData();
    },
  });

  //* Get all image data array.
  const {
    data: dataImage,
    error: errorImage,
    isLoading: isLoadingImage,
    isValidating: isValidatingImage,
    mutate: mutateImage,
  } = useSWR({
    url: API_ALL_URL,
  });

  //* Get all register data array.
  // const {
  //   data: swrDataRegisterData,
  //   error: errorNft,
  //   isLoading: isLoadingNft,
  //   isValidating: isValidatingNft,
  // } = useSWR({
  //   command: "getAllRegisterData",
  //   rentMarketContract: rentMarketContract,
  //   signer: dataSigner,
  // });
  const {
    data: swrDataRegisterData,
    isError: swrErrorRegisterData,
    isLoading: swrIsLoadingRegisterData,
    isValidating: swrIsValidatingRegisterData,
    stetus: swrStatusRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllRegisterData",
    cacheOnBlock: true,
    // watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
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

  //* Get all my own data array.
  const {
    data: dataOwn,
    error: errorOwn,
    isLoading: isLoadingOwn,
    isValidating: isValidatingOwn,
  } = useSWR({
    command: "getAllMyOwnData",
    promptNftContract: promptNftContract,
    signer: dataSigner,
    ownerAddress: address,
  });

  //* Get all my rent data array.
  // const {
  //   data: dataRent,
  //   error: errorRent,
  //   isLoading: isLoadingRent,
  //   isValidating: isValidatingRent,
  // } = useSWR({
  //   command: "getAllMyRentData",
  //   rentMarketContract: rentMarketContract,
  //   signer: dataSigner,
  //   renterAddress: address,
  // });
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
    functionName: "getAllRentData",
    cacheOnBlock: true,
    // watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
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
  //* Define state data.
  //*---------------------------------------------------------------------------
  const [allNftDataArray, setAllNftDataArray] = React.useState();
  const [allOwnDataArray, setAllOwnDataArray] = React.useState();
  const [allMyRentDataArray, setAllMyRentDataArray] = React.useState();

  //*---------------------------------------------------------------------------
  //* Define signature data.
  //*---------------------------------------------------------------------------
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

  const { signTypedDataAsync } = useSignTypedData({
    domain: domain,
    types: types,
    value: value,
  });
  // console.log("dataSignTypedData: ", dataSignTypedData);
  // console.log("isErrorSignTypedData: ", isErrorSignTypedData);
  // console.log("isLoadingSignTypedData: ", isLoadingSignTypedData);
  // console.log("isSuccessSignTypedData: ", isSuccessSignTypedData);
  // console.log("signTypedDataAsync: ", signTypedDataAsync);

  const theme = useTheme();

  React.useEffect(
    function () {
      // console.log("call useEffect()");
      initialize();
    },
    [
      selectedChain,
      address,
      dataSigner,
      promptNftContract,
      rentMarketContract,
      swrDataRegisterData,
      swrDataRentData,
      dataOwn,
    ]
  );

  function initialize() {
    // console.log("call useEffect()");
    // console.log("swrDataRegisterData: ", swrDataRegisterData);
    // console.log("swrErrorRegisterData: ", swrErrorRegisterData);
    // console.log("swrIsLoadingRegisterData: ", swrIsLoadingRegisterData);
    // console.log("swrIsValidatingRegisterData: ", swrIsValidatingRegisterData);
    // console.log("swrStatusRegisterData: ", swrStatusRegisterData);
    // console.log("dataOwn: ", dataOwn);
    // console.log("dataRent: ", dataRent);

    let ownDataArray;
    //* Set all own data array.
    if (swrDataRegisterData && dataOwn) {
      ownDataArray = swrDataRegisterData.filter(function (nft) {
        // console.log("nft: ", nft);
        // console.log("nft.tokenId: ", nft.tokenId);
        return dataOwn.some(function (element) {
          // console.log("element.tokenId: ", element.tokenId);
          return (
            nft.tokenId.eq(element.tokenId) &&
            nft.nftAddress.localeCompare(promptNftContract.address, undefined, {
              sensitivity: "accent",
            }) === 0
          );
        });
      });
      // console.log("ownDataArray: ", ownDataArray);
      setAllOwnDataArray(ownDataArray);
    }

    //* Set all rent data.
    let allMyRentDataArray;
    if (swrDataRentData) {
      // console.log("address: ", address);
      allMyRentDataArray = swrDataRentData.filter(
        (rentData) =>
          rentData.renteeAddress.localeCompare(address, undefined, {
            sensitivity: "accent",
          }) === 0
      );
      // console.log("allMyRentDataArray: ", allMyRentDataArray);
      setAllMyRentDataArray(allMyRentDataArray);
    }

    //* Set all registered nft data.
    if (swrDataRegisterData) {
      const dataNftWithStatusArray = swrDataRegisterData
        .map(function (nft) {
          let isOwn = false;
          let isRent = false;
          let isRenting = false;

          //* Check own status.
          if (ownDataArray) {
            const someResult = ownDataArray.some(function (ownData) {
              return (
                ownData.tokenId.eq(nft.tokenId) &&
                ownData.nftAddress.localeCompare(
                  promptNftContract.address,
                  undefined,
                  {
                    sensitivity: "accent",
                  }
                ) === 0
              );
            });
            if (someResult === true) {
              isOwn = true;
            } else {
              isOwn = false;
            }
          }

          //* Check rent status.
          if (allMyRentDataArray) {
            const someResult = allMyRentDataArray.some(function (rentData) {
              // console.log("rentData: ", rentData);
              return (
                rentData.tokenId.eq(nft.tokenId) &&
                rentData.renteeAddress.localeCompare(address, undefined, {
                  sensitivity: "accent",
                }) === 0
              );
            });

            if (someResult === true) {
              isRent = true;
            } else {
              isRent = false;
            }
          }

          // console.log("nft.tokenId: ", nft.tokenId.toNumber());
          // console.log("isOwn: ", isOwn);
          // console.log("isRent: ", isRent);
          // console.log("isRenting: ", isRenting);

          return {
            ...nft,
            isOwn: isOwn,
            isRent: isRent,
            isRenting: isRenting,
          };
        })
        .filter((e) => e);

      setAllNftDataArray(dataNftWithStatusArray.reverse());
      // console.log("dataNftWithStatusArray: ", dataNftWithStatusArray);
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
            {/* <ListImage data={dataImage} isLoading={isLoadingImage} /> */}
            <CarouselImage data={dataImage} isLoading={isLoadingImage} />
          </div>
        ) : mode === "nft" ? (
          <div>
            {isWalletConnected({ isConnected, selectedChain }) === false ? (
              <NoLoginPage />
            ) : (
              <CarouselNft
                selectedChain={selectedChain}
                address={address}
                isConnected={isConnected}
                dataSigner={dataSigner}
                promptNftContract={promptNftContract}
                rentMarketContract={rentMarketContract}
                data={allNftDataArray}
                isLoading={swrIsLoadingRegisterData}
              />
              // <ListNft
              //   selectedChain={selectedChain}
              //   address={address}
              //   isConnected={isConnected}
              //   dataSigner={dataSigner}
              //   promptNftContract={promptNftContract}
              //   rentMarketContract={rentMarketContract}
              //   data={allNftDataArray}
              //   isLoading={swrIsLoadingRegisterData}
              // />
            )}
          </div>
        ) : mode === "own" ? (
          <div>
            {isWalletConnected({ isConnected, selectedChain }) === false ? (
              <NoLoginPage />
            ) : (
              <ListOwn
                selectedChain={selectedChain}
                address={address}
                isConnected={isConnected}
                dataSigner={dataSigner}
                promptNftContract={promptNftContract}
                rentMarketContract={rentMarketContract}
                signTypedDataAsync={signTypedDataAsync}
                data={allOwnDataArray}
                isLoading={isLoadingOwn}
              />
            )}
          </div>
        ) : mode === "rent" ? (
          <div>
            {isWalletConnected({ isConnected, selectedChain }) === false ? (
              <NoLoginPage />
            ) : (
              <ListRent
                selectedChain={selectedChain}
                address={address}
                isConnected={isConnected}
                dataSigner={dataSigner}
                promptNftContract={promptNftContract}
                rentMarketContract={rentMarketContract}
                signTypedDataAsync={signTypedDataAsync}
                data={allMyRentDataArray}
                isLoading={swrIsLoadingRentData}
              />
            )}
          </div>
        ) : null}
      </Box>
    </div>
  );
}

export default List;
