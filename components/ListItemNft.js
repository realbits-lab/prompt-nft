import React from "react";
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useContractRead,
  useSignTypedData,
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useWatchPendingTransactions,
} from "wagmi";
import moment from "moment";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import promptNFTABI from "@/contracts/promptNFT.json";
import rentmarketABI from "@/contracts/rentMarket.json";
import { shortenAddress } from "@/lib/util";

export default function ListItemNft({ nft }) {
  // console.log("call ListItemNft()");
  // console.log("nft: ", nft);

  const CARD_MARGIN_TOP = "80px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  //*---------------------------------------------------------------------------
  //* Wagmi hook
  //*---------------------------------------------------------------------------
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;
  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const [metadata, setMetadata] = React.useState();
  const { chains, chain: selectedChain } = useNetwork();
  const { address, isConnected } = useAccount();

  const {
    data: dataTokenURI,
    isError: isErrorTokenURI,
    isLoading: isLoadingTokenURI,
    isValidating: isValidatingTokenURI,
    status: statusTokenURI,
  } = useContractRead({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI.abi,
    functionName: "tokenURI",
    args: [nft?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      fetch(data).then((fetchResult) =>
        fetchResult.blob().then((tokenMetadata) =>
          tokenMetadata.text().then((metadataJsonTextData) => {
            // console.log("metadataJsonTextData: ", metadataJsonTextData);
            const metadata = JSON.parse(metadataJsonTextData);
            // console.log("metadata: ", metadata);
            setMetadata(metadata);
          })
        )
      );
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

  return (
    // <>
    //   <ListItem alignItems="flex-start">
    //     <ListItemAvatar>
    //       <Avatar alt="nft image" src={metadata?.image} />
    //     </ListItemAvatar>
    //     <ListItemText
    //       primary={metadata?.name}
    //       secondary={
    //         <React.Fragment>
    //           <Typography
    //             sx={{ display: "inline" }}
    //             component="span"
    //             variant="body2"
    //             color="text.primary"
    //           >
    //             {metadata?.description}
    //           </Typography>
    //           {" — "}{" "}
    //           {shortenAddress({
    //             address: nft?.nftAddress,
    //             withLink: "opensea",
    //           })}
    //         </React.Fragment>
    //       }
    //     />
    //   </ListItem>
    //   <Divider variant="inset" component="li" />
    // </>
    <Box
      sx={{
        minWidth: CARD_MIN_WIDTH,
        maxWidth: CARD_MAX_WIDTH,
      }}
    >
      <Card sx={{ display: "flex", margin: "10px" }}>
        <CardMedia
          component="img"
          sx={{ width: "12vw" }}
          image={metadata?.image}
          alt="prompt image"
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              component="div"
              noWrap
            >
              {metadata?.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              noWrap
            >
              {metadata?.description}
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}
