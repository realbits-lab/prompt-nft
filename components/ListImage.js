import React from "react";
import { useWeb3ModalNetwork } from "@web3modal/react";
import { useAccount, useSigner, useContract, useSignTypedData } from "wagmi";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import promptNFTABI from "../contracts/promptNFT.json";
import rentmarketABI from "../contracts/rentMarket.json";
import CardImage from "./CardImage";

function ListImage() {
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const API_ALL_URL = process.env.NEXT_PUBLIC_API_ALL_URL;
  const NUMBER_PER_PAGE = 5;

  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  const [pageIndex, setPageIndex] = React.useState(1);
  const handlePageIndexChange = (event, value) => {
    setPageIndex(value);
  };

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
    address: process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });
  // console.log("promptNftContract: ", promptNftContract);
  const rentMarketContract = useContract({
    address: process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS,
    abi: rentmarketABI["abi"],
  });
  // console.log("rentMarketContract: ", rentMarketContract);

  //* Get all image data array.
  const { data, error, isLoading, isValidating, mutate } = useSWR([
    API_ALL_URL,
  ]);
  console.log("data: ", data);
  console.log("isLoading: ", isLoading);
  console.log("isValidating: ", isValidating);

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
        <div>
          <Box sx={{ marginTop: 10 }} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(data.data.length / NUMBER_PER_PAGE)}
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
          {data.data.map((imageData, idx) => {
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
              return <CardImage imageData={imageData} key={idx} />;
            }
          })}
        </div>
      );
    },
    [data, pageIndex, isLoading]
  );

  return <ImageCardList />;
}

export default ListImage;
