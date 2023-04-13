import * as React from "react";
import { useRouter } from "next/router";
import Image from "mui-image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

export default function DrawImage() {
  const DRAW_API_URL = "/api/draw";
  const POST_API_URL = "/api/post";
  const DISCORD_BOT_TOKEN = process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN;
  const [imageUrl, setImageUrl] = React.useState("");
  const [loadingImage, setLoadingImage] = React.useState(false);
  const router = useRouter();

  //*---------------------------------------------------------------------------
  //* Handle text input change.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    prompt: "",
    negativePrompt: "",
    modelName: "",
  });
  const { prompt, negativePrompt, modelName } = formValue;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValue((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  async function fetchImage() {
    setLoadingImage(true);

    //* Make stable diffusion api option by json.
    const jsonData = {
      prompt: prompt,
      negative_prompt: negativePrompt,
    };

    const fetchResponse = await fetch(DRAW_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });
    // console.log("fetchResponse: ", fetchResponse);

    //* Check error response.
    if (fetchResponse.status !== 200) {
      console.error("jsonResponse.status is not success.");
      setLoadingImage(false);
      return;
    }

    //* Get the stable diffusion api result by json.
    const jsonResponse = await fetchResponse.json();
    // console.log("jsonResponse: ", jsonResponse);
    const imageUrlResponse = jsonResponse.imageUrl[0];
    const meta = jsonResponse.meta;
    console.log("imageUrlResponse: ", imageUrlResponse);
    console.log("meta.negative_prompt: ", meta.negative_prompt);
    console.log("meta.prompt: ", meta.prompt);
    console.log("meta.model: ", meta.model);

    //* Change prompt, negativePrompt, modelName.
    let event = {};
    event.target = { name: "prompt", value: meta.prompt };
    handleChange(event);
    event.target = { name: "negativePrompt", value: meta.negative_prompt };
    handleChange(event);
    event.target = { name: "modelName", value: meta.model };
    handleChange(event);

    //* Post imageUrlResponse and prompt to prompt server.
    const imageUploadResponse = await fetch(POST_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: meta.prompt,
        negativePrompt: meta.negative_prompt,
        imageUrl: imageUrlResponse,
        discordBotToken: DISCORD_BOT_TOKEN,
      }),
    });
    console.log("imageUploadResponse: ", imageUploadResponse);

    if (imageUploadResponse.status !== 200) {
      console.error(`imageUploadResponse: ${imageUploadResponse}`);
      setLoadingImage(false);
      return;
    }

    //* Set image url from image generation server.
    setImageUrl(imageUrlResponse);
    setLoadingImage(false);
  }

  return (
    <>
      <Box
        component="form"
        sx={{
          marginTop: 10,
        }}
        noValidate
        autoComplete="off"
        display="flex"
        flexDirection="column"
      >
        <TextField
          required
          id="outlined-required"
          label="prompt"
          error={prompt === "" ? true : false}
          name="prompt"
          value={prompt}
          onChange={handleChange}
          helperText="Write prompt."
          style={{
            width: "100%",
            paddingRight: "15px",
          }}
          disabled={loadingImage}
          autoComplete="on"
        />
        <TextField
          required
          id="outlined-required"
          label="negative prompt"
          error={negativePrompt === "" ? true : false}
          name="negativePrompt"
          value={negativePrompt}
          onChange={handleChange}
          helperText="Write negative prompt."
          style={{
            width: "100%",
            paddingRight: "15px",
          }}
          disabled={loadingImage}
          autoComplete="on"
        />
        <Button
          variant="contained"
          onClick={fetchImage}
          sx={{
            m: 1,
          }}
          disabled={loadingImage}
        >
          Draw
        </Button>
      </Box>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {loadingImage ? (
          <CircularProgress />
        ) : (
          <Image
            src={imageUrl}
            height={"50vh"}
            fit="contain"
            duration={100}
            easing="ease"
            shiftDuration={100}
          />
        )}
        <Button
          variant="contained"
          onClick={() => {
            //* Get URI encoded string.
            const imageUrlEncodedString = encodeURIComponent(imageUrl);
            const promptEncodedString = encodeURIComponent(prompt);
            const negativePromptEncodedString =
              encodeURIComponent(negativePrompt);
            const link = `/mint/${promptEncodedString}/${imageUrlEncodedString}/${negativePromptEncodedString}`;
            router.push(link);
          }}
          sx={{
            m: 1,
          }}
          disabled={loadingImage}
        >
          Mint
        </Button>
      </Box>
    </>
  );
}
