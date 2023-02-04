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

  // POST /api/crypt
  // Required fields in body: prompt, imageUrl
  const prompt = req.body.prompt;
  const imageUrl = req.body.imageUrl;
  // console.log("prompt: ", prompt);
  // console.log("imageUrl: ", imageUrl);

  // console.log(
  //   "process.env.NEXT_PUBLIC_PROMPTER_PRIVATE_KEY: ",
  //   process.env.NEXT_PUBLIC_PROMPTER_PRIVATE_KEY
  // );
  const encryptionPublicKey = getEncryptionPublicKey(
    process.env.NEXT_PUBLIC_PROMPTER_PRIVATE_KEY
  );
  // console.log("encryptionPublicKey: ", encryptionPublicKey);

  const contractOwnerEncryptData = encrypt({
    publicKey: encryptionPublicKey,
    data: Base64.encode(prompt).toString(),
    version: "x25519-xsalsa20-poly1305",
  });
  // console.log("contractOwnerEncryptData: ", contractOwnerEncryptData);

  const updatePostResult = await prisma.post.update({
    where: {
      imageUrl: imageUrl,
    },
    data: {
      isEncrypted: true,
    },
  });
  // console.log("updatePostResult: ", updatePostResult);

  // TODO: Delete after minting transaction confirmation.

  // Send 200 OK response.
  res.status(200).json({ contractOwnerEncryptData: contractOwnerEncryptData });
}
