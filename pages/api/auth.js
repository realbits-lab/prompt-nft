import { PrismaClient } from "@prisma/client";

const ethUtil = require("ethereumjs-util");
const sigUtil = require("@metamask/eth-sig-util");
const prisma = new PrismaClient();

export default async function handler(req, res) {
  //* Method should be POST.
  if (req.method !== "POST") {
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* POST /api/auth
  //* Required fields in body: publicAddress, signature
  const { publicAddress, signature } = req.body;
  // console.log("publicAddress: ", publicAddress);
  // console.log("signature: ", signature);

  const findUniqueResult = await prisma.user.findUnique({
    where: {
      publicAddress: publicAddress,
    },
  });
  // console.log("findUniqueResult: ", findUniqueResult);

  const msgParams = JSON.stringify({
    domain: {
      // TODO: Change later.
      chainId: 0x539,
      name: "Realbits",
    },

    // Defining the message signing data content.
    message: {
      contents: `Login with ${findUniqueResult.nonce} nonce number.`,
    },

    // Refers to the keys of the *types* object below.
    primaryType: "Login",

    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "chainId", type: "uint256" },
      ],
      // Refer to PrimaryType
      Login: [{ name: "contents", type: "string" }],
    },
  });

  const recovered = sigUtil.recoverTypedSignature({
    data: JSON.parse(msgParams),
    signature: signature,
    version: sigUtil.SignTypedDataVersion.V4,
  });

  if (
    ethUtil.toChecksumAddress(recovered) ===
    ethUtil.toChecksumAddress(publicAddress)
  ) {
    return res.status(200).send({ data: "ok" });
  } else {
    return res.status(401).send({ error: "Signature verification failed." });
  }
}
