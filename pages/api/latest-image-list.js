import { withIronSessionApiRoute } from "iron-session/next";
import { PrismaClient } from "@prisma/client";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

async function handler(req, res) {
  console.log("call /api/latest-image-list");

  const IMAGE_TAKE_COUNT = 100;

  //* Check method error.
  if (req.method !== "GET") {
    res.status(500).json({ error: "Unavailable method. Support only GET." });
    return;
  }

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
  console.log("findManyResult: ", findManyResult);

  if (!findManyResult) {
    return res.status(500).json({ error: "No image data" });
  }

  return res.status(200).json({
    data: findManyResult,
  });
}

export default withIronSessionApiRoute(handler, sessionOptions);
