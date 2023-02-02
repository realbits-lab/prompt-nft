import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  // Check method error.
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ error: "Invalid method. Support only POST." });
  }

  const inputImageUrl = req.body.inputImageUrl;
  console.log("inputImageUrl: ", inputImageUrl);

  const prisma = new PrismaClient();

  //* Check imageUrl with isEncrypted was saved in sqlite already.
  const findManyResult = await prisma.post.findMany({
    where: {
      imageUrl: inputImageUrl,
      isEncrypted: true,
    },
  });
  console.log("findManyResult: ", findManyResult);
  if (findManyResult === null) {
    res.status(500).json({ data: "nok" });
  }

  //* Send 200 OK response.
  res.status(200).json({ data: "ok" });
}
