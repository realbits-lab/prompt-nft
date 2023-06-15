import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";

async function handler(req, res) {
  // console.log("call /api/draw");

  //* Check method error.
  if (req.method !== "POST") {
    console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* Check if already logined.
  if (
    !req.session.user ||
    req.session.user.isLoggedIn !== true ||
    req.session.user.rentPaymentNft !== true
  ) {
    return res.status(500).json({ data: "nok" });
  }

  //* Stable diffusion api url.
  const TEXT2IMG_API_URL = "https://stablediffusionapi.com/api/v3/text2img";

  //* Required fields in body: prompt, negativePrompt
  const { prompt, negativePrompt } = req.body;
  // console.log("prompt: ", prompt);
  // console.log("negativePrompt: ", negativePrompt);

  //* Stable diffusion api option.
  const jsonData = {
    key: process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API_KEY,
    prompt: prompt,
    negative_prompt: negativePrompt,
    width: "512",
    height: "512",
    samples: "1",
    num_inference_steps: "20",
    safety_checker: "yes",
    enhance_prompt: "no",
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
  // console.log("fetchResponse: ", fetchResponse);

  //* Check the response error.
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
  console.log("jsonResponse: ", jsonResponse);

  if (jsonResponse.status === "processing") {
    //* TODO: Processing status case.
    // status: 'processing',
    // tip: 'for faster speed, keep resolution upto 512x512',
    // eta: 20.5611160064,
    // messege: 'Try to fetch request after given estimated time',
    // fetch_result: 'https://stablediffusionapi.com/api/v3/fetch/11431316',
    // id: 11431316,
    res.status(200).json({
      status: jsonResponse.status,
      message: jsonResponse.message,
      eta: jsonResponse.eta,
      fetch_result: jsonResponse.fetch_result,
      id: jsonResponse.id,
    });
  } else if (jsonResponse.status === "success") {
    //* Success status case.
    res.status(200).json({
      status: jsonResponse.status,
      imageUrl: jsonResponse.output,
      meta: jsonResponse.meta,
    });
  } else {
    console.error("jsonResponse.status is not success.");
    res.status(500).json({ message: "Response is not success." });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
