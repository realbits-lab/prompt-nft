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
  const result = await prisma.post.create({
    data: {
      prompt: prompt,
      imageUrl: imageUrl,
    },
  });
  console.log("prisma.post.create result: ", result);

  // Send 200 OK response.
  res.status(200).json({ data: "ok" });
}
