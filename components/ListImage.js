import React from "react";
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
import CardImage from "./CardImage";

function ListImage({ allImageDataArray, getAllIsValidating }) {
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const NUMBER_PER_PAGE = 5;

  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  const [pageIndex, setPageIndex] = React.useState(1);
  const handlePageIndexChange = (event, value) => {
    setPageIndex(value);
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
    // console.log("call handleCardMediaImageError()");
    // console.log("imageUrl: ", imageUrl);
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  const ImageCardList = React.useCallback(
    function ImageCardList() {
      if (getAllIsValidating === true) {
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

      return (
        <div>
          {allImageDataArray.map((imageData, idx) => {
            // console.log("idx: ", idx);
            // console.log("pageIndex.image: ", pageIndex.image);
            // console.log("imageData: ", imageData);
            // Check idx is in pagination.
            // pageIndex.image starts from 1.
            // idx starts from 0.
            if (
              idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
              idx < pageIndex * NUMBER_PER_PAGE
            ) {
              return <CardImage imageData={imageData} />;
            }
          })}
          <Box sx={{ m: 5 }} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(allImageDataArray.length / NUMBER_PER_PAGE)}
              page={pageIndex}
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
        </div>
      );
    },
    [allImageDataArray, pageIndex, getAllIsValidating]
  );

  return <ImageCardList />;
}

export default ListImage;
