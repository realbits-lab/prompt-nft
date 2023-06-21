import React from "react";
import useSWR from "swr";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import fetchJson from "../lib/fetchJson";

function ListImage() {
  // console.log("call ListImage()");
  const LATEST_IMAGE_ALL_API_URL = "/api/latest-image-list";
  //* Image refresh interval time by milli-second unit.
  const IMAGE_REFRESH_INTERVAL_TIME = 60000;
  const CARD_MARGIN_TOP = "80px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const theme = useTheme();

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
  console.log("dataLatestImage: ", dataLatestImage);

  return (
    <>
      <Box
        sx={{
          minWidth: CARD_MIN_WIDTH,
          maxWidth: CARD_MAX_WIDTH,
          marginTop: CARD_MARGIN_TOP,
        }}
      >
        {dataLatestImage?.data.map((e) => {
          return (
            <Card sx={{ display: "flex", margin: "10px" }}>
              <CardMedia
                component="img"
                sx={{ width: 80 }}
                image={e.imageUrl}
                alt="prompt image"
              />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    component="div"
                    noWrap
                  >
                    {e.prompt}
                  </Typography>
                </CardContent>
                <Box></Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </>
  );
}

export default ListImage;
