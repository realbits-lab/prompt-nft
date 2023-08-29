import React from "react";
import moment from "moment";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import fetchJson from "@/lib/fetchJson";
import { truncate } from "@/lib/util";

function ListImage() {
  // console.log("call ListImage()");

  const LATEST_IMAGE_ALL_API_URL = "/api/latest-image-list";

  //* Image refresh interval time by milli-second unit.
  const IMAGE_REFRESH_INTERVAL_TIME = 60000;

  const CARD_MARGIN_TOP = "80px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const TRUNCATE_COUNT = 8;

  //* Get the latest image list.
  const {
    data: dataLatestImage,
    error: errorLatestImage,
    isLoading: isLoadingLatestImage,
    isValidating: isValidatingLatestImage,
    mutate: mutateLatestImage,
  } = useSWR(
    {
      url: LATEST_IMAGE_ALL_API_URL,
    },
    fetchJson,
    {
      refreshInterval: IMAGE_REFRESH_INTERVAL_TIME,
    }
  );
  // console.log("dataLatestImage: ", dataLatestImage);

  return (
    <>
      <Box
        sx={{
          minWidth: CARD_MIN_WIDTH,
          maxWidth: CARD_MAX_WIDTH,
          marginTop: CARD_MARGIN_TOP,
        }}
      >
        {dataLatestImage?.data.map((imageData, idx) => {
          return (
            <Card sx={{ maxWidth: 345, my: 2 }} key={idx}>
              <CardHeader subheader={moment(imageData.createdAt).fromNow()} />
              <CardMedia
                component="img"
                image={imageData.imageUrl}
                alt="prompt image"
              />
            </Card>
          );
        })}
      </Box>
    </>
  );
}

export default ListImage;
