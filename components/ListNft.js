import React from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { useAccount, useSigner, useContract, useSignTypedData } from "wagmi";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardNft from "./CardNft";
import promptNFTABI from "../contracts/promptNFT.json";

function ListNft({ allRegisterDataArray, pageIndex }) {
  // console.log("call ListNft()");

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const NUMBER_PER_PAGE = 5;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  //*---------------------------------------------------------------------------
  //* Define hook variables.
  //*---------------------------------------------------------------------------
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

  //*---------------------------------------------------------------------------
  //* Define state variables.
  //*---------------------------------------------------------------------------
  const [metadata, setMetadata] = React.useState({});

  React.useEffect(
    function () {
      // console.log("call useEffect()");
      // console.log("allRegisterDataArray: ", allRegisterDataArray);
      // console.log("pageIndex: ", pageIndex);
    },
    [allRegisterDataArray, pageIndex, dataSigner, promptNftContract]
  );

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
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
    function NftCardList(props) {
      // console.log("call NftCardList()");

      if (!allRegisterDataArray || allRegisterDataArray.length === 0) {
        return <NoContentPage message={"No prompt NFT."} />;
      }

      return allRegisterDataArray.map(function (nftData, idx) {
        // console.log("nftData: ", nftData);
        // console.log("idx: ", idx);
        // console.log("pageIndex: ", pageIndex);
        //* Check idx is in pagination.
        //* pageIndex starts from 1.
        //* idx starts from 0.
        if (
          idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
          idx < pageIndex * NUMBER_PER_PAGE
        ) {
          return <CardNft nftData={nftData} />;
        }
      });
    },
    [allRegisterDataArray.length, pageIndex]
  );

  return <NftCardList />;
}

export default ListNft;
