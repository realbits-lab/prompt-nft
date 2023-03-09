import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  console.log("call /api/get");

  // Check method error.
  if (req.method !== "GET") {
    res.status(500).json({ error: "Unavailable method. Support only GET." });
    return;
  }

  const prisma = new PrismaClient();

  // GET /api/get/{prompt}/{imageUrl}
  // Required fields in body: prompt, imageUrl
  const params = req.query.get;
  console.log("params: ", params);

  // Check params error.
  if (
    params === undefined ||
    Array.isArray(params) === false ||
    params.length !== 1
  ) {
    res.status(500).json({ data: "nok" });
    return;
  }

  // Get imageUrl.
  const inputImageUrl = params[0];
  console.log("inputImageUrl: ", inputImageUrl);

  // Check imageUrl and prompt was saved in sqlite already.
  const findUniqueResult = await prisma.post.findUnique({
    where: {
      imageUrl: inputImageUrl,
    },
  });
  console.log("findUniqueResult: ", findUniqueResult);
  if (findUniqueResult === null) {
    res.status(500).json({ data: "nok" });
  }

  // Send 200 OK response.
  res.status(200).json({ data: findUniqueResult });
}
