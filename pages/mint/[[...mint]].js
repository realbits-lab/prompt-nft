import React from "react";
import { useRouter } from "next/router";
import {
  Web3Button,
  Web3NetworkSwitch,
  useWeb3ModalNetwork,
} from "@web3modal/react";
import { useAccount } from "wagmi";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Mint from "../../components/Mint";
import { getChainName } from "../../lib/util";

function ErrorPage({ errorStatus }) {
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    // console.log("imageUrl: ", imageUrl);
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  return (
    <Box
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
        <CardMedia
          component="img"
          image={PLACEHOLDER_IMAGE_URL}
          onError={handleCardMediaImageError}
        />
        <CardContent
          sx={{
            padding: "10",
          }}
        >
          <Typography variant="caption">
            Thanks for trying to mint your image with prompt. But error happened
            to post image url and prompt. {errorStatus}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={async () => {}}>
            <Typography variant="h5">
              <Link href="/list">Go to view other images</Link>
            </Typography>
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

const MintPage = () => {
  //*---------------------------------------------------------------------------
  //* Define constance variables.
  //*---------------------------------------------------------------------------
  const GET_API_URL = "/api/get";
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  const { selectedChain, setSelectedChain } = useWeb3ModalNetwork();
  // console.log("selectedChain: ", selectedChain);
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);

  //*---------------------------------------------------------------------------
  //* Define other variables.
  //*---------------------------------------------------------------------------
  const router = useRouter();
  const [prompt, setPrompt] = React.useState();
  const [imageUrl, setImageUrl] = React.useState();
  const [errorStatus, setErrorStatus] = React.useState();

  //* For async function, we use useEffect function.
  React.useEffect(() => {
    console.log("call useEffect()");

    const initialize = async () => {
      // console.log("router.query: ", router.query);
      const params = router.query.mint;
      console.log("params: ", params);

      // Check params error.
      if (
        params === undefined ||
        Array.isArray(params) === false ||
        params.length !== 2
      ) {
        setErrorStatus(
          "Invalid paramters. You should make a url like /mint/{prompt}/{image_url}"
        );
        return;
      }

      //* Get prompt and imageUrl.
      const inputPrompt = params[0];
      const inputImageUrl = params[1];
      // console.log("inputPrompt: ", inputPrompt);
      // console.log("inputImageUrl: ", inputImageUrl);

      // Check imageUrl and prompt was saved in sqlite already.
      const promptEncodedString = encodeURIComponent(inputPrompt);
      const imageUrlEncodedString = encodeURIComponent(inputImageUrl);
      const response = await fetch(
        `${GET_API_URL}/${promptEncodedString}/${imageUrlEncodedString}`
      );
      console.log("response: ", response);

      if (response.status !== 200) {
        setErrorStatus(
          "Invalid image url and prompts. Image and prompt should be created in discord bot."
        );
        return;
      }

      setPrompt(inputPrompt);
      setImageUrl(inputImageUrl);
      //* TODO: Track page mounted status.
      setErrorStatus(undefined);
    };
    initialize();
  }, [router.query]);
  // console.log("errorStatus: ", errorStatus);

  const buildMintPage = () => {
    console.log("call buildMintPage()");

    if (
      isConnected === false ||
      selectedChain === undefined ||
      getChainName({ chainId: selectedChain.id }) !==
        getChainName({ chainId: BLOCKCHAIN_NETWORK })
    ) {
      console.log("isConnected: ", isConnected);
      console.log("selectedChain: ", selectedChain);
      if (selectedChain) {
        console.log(
          "getChainName({ chainId: selectedChain.id }): ",
          getChainName({ chainId: selectedChain.id })
        );
      }
      console.log("BLOCKCHAIN_NETWORK: ", BLOCKCHAIN_NETWORK);
      console.log(
        "getChainName({ chainId: BLOCKCHAIN_NETWORK }): ",
        getChainName({ chainId: BLOCKCHAIN_NETWORK })
      );

      return (
        <Box
          sx={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Button variant="text">
            Click the Connect Wallet or Wrong Network button
          </Button>
          {buildContentPage()}
        </Box>
      );
    }

    return buildContentPage();
  };

  function buildContentPage() {
    if (errorStatus === undefined) {
      return <Mint inputImageUrl={imageUrl} inputPrompt={prompt} />;
    } else {
      return <ErrorPage errorStatus={errorStatus} />;
    }
  }

  return (
    <Grid container direction="column">
      <Grid item>
        <Grid container justifyContent="space-around" marginTop={2}>
          <Grid item>
            <Web3Button />
          </Grid>
          <Grid item>
            <Web3NetworkSwitch />
          </Grid>
        </Grid>
      </Grid>
      <Grid item>{buildMintPage()}</Grid>
    </Grid>
  );
};

export default MintPage;
