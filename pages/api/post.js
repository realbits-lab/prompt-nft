import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("call /api/post");

  // Check method error.
  if (req.method !== "POST") {
    console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  // POST /api/post
  // Required fields in body: prompt, imageUrl, discordBotToken
  const { prompt, negativePrompt, imageUrl, discordBotToken } = req.body;
  console.log("prompt: ", prompt);
  console.log("negativePrompt: ", negativePrompt);
  console.log("imageUrl: ", imageUrl);
  console.log("discordBotToken: ", discordBotToken);

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

  const result = await prisma.post.create({
    data: {
      prompt: prompt,
      negativePrompt: negativePrompt,
      imageUrl: imageUrl,
    },
  });
  console.log("prisma.post.create result: ", result);

  if (result) {
    res.status(200).json({ data: "ok" });
  } else {
    console.error("data creation failed. result: ", result);
    res.status(500).json({ message: "data creation failed." });
  }
}
