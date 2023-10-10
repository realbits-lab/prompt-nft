import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { v4 as uuidv4, v1 } from "uuid";
import fs from "fs";
import path from "path";
import axios from "axios";

async function handler(req, res) {
  console.log("call /api/draw");

  const USE_SDXL = true;

  //* Check POST method.
  if (req.method !== "POST") {
    console.error("req.method: ", req.method);
    return res
      .status(500)
      .json({ error: "Invalid method. Support only POST." });
  }

  //* Check login.
  if (
    !req.session.user ||
    req.session.user.isLoggedIn !== true ||
    req.session.user.rentPaymentNft !== true
  ) {
    console.error("req.session.user: ", req.session.user);
    return res.status(500).json({ error: "user is not logged in." });
  }

  // Stable diffusion api url.
  //* TODO: Use v4 dreambooth API after fixing ouput url connectivity error.
  let TEXT2IMG_API_URL;
  if (USE_SDXL === true) {
    TEXT2IMG_API_URL = "https://stablediffusionapi.com/api/v4/dreambooth";
  } else {
    TEXT2IMG_API_URL = "https://stablediffusionapi.com/api/v3/text2img";
  }

  const STABLE_DIFFUSION_API_KEY =
    process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API_KEY;
  const WIDTH = "1024";
  const HEIGHT = "1024";
  const SAMPLES = "1";
  // The value accepts 21,31,41 and 51.
  const NUM_INFERENCE_STEPS = "31";
  const GUIDANCE_SCALE = 7.5;
  const CLIP_SKIP = "2";
  const SCHEDULER = "DPMSolverMultistepScheduler";
  const MODEL_ID = "sdxl";

  // Required fields in body: prompt, negativePrompt
  const { prompt, negativePrompt } = req.body;
  // console.log("prompt: ", prompt);
  // console.log("negativePrompt: ", negativePrompt);

  //* Stable diffusion api option.
  let jsonData;
  if (USE_SDXL === true) {
    //* TODO: Use v4 dreambooth API after fixing ouput url connectivity error.
    jsonData = {
      key: STABLE_DIFFUSION_API_KEY,
      model_id: MODEL_ID,
      prompt: prompt,
      negative_prompt: negativePrompt,
      width: WIDTH,
      height: HEIGHT,
      samples: SAMPLES,
      num_inference_steps: NUM_INFERENCE_STEPS,
      safety_checker: "yes",
      enhance_prompt: "no",
      seed: null,
      guidance_scale: GUIDANCE_SCALE,
      multi_lingual: "no",
      panorama: "no",
      self_attention: "no",
      upscale: "no",
      embeddings_model: null,
      lora_model: null,
      tomesd: "yes",
      use_karras_sigmas: "yes",
      vae: null,
      lora_strength: null,
      scheduler: SCHEDULER,
      clip_skip: CLIP_SKIP,
      webhook: null,
      track_id: null,
    };
  } else {
    jsonData = {
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
  }

  //* Fetch image.
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const fetchResponse = await fetch(TEXT2IMG_API_URL, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(jsonData),
    redirect: "follow",
  });
  // console.log("fetchResponse: ", fetchResponse);

  //* Check the response error.
  if (fetchResponse.status !== 200) {
    console.error("Error: ", error);
    return res.status(500).json({ message: "Response is not success." });
  }

  //* Get the stable diffusion api result by json.
  let jsonResponse;
  try {
    jsonResponse = await fetchResponse.json();
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ message: "Response is not success." });
  }
  console.log("jsonResponse: ", jsonResponse);

  //* TODO: Use the original image url instead of downloading image data.
  // const publicImagesFilePath =
  //   path.join(process.cwd(), "public/images/") + uuidv4() + ".png";
  // console.log("publicImagesFilePath: ", publicImagesFilePath);

  if (jsonResponse.status === "processing") {
    //* Processing status case.
    return res.status(200).json({
      status: jsonResponse.status,
      meta: jsonResponse.meta,
      message: jsonResponse.message,
      eta: jsonResponse.eta,
      fetch_result: jsonResponse.fetch_result,
      id: jsonResponse.id,
    });
  } else if (jsonResponse.status === "success") {
    //* Success status case.
    //* TODO: Use the original image url instead of downloading image data.
    // await downloadImage({
    //   url: jsonResponse.output,
    //   filepath: publicImagesFilePath,
    // });

    return res.status(200).json({
      status: jsonResponse.status,
      imageUrl: jsonResponse.output,
      meta: jsonResponse.meta,
    });
  } else {
    //* Error case.
    console.error("jsonResponse.status: ", jsonResponse.status);
    return res.status(500).json({ message: "Response is not success." });
  }
}

async function downloadImage({ url, filepath }) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", reject)
      .once("close", () => resolve(filepath));
  });
}

export default withIronSessionApiRoute(handler, sessionOptions);
