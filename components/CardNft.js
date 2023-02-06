import { useSigner, useContract } from "wagmi";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import promptNFTABI from "../contracts/promptNFT.json";
import { FetchType } from "../lib/fetchJson";
import { getUniqueKey } from "../lib/util";

function CardNft({ nftData }) {
  console.log("call CardNft()");

  //*---------------------------------------------------------------------------
  //* Define constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
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
  const promptNftContract = useContract({
    address: process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });
  const {
    data: metadataData,
    error: metadataError,
    isValidating: metadataIsValidating,
  } = useSWR([
    "getMetadata",
    FetchType.PROVIDER,
    promptNftContract,
    dataSigner,
    nftData.tokenId,
  ]);

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  return (
    <Box
      sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }}
      key={getUniqueKey()}
    >
      <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
        <CardMedia
          component="img"
          image={metadataData ? metadataData.image : ""}
          onError={handleCardMediaImageError}
        />
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            token id: {nftData.tokenId.toNumber()}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            name: {metadataData ? metadataData.name : ""}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            description: {metadataData ? metadataData.description : ""}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            rent fee: {nftData.rentFee / Math.pow(10, 18)} matic
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={async () => {
              if (mode === "nft" && isWalletConnected() === false) {
                // console.log("chainName: ", getChainName({ chainId }));
                setSnackbarSeverity("warning");
                setSnackbarMessage(
                  `Change blockchain network to ${process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}`
                );
                setOpenSnackbar(true);
                return;
              }

              if (!rentMarketContract || !dataSigner) {
                console.error(
                  "rentMarketContract or signer is null or undefined."
                );
                return;
              }

              //* Rent this nft with rent fee.
              try {
                const tx = await rentMarketContract
                  .connect(dataSigner)
                  .rentNFT(
                    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
                    nftData.tokenId,
                    process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS,
                    {
                      value: nftData.rentFee,
                    }
                  );
                const txResult = await tx.wait();
              } catch (error) {
                console.error(error);
                setSnackbarSeverity("error");
                setSnackbarMessage(
                  error.data.message ? error.data.message : error.message
                );
                setOpenSnackbar(true);
              }
            }}
          >
            RENT
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

export default CardNft;
