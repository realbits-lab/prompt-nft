import React from "react";
import { useRouter } from "next/router";
import { useAccount, useNetwork } from "wagmi";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Mint from "../../components/Mint";

const MintPage = () => {
  //*---------------------------------------------------------------------------
  //* Define constance variables.
  //*---------------------------------------------------------------------------
  const GET_API_URL = "/api/get";
  const { chains, chain: selectedChain } = useNetwork();
  // console.log("selectedChain: ", selectedChain);
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);

  //*---------------------------------------------------------------------------
  //* Define other variables.
  //*---------------------------------------------------------------------------
  const router = useRouter();
  const [prompt, setPrompt] = React.useState();
  const [negativePrompt, setNegativePrompt] = React.useState();
  const [imageUrl, setImageUrl] = React.useState();
  const [modelName, setModelName] = React.useState();
  const [errorStatus, setErrorStatus] = React.useState();

  //* For async function, we use useEffect function.
  React.useEffect(() => {
    // console.log("call useEffect()");

    const initialize = async function () {
      // console.log("call initialize()");

      const params = router.query.mint;
      // console.log("router.query: ", router.query);
      // console.log("router.query.length: ", router.query.length);
      // console.log("params: ", params);

      if (!params) {
        return;
      }

      //* Check params error.
      if (
        params !== undefined &&
        (Array.isArray(params) === false ||
          (params.length !== 2 && params.length !== 3))
      ) {
        setErrorStatus(
          "Invalid paramters. You should make a url like /mint/{prompt}/{image_url}"
        );
        return;
      }

      //* Get prompt and imageUrl.
      const inputPrompt = params[0];
      const inputImageUrl = params[1];
      let inputNegativePrompt;
      if (params.length === 3) {
        inputNegativePrompt = params[2];
      } else {
        inputNegativePrompt = "";
      }

      if (params.length === 4) {
        setModelName(params[3]);
      }
      // console.log("inputPrompt: ", inputPrompt);
      // console.log("inputImageUrl: ", inputImageUrl);

      //* Check imageUrl and prompt was saved in sqlite already.
      //* Mint NFT only in case of pre-saved image.
      const imageUrlEncodedString = encodeURIComponent(inputImageUrl);
      const fetchImageDatabaseResponse = await fetch(
        `${GET_API_URL}/${imageUrlEncodedString}`
      );
      console.log("fetchImageDatabaseResponse: ", fetchImageDatabaseResponse);

      if (fetchImageDatabaseResponse.status !== 200) {
        setErrorStatus(
          "Invalid image url and prompts. Image and prompt should be created in discord bot."
        );
        return;
      }

      const fetchImageDatabaseResponseJson =
        await fetchImageDatabaseResponse.json();
      console.log(
        "fetchImageDatabaseResponseJson: ",
        fetchImageDatabaseResponseJson
      );
      if (fetchImageDatabaseResponseJson.data.isEncrypted === true) {
        setErrorStatus("Image was already minted.");
        return;
      }

      setPrompt(inputPrompt);
      setNegativePrompt(inputNegativePrompt);
      setImageUrl(inputImageUrl);
      //* TODO: Track page mounted status.
      setErrorStatus(undefined);
    };
    initialize();
  }, [router.query]);
  // console.log("errorStatus: ", errorStatus);

  function ErrorPage({ inputErrorStatus }) {
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
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
          <CardMedia
            component="img"
            image={PLACEHOLDER_IMAGE_URL}
            height={300}
            onError={handleCardMediaImageError}
          />
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <Typography variant="h5" color={"orange"}>
              {errorStatus}
            </Typography>
            <Typography variant="caption">
              Thanks for trying to mint your image with prompt. But error
              happened to post image url and prompt.
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {errorStatus ? (
        <ErrorPage errorStatus={errorStatus} />
      ) : (
        <Mint
          inputImageUrl={imageUrl}
          inputPrompt={prompt}
          inputNegativePrompt={negativePrompt}
          inputModelName={modelName}
        />
      )}
    </Box>
  );
};

export default MintPage;
