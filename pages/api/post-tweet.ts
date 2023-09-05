import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { TwitterApi } from "twitter-api-v2";
import fs from "fs";
import path from "path";
import { sessionOptions } from "@/lib/session";

type ResponseData = {
  message?: string;
  error?: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log("call /api/post-tweet");

  const TWEET_AUTH_KEY = process.env.TWEET_AUTH_KEY;
  const MOIM_BOT_TOKEN = process.env.MOIM_BOT_TOKEN;
  const MOIM_DOMAIN = process.env.MOIM_DOMAIN;
  const MOIM_CHANNEL_ID = process.env.MOIM_IMAGE_GALLERY_CHANNEL_ID;
  const MOIM_GROUP_ID = process.env.MOIM_GROUP_ID;

  //* Method should be POST.
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ error: "Invalid method. Support only POST." });
  }

  //* Check the tweet auth key.
  const { auth_key } = req.body;
  console.log("auth_key: ", auth_key);
  if (auth_key !== TWEET_AUTH_KEY) {
    return res.status(500).json({ error: "Invalid auth key." });
  }

  //* Get the next image post from moim channel.
  const postSearchThreadData = {
    query: {
      groupId: MOIM_GROUP_ID,
      limit: 10, // optional. default: 30
      channelId: MOIM_CHANNEL_ID,
      sort: "editedAt", // optional. defauilt: createdAt
      order: "desc", // optional. default: desc
    },
  };
  let postSearchThreadResponse;
  try {
    postSearchThreadResponse = await fetch(
      `${MOIM_DOMAIN}/api/search/threads`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MOIM_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postSearchThreadData),
      }
    );
  } catch (error) {
    throw error;
  }
  // console.log("postSearchThreadResponse: ", postSearchThreadResponse);

  //* Upload image and text with link to twitter.
  const postSearchThreadResponseJson = await postSearchThreadResponse.json();
  console.log("postSearchThreadResponseJson: ", postSearchThreadResponseJson);

  let getThreadResponse;
  for (const threadData of postSearchThreadResponseJson.data) {
    //* TODO: Check if already tweeted with database.
    getThreadResponse = await fetch(
      `${MOIM_DOMAIN}/api/threads/${threadData.id}`,
      {
        method: "GET",
      }
    );
    break;
  }
  const getThreadResponseJson = await getThreadResponse?.json();
  // console.log(
  //   "getThreadResponseJson.data.content: ",
  //   getThreadResponseJson.data.content
  // );

  //* Get image source url.
  const contentDataList = getThreadResponseJson.data.content;
  for (const contentData of contentDataList) {
    if (contentData.type === "image") {
      const imageSrc = contentData.src;
    }
  }

  //* Download image data.

  //* Upload tweet with image data.
  const twitterApi = new TwitterApi({
    appKey: process.env.TWEET_CONSUMER_KEY!,
    appSecret: process.env.TWEET_CONSUMER_SECRET!,
    accessToken: process.env.TWEET_ACCESS_TOKEN!,
    accessSecret: process.env.TWEET_ACCESS_TOKEN_SECRET!,
  });
  const twitterClient = twitterApi.readWrite;

  try {
    const mediaId = await twitterApi.v1.uploadMedia(
      path.join(process.cwd(), "public/no-image.png")
    );
    await twitterClient.v2.tweet({
      text: "Twitter is a fantastic social network. Look at this:",
      media: { media_ids: [mediaId] },
    });
  } catch (error) {
    console.error("Error: ", error);
  }
  console.log("success");

  //* Record tweeted thread in database with group, channel, thread id.

  //* Return success.
  return res.status(200).json({ message: "success" });
}

export default withIronSessionApiRoute(handler, sessionOptions);
