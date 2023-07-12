import axios from "axios";
import { withIronSessionApiRoute } from "iron-session/next";
import { prisma } from "@/lib/client";
import { sessionOptions } from "@/lib/session";
import { truncate } from "@/lib/util";

async function uploadMoimPost({ title, imageUrl }) {
  const MOIM_BOT_TOKEN = process.env.MOIM_BOT_TOKEN;
  const MOIM_DOMAIN = process.env.MOIM_DOMAIN;
  const MOIM_CHANNEL_ID = process.env.MOIM_CHANNEL_ID;

  //* Post thread for content and previewBottom.
  //* https://vingle.atlassian.net/wiki/spaces/MP/pages/364904472/Blockit
  const postThreadData = {
    thread: {
      title: title,
      content: [
        {
          type: "image",
          width: 512,
          height: 512,
          src: imageUrl,
        },
      ],
      previewBottom: [
        {
          type: "image",
          width: 512,
          height: 512,
          src: imageUrl,
        },
      ],
    },
  };

  let postResponse;
  try {
    postResponse = await axios({
      method: "post",
      url: `${MOIM_DOMAIN}/api/forums/${MOIM_CHANNEL_ID}/threads`,
      headers: {
        authorization: `Bearer ${MOIM_BOT_TOKEN}`,
      },
      data: postThreadData,
      responseType: "json",
    });
  } catch (error) {
    throw error;
  }
  // console.log("postResponse: ", postResponse);

  return postResponse;
}

async function handler(req, res) {
  // console.log("call /api/post");

  //* Check method error.
  if (req.method !== "POST") {
    // console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* Check if already logined.
  if (!req.session.user || req.session.user.isLoggedIn !== true) {
    return res.status(500).json({ error: "User is not logined." });
  }

  //* Required fields in body: prompt, imageUrl, discordBotToken
  const { prompt, negativePrompt, imageUrl, discordBotToken } = req.body;
  // console.log("prompt: ", prompt);
  // console.log("negativePrompt: ", negativePrompt);
  // console.log("imageUrl: ", imageUrl);
  // console.log("discordBotToken: ", discordBotToken);

  //* Check discord bot token match.
  if (
    !discordBotToken ||
    discordBotToken !== process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN
  ) {
    console.error("discordBotToken is different.");
    console.error("discordBotToken: ", discordBotToken);
    console.error(
      "process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN: ",
      process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN
    );
    res.status(500).json({ error: "Invalid discord bot token." });
    return;
  }

  //* Insert image data.
  let resultPrismaPostCreate;
  try {
    resultPrismaPostCreate = await prisma.post.create({
      data: {
        prompt: prompt,
        negativePrompt: negativePrompt,
        imageUrl: imageUrl,
      },
    });
    // console.log("resultPrismaPostCreate: ", resultPrismaPostCreate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "prisma.post.create failed." });
    return;
  }

  //* Write moim post.
  let resultUploadMoimPost;
  try {
    resultUploadMoimPost = await uploadMoimPost({
      imageUrl: imageUrl,
      title: truncate(prompt, 10),
    });
    // console.log(
    //   "resultUploadMoimPost.data.data: ",
    //   resultUploadMoimPost.data.data
    // );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "uploadMoimPost failed." });
    return;
  }

  //* Return database insert result.
  if (resultPrismaPostCreate) {
    res.status(200).json({ data: "ok" });
  } else {
    console.error("resultPrismaPostCreate: ", resultPrismaPostCreate);
    res.status(500).json({ message: "data creation failed." });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
