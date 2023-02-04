import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  // Check method error.
  if (req.method !== "GET") {
    res.status(500).json({ error: "Unavailable method. Support only GET." });
    return;
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  //* GET /api/all
  //* Check imageUrl and prompt was saved in sqlite already.
  //* TODO: Pagination later.
  try {
    const findUniqueResult = await prisma.post.findMany({
      where: {
        isEncrypted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // console.log("findUniqueResult: ", findUniqueResult);

    if (findUniqueResult === null) {
      await prisma.$disconnect();
      return res.status(500).json({ data: "nok" });
    }

    // Send 200 OK response.
    await prisma.$disconnect();
    return res.status(200).json({ data: findUniqueResult });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ data: "nok" });
  }
}
