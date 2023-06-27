import { encrypt, getEncryptionPublicKey } from "@metamask/eth-sig-util";
import { Base64 } from "js-base64";
import { prisma } from "@/lib/client";

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
  const imageUrl = req.body.imageUrl;
  const prompt = req.body.prompt;
  const negativePrompt = req.body.negativePrompt;
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

  const contractOwnerEncryptPromptData = encrypt({
    publicKey: encryptionPublicKey,
    data: Base64.encode(prompt).toString(),
    version: "x25519-xsalsa20-poly1305",
  });
  const contractOwnerEncryptNegativePromptData = encrypt({
    publicKey: encryptionPublicKey,
    data: Base64.encode(negativePrompt).toString(),
    version: "x25519-xsalsa20-poly1305",
  });
  // console.log("contractOwnerEncryptData: ", contractOwnerEncryptData);

  const updatePostResult = await prisma.post.upsert({
    where: {
      imageUrl: imageUrl,
    },
    update: {
      isEncrypted: true,
    },
    create: {
      imageUrl: imageUrl,
      isEncrypted: true,
    },
  });
  // console.log("updatePostResult: ", updatePostResult);

  //* Send 200 OK response.
  res.status(200).json({
    contractOwnerEncryptPromptData: contractOwnerEncryptPromptData,
    contractOwnerEncryptNegativePromptData:
      contractOwnerEncryptNegativePromptData,
  });
}
