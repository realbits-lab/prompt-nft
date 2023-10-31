import React from "react";
import { useAccount, useNetwork, useContractRead } from "wagmi";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import rentmarketABI from "@/contracts/rentMarket.json";
import WalletProfile from "@/components/WalletProfile";
import ListItemNft from "@/components/ListItemNft";

function ListNft() {
  // console.log("call ListNft()");

  //*---------------------------------------------------------------------------
  //* Wagmi.
  //*---------------------------------------------------------------------------
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;

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
      <WalletProfile />

      <Box display="flex" justifyContent="center">
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {dataAllRegisterData.toReversed().map((registerData, idx) => {
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
