import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("call /api/post");

  // Check method error.
  if (req.method !== "POST") {
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  // POST /api/post
  // Required fields in body: prompt, imageUrl
  const { prompt, imageUrl } = req.body;
  console.log("prompt: ", prompt);
  console.log("imageUrl: ", imageUrl);

  const result = await prisma.post.create({
    data: {
      prompt: prompt,
      imageUrl: imageUrl,
    },
  });
  console.log("prisma.post.create result: ", result);

  if (result) {
    res.status(200).json({ data: "ok" });
  } else {
    res.status(500).json({ message: "data creation failed." });
  }
}
