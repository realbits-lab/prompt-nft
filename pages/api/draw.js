export default async function handler(req, res) {
  console.log("call /api/draw");

  //* Stable diffusion api url.
  const TEXT2IMG_API_URL = "https://stablediffusionapi.com/api/v3/text2img";

  //* Check method error.
  if (req.method !== "POST") {
    console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* TODO: Check user's login.
  //* Required fields in body: prompt, imageUrl
  const { prompt, negativePrompt } = req.body;
  console.log("prompt: ", prompt);
  console.log("negativePrompt: ", negativePrompt);

  //* Make stable diffusion api option by json.
  const jsonData = {
    key: process.env.STABLE_DIFFUSION_API_KEY,
    prompt: prompt,
    negative_prompt: negativePrompt,
    width: "512",
    height: "512",
    samples: "1",
    num_inference_steps: "20",
    safety_checker: "yes",
    enhance_prompt: "yes",
    seed: null,
    guidance_scale: 7.5,
    webhook: null,
    track_id: null,
  };

  //* Fetch image from image generation server.
  const fetchResponse = await fetch(TEXT2IMG_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonData),
  });
  console.log("fetchResponse: ", fetchResponse);

  if (fetchResponse.status !== 200) {
    console.error(error);
    res.status(500).json({ message: "Response is not success." });
  }

  //* Get the stable diffusion api result by json.
  let jsonResponse;
  try {
    jsonResponse = await fetchResponse.json();
    console.log("jsonResponse: ", jsonResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Response is not success." });
  }

  //* Check error response.
  if (jsonResponse.status !== "success") {
    console.error("jsonResponse.status is not success.");
    res.status(500).json({ message: "Response is not success." });
  }

  //* Return image url from image generation server.
  res.status(200).json({ imageUrl: jsonResponse.output });
}
