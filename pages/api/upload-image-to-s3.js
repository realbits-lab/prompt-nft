import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { withIronSessionApiRoute } from "iron-session/next";
import { v4 as uuidv4 } from "uuid";
import { sessionOptions } from "@/lib/session";

async function handler(req, res) {
  console.log("call /api/upload-image-to-s3");

  const BUCKET_NAME = "fictures-images";

  //* Check method error.
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ error: "Invalid method. Support only POST." });
  }

  //* Check if already logined.
  if (!req.session.user || req.session.user.isLoggedIn !== true) {
    return res.status(500).json({ error: "User is not logined." });
  }

  //* Required fields in body: imageUrl
  console.log("req.body: ", req.body);
  const imageUrl = req.body.imageUrl;
  console.log("imageUrl: ", imageUrl);

  let fetchResult;
  try {
    //* Get image data from url.
    fetchResult = await fetch(imageUrl, { mode: "no-cors" });
    // console.log("fetchResult: ", fetchResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `error: ${error}` });
    return;
  }

  if (!fetchResult.ok) {
    res.status(500).json({ error: "Network is invalid." });
    return;
  }

  const imageBlobData = await fetchResult.blob();
  // console.log("imageBlobData: ", imageBlobData);

  const config = {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
    },
  };

  const s3Client = new S3Client(config);
  // console.log("s3Client: ", s3Client);

  //* Get unique id.
  const uuid = uuidv4();

  //* Put image file to s3.
  const imageArrayBuffer = await imageBlobData.arrayBuffer();
  const imageBucketParams = {
    Bucket: BUCKET_NAME,
    Key: `${uuid}.png`,
    Body: imageArrayBuffer,
    ContentType: "image/png",
  };
  const imagePutCommand = new PutObjectCommand(imageBucketParams);
  const imagePutCommandResult = await s3Client.send(imagePutCommand);
  console.log("imagePutCommandResult: ", imagePutCommandResult);

  //* Send 200 OK response with url.
  res.status(200).json({
    url: `https://fictures-images.s3.ap-northeast-2.amazonaws.com/${uuid}.png`,
  });
}

export default withIronSessionApiRoute(handler, sessionOptions);
