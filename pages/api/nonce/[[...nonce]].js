import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  console.log("call /api/nonce");

  //* Check method error.
  if (req.method !== "GET") {
    return res
      .status(500)
      .json({ error: "Unavailable method. Support only GET." });
  }

  const prisma = new PrismaClient();

  //* GET /api/user/{publicAddress}
  const params = req.query.nonce;
  console.log("params: ", params);

  //* Check params error.
  if (
    params === undefined ||
    Array.isArray(params) === false ||
    params.length !== 1
  ) {
    return res.status(500).json({ data: "nok" });
  }

  //* Get publicAddress
  const inputPublicAddress = params[0];
  console.log("inputPublicAddress: ", inputPublicAddress);

  let findUniqueResult = await prisma.user.findUnique({
    where: {
      publicAddress: inputPublicAddress,
    },
  });
  console.log("findUniqueResult: ", findUniqueResult);

  if (!findUniqueResult || findUniqueResult.length === 0) {
    //* Add new user with random nonce.
    const nonce = Math.floor(Math.random() * 1000000);
    const createResult = await prisma.user.create({
      data: {
        publicAddress: inputPublicAddress,
        nonce: nonce,
      },
    });
    console.log("createResult: ", createResult);
    findUniqueResult = createResult;
  }

  //* Send 200 OK response.
  return res.status(200).json({ data: findUniqueResult });
}
