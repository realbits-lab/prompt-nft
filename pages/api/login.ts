import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { sessionOptions } from "../../lib/session";
import { getChainId } from "../../lib/util";
import type { User } from "./user";
const ethUtil = require("ethereumjs-util");
const sigUtil = require("@metamask/eth-sig-util");
const prisma = new PrismaClient();

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  console.log("call /api/login");

  const { publicAddress, signature } = await req.body;
  console.log("publicAddress: ", publicAddress);
  console.log("signature: ", signature);

  let findUniqueResult;
  try {
    findUniqueResult = await prisma.user.findUnique({
      where: {
        publicAddress: publicAddress,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
  // console.log("findUniqueResult: ", findUniqueResult);
  if (!findUniqueResult) {
    //* : Handle error.
    return res
      .status(500)
      .json({ message: `${publicAddress} account is not registered.` });
  }

  const chainId = getChainId({
    chainName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
  });
  // console.log("chainId: ", chainId);

  const msgParams = JSON.stringify({
    domain: {
      chainId: chainId,
      name: "Realbits",
    },

    //* Defining the message signing data content.
    // message: {
    //   contents: `Login with ${findUniqueResult?.nonce} nonce number.`,
    // },
    message: {
      contents: process.env.NEXT_PUBLIC_LOGIN_SIGN_MESSAGE,
    },

    //* Refers to the keys of the *types* object below.
    primaryType: "Login",

    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "chainId", type: "uint256" },
      ],
      //* Refer to PrimaryType
      Login: [{ name: "contents", type: "string" }],
    },
  });

  // console.log("start to call sigUtil.recoverTypedSignature()");

  let recovered;
  try {
    recovered = sigUtil.recoverTypedSignature({
      data: JSON.parse(msgParams),
      signature: signature,
      version: sigUtil.SignTypedDataVersion.V3,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: (error as Error).message });
  }
  // console.log("recovered: ", recovered);
  // console.log("publicAddress: ", publicAddress);

  if (
    ethUtil.toChecksumAddress(recovered) ===
    ethUtil.toChecksumAddress(publicAddress)
  ) {
    const user = { isLoggedIn: true, publicAddress: publicAddress } as User;
    req.session.user = user;
    await req.session.save();

    return res.json(user);
  } else {
    return res.status(401).json({ error: "Signature verification failed." });
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions);
