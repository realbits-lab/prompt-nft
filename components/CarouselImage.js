import React from "react";
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
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

function CarouselImage({ data, isLoading }) {
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;

  const CARD_MARGIN_TOP = "60px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 10;

  const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = data?.data?.length || 0;

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

  function handleCardMediaImageError(e) {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  const ImageCardList = React.useCallback(
    function ImageCardList() {
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
            {data.data.map(function (imageData, index) {
              return (
                <div key={index}>
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
                    {Math.abs(activeStep - index) <= 2 ? (
                      <Card>
                        {imageData ? (
                          <CardMedia
                            component="img"
                            image={imageData ? imageData.imageUrl : ""}
                            onError={handleCardMediaImageError}
                            sx={{
                              objectFit: "cover",
                              width: "90vw",
                              height: "50vh",
                            }}
                          />
                        ) : (
                          <Skeleton
                            variant="rounded"
                            width={CARD_MIN_WIDTH}
                            height={CARD_MIN_WIDTH}
                          />
                        )}
                        <CardContent
                          sx={{
                            width: "90vw",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: 14 }}
                            color="text.secondary"
                            gutterBottom
                          >
                            {imageData.prompt}
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : null}
                  </Box>
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

  return <ImageCardList />;
}

export default CarouselImage;
