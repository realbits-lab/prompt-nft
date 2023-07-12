import React from "react";
import { useAccount, useNetwork, useContractRead } from "wagmi";
import moment from "moment";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import promptNFTABI from "@/contracts/promptNFT.json";
import rentmarketABI from "@/contracts/rentMarket.json";
import { shortenAddress } from "@/lib/util";

export default function ListItemNft({ registerData }) {
  // console.log("call ListItemNft()");
  // console.log("registerData: ", registerData);

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
    args: [registerData?.tokenId],
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
    <Box
      sx={{
        minWidth: CARD_MIN_WIDTH,
        maxWidth: CARD_MAX_WIDTH,
      }}
    >
      <Card sx={{ maxWidth: 345, my: 2 }}>
        <CardHeader
          title={metadata?.name}
          subheader={shortenAddress({
            address: registerData.nftAddress,
            token: Number(registerData.tokenId),
            number: 5,
            withLink: "opensea",
          })}
        />
        <CardMedia component="img" image={metadata?.image} alt="prompt image" />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {metadata?.description}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
