import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  //* Check method error.
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

  if (
    findManyResult === undefined ||
    findManyResult === null ||
    findManyResult.length === 0
  ) {
    // console.log("send 500 error");
    res.status(200).json({ data: "nok" });
    return;
  }

  //* Send 200 OK response.
  // console.log("send 200 success");
  res.status(200).json({ data: "ok" });
}
