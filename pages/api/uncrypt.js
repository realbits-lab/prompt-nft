import { encrypt, getEncryptionPublicKey } from "@metamask/eth-sig-util";
import { Base64 } from "js-base64";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//* TODO: Wrap iron session.
export default async function handler(req, res) {
  // Check method error.
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ error: "Invalid method. Support only POST." });
  }

  // POST /api/uncrypt
  // Required fields in body: imageUrl
  const imageUrl = req.body.imageUrl;
  // console.log("imageUrl: ", imageUrl);

  const updatePostResult = await prisma.post.update({
    where: {
      imageUrl: imageUrl,
    },
    data: {
      isEncrypted: false,
    },
  });
  // console.log("updatePostResult: ", updatePostResult);

  //* Send 200 OK response.
  res.status(200).json({
    data: "ok",
  });
}
