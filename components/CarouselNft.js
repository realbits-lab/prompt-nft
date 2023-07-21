import React from "react";
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
import CardNft from "@/components/CardNft";
import rentmarketABI from "@/contracts/rentMarket.json";

function CarouselNft() {
  // console.log("call CarouselNft()");

  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;

  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  //*---------------------------------------------------------------------------
  //* Wagmi hook
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const { chains, chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const {
    data: dataAllRegisterData,
    isError: errorAllRegisterData,
    isLoading: isLoadingAllRegisterData,
    isValidating: isValidatingAllRegisterData,
    status: statusAllRegisterData,
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

  //* Pagination.
  const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = dataAllRegisterData?.length || 0;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

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

      if (isLoadingAllRegisterData === true) {
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
            {dataAllRegisterData.toReversed().map(function (nftData, index) {
              return (
                <div key={index}>
                  {Math.abs(activeStep - index) <= 2 ? (
                    <CardNft nftData={nftData} />
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
    [activeStep, maxSteps, dataAllRegisterData, isLoadingAllRegisterData]
  );

  return <NftCardList />;
}

export default CarouselNft;
