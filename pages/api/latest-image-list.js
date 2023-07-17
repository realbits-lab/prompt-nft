import { prisma } from "@/lib/client";

export default async function handler(req, res) {
  // console.log("call /api/latest-image-list");

  const IMAGE_TAKE_COUNT = 100;

  //* Check method error.
  if (req.method !== "GET") {
    res.status(500).json({ error: "Unavailable method. Support only GET." });
    return;
  }

  //* Find image by take limit.
  const findManyResult = await prisma.post.findMany({
    take: IMAGE_TAKE_COUNT,
    where: {
      isEncrypted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: IMAGE_TAKE_COUNT,
  });
  // console.log("findManyResult: ", findManyResult);

  //* Check the result error.
  if (!findManyResult) {
    return res.status(500).json({ error: "No image data" });
  }

  return res.status(200).json({
    data: findManyResult,
  });
}
