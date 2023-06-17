import React from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useContractRead,
  useSignTypedData,
  useContractEvent,
} from "wagmi";
import SwipeableViews from "react-swipeable-views";
import { bindKeyboard } from "react-swipeable-views-utils";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import MobileStepper from "@mui/material/MobileStepper";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import CardNft from "./CardNft";

function CarouselNft({
  dataWalletClient,
  rentMarketContract,
  promptNftContract,
  selectedChain,
  address,
  isConnected,
  data,
  isLoading,
  signTypedDataAsync,
}) {
  // console.log("call CarouselNft()");
  // console.log("data: ", data);
  // console.log("isConnected: ", isConnected);
  // console.log("isLoading: ", isLoading);
  // console.log("signTypedDataAsync: ", signTypedDataAsync);

  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;

  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = data?.length || 0;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  //*---------------------------------------------------------------------------
  //* Wagmi hook
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const { chains, chain: selectedChain } = useNetwork();
  const { address, isConnected } = useAccount();
  const {
    data: dataRegisterData,
    isError: errorRegisterData,
    isLoading: isLoadingRegisterData,
    isValidating: isValidatingRegisterData,
    status: statusRegisterData,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllRegisterData",
    watch: true,
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
    data: dataAllCollection,
    isError: errorAllCollection,
    isLoading: isLoadingAllCollection,
    isValidating: isValidatingAllCollection,
    status: statusAllCollection,
    refetch: refetchAllCollection,
  } = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllCollection",
    watch: true,
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

  function initialize() {
    //* Find the register data in registered collection.
    //* After registering data, even though collection is removed, register data remains.
    let registerData;
    if (dataRegisterData && dataAllCollection) {
      registerData = dataRegisterData.filter(function (registerData) {
        return dataAllCollection.some(function (collection) {
          return (
            collection.collectionAddress.toLowerCase() ===
            registerData.nftAddress.toLowerCase()
          );
        });
      });
    }
    // console.log("registerData: ", registerData);

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
              ownData.nftAddress.toLowerCase() ===
                PROMPT_NFT_CONTRACT_ADDRESS.toLowerCase()
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
              rentData.renteeAddress.toLowerCase() === address.toLowerCase()
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
        <CircularProgress sx={{ width: "50vw" }} />
      </Box>
    );
  }

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
        {/* <Grid container spacing={2} justifyContent="space-around" padding={2}>
          <Grid item>
            <Web3Button />
          </Grid>
          <Grid item>
            <Web3NetworkSwitch />
          </Grid>
        </Grid> */}
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
  }

  const NftCardList = React.useCallback(
    function NftCardList() {
      if (!isConnected) {
        return (
          <NoContentPage
            message={`You are not connected to blockchain. Connect to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK} network.`}
          />
        );
      }

      if (!data) {
        return (
          <NoContentPage
            message={
              "This service is just started. Soon, image list with prompt will be updated."
            }
          />
        );
      }

      if (isLoading === true) {
        return <LoadingPage />;
      }

      // console.log("activeStep: ", activeStep);
      return (
        <>
          <BindKeyboardSwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
          >
            {data.map(function (nftData, index) {
              return (
                <div key={index}>
                  {Math.abs(activeStep - index) <= 2 ? (
                    <CardNft
                      nftData={nftData}
                      dataWalletClient={dataWalletClient}
                      address={address}
                      isConnected={isConnected}
                      rentMarketContract={rentMarketContract}
                      selectedChain={selectedChain}
                      promptNftContract={promptNftContract}
                      signTypedDataAsync={signTypedDataAsync}
                    />
                  ) : null}
                </div>
              );
            })}
          </BindKeyboardSwipeableViews>

          <MobileStepper
            steps={maxSteps}
            variant="progress"
            activeStep={activeStep}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
              >
                Next
                {theme.direction === "rtl" ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                {theme.direction === "rtl" ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
          />
        </>
      );
    },
    [activeStep, maxSteps, data, isLoading]
  );

  return <NftCardList />;
}

export default CarouselNft;
