import React from "react";
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useContractRead,
  useSignTypedData,
  useContractEvent,
} from "wagmi";
import { getContract } from "wagmi/actions";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CarouselImage from "@/components/CarouselImage";
import ListImage from "@/components/ListImage";
import CarouselNft from "@/components/CarouselNft";
import ListNft from "@/components/ListNft";
import ListOwn from "@/components/ListOwn";
import CarouselOwn from "@/components/CarouselOwn";
import ListRent from "@/components/ListRent";
import ThemePage from "@/components/ThemePage";
import ConnectWrapper from "@/components/ConnectWrapper";
import LoginWrapper from "@/components/LoginWrapper";
import fetchJson from "@/lib/fetchJson";
import { getChainId, isWalletConnected } from "@/lib/util";
import promptNFTABI from "@/contracts/promptNFT.json";
import rentmarketABI from "@/contracts/rentMarket.json";
const DrawImage = dynamic(() => import("./DrawImage"), {
  ssr: false,
});

function List({ mode, updated, setNewImageCountFunc }) {
  // console.log("call List()");
  // console.log("mode: ", mode);
  // console.log("updated: ", updated);

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const IMAGE_ALL_API_URL = "/api/all";

  //* Image refresh interval time by milli-second unit.
  const IMAGE_REFRESH_INTERVAL_TIME = 60000;

  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  // console.log("RENT_MARKET_CONTRACT_ADDRES: ", RENT_MARKET_CONTRACT_ADDRES);
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;

  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  //* After the image fetching, remove updated flag.
  const imageFetchFinished = React.useRef(false);

  //*---------------------------------------------------------------------------
  //* Wagmi.
  //*---------------------------------------------------------------------------
  //* Handle a new useNetwork instead of useWeb3ModalNetwork hook.
  const { chains, chain: selectedChain } = useNetwork();
  // console.log("selectedChain: ", selectedChain);
  // console.log("chains: ", chains);

  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);

  const {
    data: dataWalletClient,
    isError: isErrorWalletClient,
    isLoading: isLoadingWalletClient,
  } = useWalletClient();
  // console.log("dataWalletClient: ", dataWalletClient);

  //* promptNftContract is used for useSWR params, so use useMemo.
  const promptNftContract = React.useMemo(
    () =>
      getContract({
        address: PROMPT_NFT_CONTRACT_ADDRESS,
        abi: promptNFTABI["abi"],
      }),
    [PROMPT_NFT_CONTRACT_ADDRESS, promptNFTABI["abi"]]
  );
  // console.log("promptNftContract: ", promptNftContract);
  const rentMarketContract = React.useMemo(
    () =>
      getContract({
        address: RENT_MARKET_CONTRACT_ADDRES,
        abi: rentmarketABI["abi"],
      }),
    [RENT_MARKET_CONTRACT_ADDRES, rentmarketABI["abi"]]
  );
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

  //* Change update flag middle function of image useSWR hook.
  function changeUpdateFlag(useSWRNext) {
    // console.log("call changeUpdateFlag()");

    return (key, fetcher, config) => {
      if (imageFetchFinished.current === true) {
        key = {
          url: IMAGE_ALL_API_URL,
        };
      } else {
        key = {
          url: `${IMAGE_ALL_API_URL}?updated=${updated}`,
        };
      }

      const swr = useSWRNext(key, fetcher, config);

      //* After the image fetching finished, remove updated flag.
      if (swr.isLoading !== true && swr.data) {
        imageFetchFinished.current = true;
      }

      return swr;
    };
  }

  const {
    data: dataImage,
    error: errorImage,
    isLoading: isLoadingImage,
    isValidating: isValidatingImage,
    mutate: mutateImage,
  } = useSWR(
    {
      url: `${IMAGE_ALL_API_URL}?updated=${updated}`,
    },
    fetchJson,
    {
      use: [changeUpdateFlag],
      refreshInterval: IMAGE_REFRESH_INTERVAL_TIME,
    }
  );
  // console.log("dataImage: ", dataImage);
  // console.log("isLoadingImage: ", isLoadingImage);
  // console.log("isValidatingImage: ", isValidatingImage);

  //* Get all register data array.
  const {
    data: swrDataRegisterData,
    isError: swrErrorRegisterData,
    isLoading: swrIsLoadingRegisterData,
    isValidating: swrIsValidatingRegisterData,
    status: swrStatusRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllRegisterData",
    // cacheOnBlock: true,
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

  //* Get all my rent data array.
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
    // cacheOnBlock: true,
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

  const {
    data: swrDataCollection,
    isError: swrErrorCollection,
    isLoading: swrIsLoadingCollection,
    isValidating: swrIsValidatingCollection,
    status: swrStatusCollection,
    refetch: swrRefetchCollection,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllCollection",
    // cacheOnBlock: true,
    // watch: true,
  });

  //* Get all my own data array.
  const {
    data: dataAllMyOwnData,
    error: errorAllMyOwnData,
    isLoading: isLoadingAllMyOwnData,
    isValidating: isValidatingAllMyOwnData,
  } = useSWR(
    {
      command: "getAllMyOwnData",
      promptNftContract: promptNftContract,
      ownerAddress: address,
    },
    fetchJson,
    {
      refreshInterval: IMAGE_REFRESH_INTERVAL_TIME,
    }
  );
  // console.log("dataAllMyOwnData: ", dataAllMyOwnData);

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

  React.useEffect(
    function () {
      // console.log("call useEffect()");
      // console.log("dataImage: ", dataImage);
      // console.log(
      //   "dataImage?.newlyUpdatedData?.length: ",
      //   dataImage?.newlyUpdatedData?.length
      // );

      if ((dataImage?.newlyUpdatedData?.length || 0) > 0) {
        setNewImageCountFunc({
          newImageCount: dataImage.newlyUpdatedData.length,
        });
      }

      initialize();
    },
    [dataAllMyOwnData]
  );

  function initialize() {
    // console.log("call initialize()");
    // console.log("swrDataRegisterData: ", swrDataRegisterData);
    // console.log("swrErrorRegisterData: ", swrErrorRegisterData);
    // console.log("swrIsLoadingRegisterData: ", swrIsLoadingRegisterData);
    // console.log("swrIsValidatingRegisterData: ", swrIsValidatingRegisterData);
    // console.log("swrStatusRegisterData: ", swrStatusRegisterData);
    // console.log("swrDataCollection: ", swrDataCollection);
    // console.log("dataAllMyOwnData: ", dataAllMyOwnData);
    // console.log("dataRent: ", dataRent);

    //* Find the register data in registered collection.
    //* After registering data, even though collection is removed, register data remains.
    let registerData;
    if (swrDataRegisterData && swrDataCollection) {
      registerData = swrDataRegisterData.filter(function (registerData) {
        return swrDataCollection.some(function (collection) {
          return (
            collection.collectionAddress.toLowerCase() ===
            registerData.nftAddress.toLowerCase()
          );
        });
      });
    }
    // console.log("registerData: ", registerData);

    //* Find the own nft from registered nft data.
    // console.log("PROMPT_NFT_CONTRACT_ADDRESS: ", PROMPT_NFT_CONTRACT_ADDRESS);
    let ownDataArray;
    if (registerData && dataAllMyOwnData) {
      ownDataArray = registerData.filter(function (nft) {
        // console.log("nft: ", nft);
        // console.log("nft.tokenId: ", nft.tokenId);
        return dataAllMyOwnData.some(function (element) {
          // console.log("element: ", element);
          return (
            nft.tokenId === element.tokenId &&
            nft.nftAddress.localeCompare(
              PROMPT_NFT_CONTRACT_ADDRESS,
              undefined,
              {
                sensitivity: "accent",
              }
            ) === 0
          );
        });
      });
      // console.log("ownDataArray: ", ownDataArray);
      setAllOwnDataArray(ownDataArray.reverse());
    }

    //* Set all rent data.
    let allMyRentDataArray;
    // console.log("swrDataRentData: ", swrDataRentData);
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
    if (registerData) {
      // console.log("registerData: ", registerData);
      const dataNftWithStatusArray = registerData.map(function (nft) {
        let isOwn = false;
        let isRent = false;

        //* Check own status.
        if (ownDataArray) {
          const someResult = ownDataArray.some(function (ownData) {
            return (
              ownData.tokenId === nft.tokenId &&
              ownData.nftAddress.localeCompare(
                PROMPT_NFT_CONTRACT_ADDRESS,
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
              rentData.tokenId === nft.tokenId &&
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

        return {
          ...nft,
          isOwn: isOwn,
          isRent: isRent,
        };
      });

      // console.log("dataNftWithStatusArray: ", dataNftWithStatusArray);
      setAllNftDataArray(dataNftWithStatusArray.reverse());
    }
  }

  return (
    <div>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {mode === "draw" ? (
          <DrawImage />
        ) : mode === "image" ? (
          <ListImage />
        ) : mode === "nft" ? (
          <LoginWrapper>
            <ListNft />
          </LoginWrapper>
        ) : mode === "own" ? (
          <LoginWrapper>
            <ListOwn
              selectedChain={selectedChain}
              address={address}
              isConnected={isConnected}
              dataWalletClient={dataWalletClient}
              promptNftContract={promptNftContract}
              rentMarketContract={rentMarketContract}
              signTypedDataAsync={signTypedDataAsync}
              data={allOwnDataArray}
              isLoading={isLoadingAllMyOwnData}
            />
          </LoginWrapper>
        ) : mode === "rent" ? (
          <LoginWrapper>
            <ListRent
              selectedChain={selectedChain}
              address={address}
              isConnected={isConnected}
              dataWalletClient={dataWalletClient}
              promptNftContract={promptNftContract}
              rentMarketContract={rentMarketContract}
              signTypedDataAsync={signTypedDataAsync}
              data={allMyRentDataArray}
              isLoading={swrIsLoadingRentData}
            />
          </LoginWrapper>
        ) : mode === "theme" ? (
          <div>
            <ThemePage />
          </div>
        ) : null}
      </Box>
    </div>
  );
}

export default List;
