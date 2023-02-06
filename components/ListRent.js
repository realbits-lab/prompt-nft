import React from "react";
import {
  Web3Button,
  Web3NetworkSwitch,
  useWeb3ModalNetwork,
} from "@web3modal/react";
import { useAccount, useSigner, useContract } from "wagmi";
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
import promptNFTABI from "../contracts/promptNFT.json";
import rentmarketABI from "../contracts/rentMarket.json";
import CardRent from "./CardRent";

function ListRent() {
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

  //* Get all my rent data array.
  const { data, error, isLoading } = useSWR([
    "getAllMyRentData",
    FetchType.PROVIDER,
    rentMarketContract,
    dataSigner,
    "",
    address,
  ]);

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

  const RentCardList = React.useCallback(
    function RentCardList(props) {
      if (isLoading === true) {
        return <LoadingPage />;
      }

      if (!data) {
        return (
          <NoContentPage
            message={"You have not yet rented any image prompt NFT."}
          />
        );
      }

      return (
        <div>
          <Box sx={{ marginTop: 10 }} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(
                data.myRentDataArrayResult.length / NUMBER_PER_PAGE
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
          {data.myRentDataArrayResult.map((nftData, idx) => {
            // console.log("nftData: ", nftData);
            // console.log("idx: ", idx);
            // console.log("pageIndex: ", pageIndex);
            // Check idx is in pagination.
            // pageIndex.rent starts from 1.
            // idx starts from 0.
            if (
              idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
              idx < pageIndex * NUMBER_PER_PAGE
            ) {
              return <CardRent nftData={nftData} />;
            }
          })}
        </div>
      );
    },
    [data, pageIndex]
  );

  return <RentCardList />;
}

export default ListRent;
