import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";

async function handler(req, res) {
  console.log("call /api/fetch-result");

  //* Check method error.
  if (req.method !== "POST") {
    console.log("req.method: ", req.method);
    return res
      .status(500)
      .json({ error: "Invalid method. Support only POST." });
  }

  //* Check if already logined.
  if (!req.session.user || req.session.user.isLoggedIn !== true) {
    return res.status(500).json({ data: "nok" });
  }

  //* Stable diffusion api url.
  // const FETCH_API_URL = "https://stablediffusionapi.com/api/v3/fetch";
  const FETCH_API_URL =
    "https://stablediffusionapi.com/api/v4/dreambooth/fetch";

  //* Required fields in body: id
  const { id } = req.body;
  // console.log("id: ", id);

  //* Stable diffusion api option.
  // const jsonData = {
  //   key: process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API_KEY,
  //   id: id,
  // };
  const jsonData = {
    key: process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API_KEY,
    request_id: id,
  };

  //* Fetch image from image generation server.
  const fetchResponse = await fetch(FETCH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonData),
    redirect: "follow",
  });
  console.log("fetchResponse: ", fetchResponse);

  //* Check the response error.
  if (fetchResponse.status !== 200) {
    console.error(error);
    return res.status(500).json({ message: "Response is not success." });
  }

  //* Get the stable diffusion api result by json.
  let jsonResponse;
  try {
    jsonResponse = await fetchResponse.json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Response is not success." });
  }
  console.log("jsonResponse: ", jsonResponse);

  //* Success status case.
  if (jsonResponse.status !== "success") {
    console.error("jsonResponse.status is not success.");
    return res.status(500).json({ message: "Response is not success." });
  }

  return res.status(200).json({
    status: jsonResponse.status,
    id: jsonResponse.id,
    output: jsonResponse.output,
  });
}

export default withIronSessionApiRoute(handler, sessionOptions);
