import React from "react";
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useContractRead,
  useSignTypedData,
  useContractEvent,
} from "wagmi";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import CardNft from "@/components/CardNft";
import rentmarketABI from "@/contracts/rentMarket.json";
import ListImteNft from "@/components/ListItemNft";
import ListItemNft from "./ListItemNft";

function ListNft() {
  // console.log("call ListNft()");

  //*---------------------------------------------------------------------------
  //* Wagmi.
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;
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

  if (isLoadingAllRegisterData === true) {
    return <LoadingPage />;
  }

  return (
    <>
      <Box sx={{ marginTop: 10 }} display="flex" justifyContent="center">
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {dataAllRegisterData.map((registerData, idx) => {
            console.log("registerData.nftAddress: ", registerData.nftAddress);
            console.log(
              "PROMPT_NFT_CONTRACT_ADDRESS: ",
              PROMPT_NFT_CONTRACT_ADDRESS
            );

            //* Filter the current prompt NFT contract address.
            if (
              PROMPT_NFT_CONTRACT_ADDRESS.toLowerCase() ===
              registerData.nftAddress.toLowerCase()
            ) {
              return <ListItemNft registerData={registerData} key={idx} />;
            }
          })}
        </List>
      </Box>
    </>
  );
}

export default ListNft;
