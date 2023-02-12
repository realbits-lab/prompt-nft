import React from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
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
import Pagination from "@mui/material/Pagination";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import CardNft from "./CardNft";

function CarouselNft({
  dataSigner,
  rentMarketContract,
  promptNftContract,
  selectedChain,
  address,
  isConnected,
  data,
  isLoading,
}) {
  console.log("call CarouselNft()");
  console.log("data: ", data);

  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;

  const CARD_MARGIN_TOP = "60px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 10;

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
        <Grid container spacing={2} justifyContent="space-around" padding={2}>
          <Grid item>
            <Web3Button />
          </Grid>
          <Grid item>
            <Web3NetworkSwitch />
          </Grid>
        </Grid>
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
      if (isLoading === true) {
        return <LoadingPage />;
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
                      key={index}
                      dataSigner={dataSigner}
                      address={address}
                      isConnected={isConnected}
                      rentMarketContract={rentMarketContract}
                      selectedChain={selectedChain}
                      promptNftContract={promptNftContract}
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
