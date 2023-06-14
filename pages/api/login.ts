import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "@/lib/session";
import { getChainId } from "@/lib/util";
import type { User } from "@/pages/api/user";
const sigUtil = require("@metamask/eth-sig-util");

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("call /api/login");

  const { publicAddress, signature } = await req.body;
  console.log("publicAddress: ", publicAddress);
  console.log("signature: ", signature);
  console.log("req.session.user: ", req.session.user);

  //* Check if already logined.
  if (
    req.session.user &&
    req.session.user.isLoggedIn === true &&
    req.session.user.publicAddress.toLowerCase() === publicAddress.toLowerCase()
  ) {
    return res.status(200).json(req.session.user);
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
      version: sigUtil.SignTypedDataVersion.V4,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: (error as Error).message });
  }
  // console.log("recovered: ", recovered);
  // console.log("publicAddress: ", publicAddress);

  if (recovered.toLowerCase() === publicAddress.toLowerCase()) {
    // console.log("Recovered address is the same as input address.");
    const user = { isLoggedIn: true, publicAddress: publicAddress } as User;
    req.session.user = user;
    await req.session.save();

    return res.status(200).json(user);
  } else {
    console.error("Recovered address is not the same as input address.");
    return res.status(401).json({ error: "Signature verification failed." });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
