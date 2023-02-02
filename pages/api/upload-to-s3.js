import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

//* TODO: Wrap iron session.
export default async function handler(req, res) {
  // const BUCKET_NAME = processs.env.NEXT_PUBLIC_BUCKET_NAME;
  const BUCKET_NAME = "prompt-nft";

  // Check method error.
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ error: "Invalid method. Support only POST." });
  }

  //* POST /api/upload-to-s3
  //* Required fields in body: name, description, inputImageUrl
  const name = req.body.name;
  const description = req.body.description;
  const inputImageUrl = req.body.inputImageUrl;
  console.log("name: ", name);
  console.log("description: ", description);
  console.log("inputImageUrl: ", inputImageUrl);

  try {
    //* Get image data from cdn.discordapp.com server.
    const fetchResult = await fetch(inputImageUrl, { mode: "no-cors" });
    console.log("fetchResult: ", fetchResult);
    if (!fetchResult.ok) {
      throw new Error("Network response was not OK");
    }

    const imageBlobData = await fetchResult.blob();
    console.log("imageBlobData: ", imageBlobData);

    // Set s3 client.
    // console.log(
    //   "process.env.NEXT_PUBLIC_AWS_ACCESS_KEY: ",
    //   process.env.NEXT_PUBLIC_AWS_ACCESS_KEY
    // );
    // console.log(
    //   "process.env.NEXT_PUBLIC_AWS_SECRET_KEY: ",
    //   process.env.NEXT_PUBLIC_AWS_SECRET_KEY
    // );
    // console.log(
    //   "process.env.NEXT_PUBLIC_AWS_REGION: ",
    //   process.env.NEXT_PUBLIC_AWS_REGION
    // );
    const config = {
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
      },
    };

    const s3Client = new S3Client(config);
    console.log("s3Client: ", s3Client);

    //* Get unique id.
    const uuid = uuidv4();

    //* Set the parameters for json file.
    const bodyData = JSON.stringify(
      {
        name: name,
        description: description,
        image: inputImageUrl,
      },
      null,
      2
    );
    console.log("bodyData: ", bodyData);

    //* Put json metadata to s3.
    const jsonBucketParams = {
      Bucket: BUCKET_NAME,
      Key: `json/${uuid}.json`,
      Body: bodyData,
      ContentType: "application/json",
    };
    const jsonPutCommand = new PutObjectCommand(jsonBucketParams);
    const jsonPutCommandResult = await s3Client.send(jsonPutCommand);
    console.log("jsonPutCommandResult: ", jsonPutCommandResult);

    //* Put image file to s3.
    const imageArrayBuffer = await imageBlobData.arrayBuffer();
    const imageBucketParams = {
      Bucket: BUCKET_NAME,
      Key: `image/${uuid}.jpeg`,
      Body: imageArrayBuffer,
      ContentType: "image/jpeg",
    };
    const imagePutCommand = new PutObjectCommand(imageBucketParams);
    const imagePutCommandResult = await s3Client.send(imagePutCommand);
    console.log("imagePutCommandResult: ", imagePutCommandResult);

    //* Send 200 OK response with url.
    res.status(200).json({
      url: `https://prompt-nft.s3.ap-northeast-2.amazonaws.com/json/${uuid}.json`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error: ${error}`,
    });
  }
}
