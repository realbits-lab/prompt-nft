import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { TwitterApi } from "twitter-api-v2";
import fs from "fs";
import path from "path";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { sessionOptions } from "@/lib/session";

type ResponseData = {
  message?: string;
  error?: string;
};

const tweetTextList = [
  "📸 Ready to flex your creative muscles? Click the link to discover an intriguing image prompt that will ignite your imagination! 🔥 #WritingPrompt #CreativityUnleashed",
  "🖼️ Dive into a world of inspiration with this captivating image prompt! Click the link to uncover the muse for your next masterpiece. 📝 #WritingCommunity #Inspiration",
  "🌟 Seeking a visual spark for your storytelling? Look no further! Click the link to access a thought-provoking image prompt. 📷✨ #AmWriting #WritingInspiration",
  "🧐 Challenge your creativity with a mysterious image prompt! Click the link to unravel the story hidden within the pixels. 🕵️‍♀️🔍 #WritersBlockBuster #WritingPrompts",
  "🎨 Get ready to paint a thousand words with this captivating image prompt! Click the link and let your imagination run wild. 🖌️📚 #Storytelling #WritingPrompt",
  "📷 Unlock the door to your next literary adventure! Click the link for an intriguing image prompt that will transport you to new worlds. 🚪📖 #WritingJourney #Creativity",
  "🌄 Let your creativity soar like never before! Click the link to discover an awe-inspiring image prompt that will fuel your writing journey. 🚀📝 #WritingCommunity #Inspiration",
  "🤔 Ready to craft a tale inspired by an enigmatic image? Click the link to reveal the mystery and embark on your writing adventure. 📜🔮 #AmWriting #WritingPrompts",
  "📸 Seeking a fresh perspective? Click the link for an image prompt that will transport you to uncharted territories of creativity! 🌍📚 #Storytelling #WritingInspiration",
  "🖼️ Unleash your storytelling superpowers with this intriguing image prompt! Click the link and let your imagination take flight. 🚀📖 #WritingPrompt #Creativity",
];

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
  //* TODO: If already 100 posts in tweet?
  const postSearchThreadData = {
    query: {
      groupId: MOIM_GROUP_ID,
      limit: 100,
      channelId: MOIM_CHANNEL_ID,
      sort: "createdAt",
      // From the start
      order: "asc",
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
  let threadId;
  for (const threadData of postSearchThreadResponseJson.data) {
    //* TODO: Check if already tweeted with database.
    getThreadResponse = await fetch(
      `${MOIM_DOMAIN}/api/threads/${threadData.id}`,
      {
        method: "GET",
      }
    );
    threadId = threadData.id;
    break;
  }
  const getThreadResponseJson = await getThreadResponse?.json();
  // console.log(
  //   "getThreadResponseJson.data.content: ",
  //   getThreadResponseJson.data.content
  // );

  //* Get image source url.
  const contentDataList = getThreadResponseJson.data.content;
  let imageSrc;
  for (const contentData of contentDataList) {
    if (contentData.type === "image") {
      imageSrc = contentData.src;
    }
  }

  //* Download image data.
  const imageDataResponse = await axios.get(imageSrc, {
    responseType: "arraybuffer",
  });
  if (!imageDataResponse) {
    return res.status(500).json({ error: "Invalid image url." });
  }
  const fileName = `public/images/${uuidv4()}.png`;

  fs.writeFileSync(path.join(process.cwd(), fileName), imageDataResponse.data);

  //* Upload tweet with image data.
  const twitterApi = new TwitterApi({
    appKey: process.env.TWEET_CONSUMER_KEY!,
    appSecret: process.env.TWEET_CONSUMER_SECRET!,
    accessToken: process.env.TWEET_ACCESS_TOKEN!,
    accessSecret: process.env.TWEET_ACCESS_TOKEN_SECRET!,
  });
  const twitterClient = twitterApi.readWrite;

  const threadLinkUrl = `https://muve.moim.co/forums/${MOIM_CHANNEL_ID}/threads/${threadId}`;
  try {
    const mediaId = await twitterApi.v1.uploadMedia(
      path.join(process.cwd(), fileName)
    );

    const tweetTextListRandomIndex = Math.floor(Math.random() * 9);
    await twitterClient.v2.tweet({
      text: `🤔 Click prompt ➔ ${threadLinkUrl}\n\n${tweetTextList[tweetTextListRandomIndex]}`,
      media: { media_ids: [mediaId] },
    });
  } catch (error) {
    console.error("Error: ", error);
    fs.unlinkSync(path.join(process.cwd(), fileName));
  }
  console.log("Success to tweet.");
  fs.unlinkSync(path.join(process.cwd(), fileName));

  //* Record tweeted thread in database with group, channel, thread id.

  //* Return success.
  return res.status(200).json({ message: "success" });
}

export default withIronSessionApiRoute(handler, sessionOptions);
