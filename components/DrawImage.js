import * as React from "react";
import Image from "mui-image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function DrawImage() {
  const DRAW_API_URL = "/api/draw";
  const [imageUrl, setImageUrl] = React.useState();

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

    //* Get the stable diffusion api result by json.
    const jsonResponse = await fetchResponse.json();
    console.log("jsonResponse: ", jsonResponse);

    //* Check error response.
    // if (jsonResponse.status !== "success") {
    //   console.error("jsonResponse.status is not success.");
    //   return;
    // }

    //* Set image url from image generation server.
    setImageUrl(jsonResponse.imageUrl);
  }

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1 },
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
      />
      <Button
        variant="contained"
        onClick={fetchImage}
        sx={{
          m: 1,
        }}
      >
        Draw
      </Button>
      <Image src={imageUrl} width={500} />
    </Box>
  );
}
