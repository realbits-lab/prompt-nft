import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  // Check method error.
  if (req.method !== "GET") {
    res.status(500).json({ error: "Unavailable method. Support only GET." });
    return;
  }

  const prisma = new PrismaClient();

  //* GET /api/all
  //* Check imageUrl and prompt was saved in sqlite already.
  //* TODO: Pagination later.
  const findUniqueResult = await prisma.post.findMany({
    where: {
      isEncrypted: false,
    },
  });
  // console.log("findUniqueResult: ", findUniqueResult);

  if (findUniqueResult === null) {
    res.status(500).json({ data: "nok" });
  }

  // Send 200 OK response.
  res.status(200).json({ data: findUniqueResult });
}
