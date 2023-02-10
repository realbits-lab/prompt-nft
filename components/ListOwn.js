import React from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import { FetchType } from "../lib/fetchJson";
import CardOwn from "./CardOwn";

function ListOwn({
  selectedChain,
  address,
  isConnected,
  dataSigner,
  promptNftContract,
  rentMarketContract,
  signTypedDataAsync,
}) {
  // console.log("call OwnCardList()");
  // console.log("allMyOwnDataCount: ", allMyOwnDataCount);
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const NUMBER_PER_PAGE = 5;

  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  const [pageIndex, setPageIndex] = React.useState(1);
  const handlePageIndexChange = (event, value) => {
    setPageIndex(value);
  };

  //* Get all my own data array.
  const { data, error, isLoading, isValidating } = useSWR({
    command: "getAllMyOwnData",
    promptNftContract: promptNftContract,
    signer: dataSigner,
    ownerAddress: address,
  });
  // console.log("data: ", data);
  // console.log("isLoading: ", isLoading);
  // console.log("isValidating: ", isValidating);

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
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

  const OwnCardList = React.useCallback(
    function OwnCardList() {
      if (isLoading === true) {
        return <LoadingPage />;
      }

      if (!data) {
        return (
          <NoContentPage message={"You do not have any image prompt NFT."} />
        );
      }

      return (
        <div>
          <Box sx={{ marginTop: 10 }} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(
                data.myOwnDataArrayResult.length / NUMBER_PER_PAGE
              )}
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
          {data.myOwnDataArrayResult.map((nftData, idx) => {
            // console.log("nftData: ", nftData);
            // console.log("idx: ", idx);
            // console.log("pageIndex: ", pageIndex);
            // Check idx is in pagination.
            // pageIndex.own starts from 1.
            // idx starts from 0.
            if (
              idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
              idx < pageIndex * NUMBER_PER_PAGE
            ) {
              return (
                <CardOwn
                  nftData={nftData}
                  key={idx}
                  dataSigner={dataSigner}
                  address={address}
                  isConnected={isConnected}
                  rentMarketContract={rentMarketContract}
                  selectedChain={selectedChain}
                  promptNftContract={promptNftContract}
                  signTypedDataAsync={signTypedDataAsync}
                />
              );
            }
          })}
        </div>
      );
    },
    [data, pageIndex]
  );

  return <OwnCardList />;
}

export default ListOwn;
