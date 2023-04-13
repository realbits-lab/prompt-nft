import * as React from "react";
import Image from "mui-image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

export default function DrawImage() {
  const DRAW_API_URL = "/api/draw";
  const [imageUrl, setImageUrl] = React.useState();
  const [loadingImage, setLoadingImage] = React.useState(false);

  //*---------------------------------------------------------------------------
  //* Handle text input change.
  //*---------------------------------------------------------------------------
  const [formValue, setFormValue] = React.useState({
    prompt: "",
    negativePrompt: "",
  });
  const { prompt, negativePrompt } = formValue;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValue((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

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

    //* Set image url from image generation server.
    setImageUrl(jsonResponse.imageUrl[0]);
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
          defaultValue=""
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
          defaultValue=""
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
        sx={{
          "& .MuiTextField-root": { m: 1 },
        }}
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
            width={"80vw"}
            fit="contain"
            duration={100}
            easing="ease"
            shiftDuration={100}
          />
        )}
      </Box>
    </>
  );
}
