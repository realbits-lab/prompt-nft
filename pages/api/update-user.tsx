import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import Web3 from "web3";
import { sessionOptions } from "@/lib/session";
import { getChainId } from "@/lib/util";
import rentmarketABI from "@/contracts/rentMarket.json";
import { rentData } from "@/types/rentData";
import { ErrorWithMessage } from "@/types/error";
import { getErrorMessage } from "@/lib/error";
const sigUtil = require("@metamask/eth-sig-util");

const RENT_MARKET_CONTRACT_ADDRES =
  process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
const PAYMENT_NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS!;
const PAYMENT_NFT_TOKEN_ID = process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN;
const ALCHEMY_API_URL =
  "https://polygon-mumbai.g.alchemy.com/v2/oRV4hG4cLckxr4KcIgiFbOIiaNmoCTf1";

async function getUserData({ publicAddress }: { publicAddress: string }) {
  const web3 = new Web3(ALCHEMY_API_URL);
  const rentMarketContract = new web3.eth.Contract(
    rentmarketABI.abi,
    RENT_MARKET_CONTRACT_ADDRES
  );
  const result: rentData[] = await rentMarketContract.methods
    .getAllRentData()
    .call();

  let found = false;
  result?.map(function (rentData: rentData) {
    // console.log("rentData: ", rentData);
    // console.log("publicAddress: ", publicAddress);
    // console.log("PAYMENT_NFT_CONTRACT_ADDRESS: ", PAYMENT_NFT_CONTRACT_ADDRESS);
    // console.log("PAYMENT_NFT_TOKEN_ID: ", PAYMENT_NFT_TOKEN_ID);
    if (
      rentData.renteeAddress.toLowerCase() === publicAddress?.toLowerCase() &&
      rentData.nftAddress.toLowerCase() ===
        PAYMENT_NFT_CONTRACT_ADDRESS.toLowerCase() &&
      Number(rentData.tokenId) === Number(PAYMENT_NFT_TOKEN_ID)
    ) {
      found = true;
    }
  });
  // console.log("found: ", found);

  const user = {
    isLoggedIn: true,
    publicAddress: publicAddress,
    rentPaymentNft: found,
  };

  return user;
}

type ResponseData = {
  message?: string;
  error?: string;
  user?: {
    isLoggedIn: boolean;
    publicAddress: string;
    rentPaymentNft: boolean;
  };
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log("call /api/update-user");
  console.log("req.session.user: ", req.session.user);

  //* Method should be POST.
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ message: "Invalid method. Support only POST." });
  }

  //* Get body data.
  const { publicAddress, signature } = await req.body;
  console.log("publicAddress: ", publicAddress);
  console.log("signature: ", signature);

  //* Check public address data.
  if (!publicAddress) {
    return res.status(500).json({
      error: `publicAddress: ${publicAddress} is invalid.`,
    });
  }

  //* Check signature data.
  if (!signature) {
    return res.status(500).json({
      error: `signature: ${signature} is invalid.`,
    });
  }

  //* Get chain id from configuration.
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

  let recovered;
  try {
    recovered = sigUtil.recoverTypedSignature({
      data: JSON.parse(msgParams),
      signature: signature,
      version: sigUtil.SignTypedDataVersion.V4,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: getErrorMessage(error) });
  }
  console.log("recovered: ", recovered);
  console.log("publicAddress: ", publicAddress);

  //* Check address between decrypted address and post body data.
  if (recovered.toLowerCase() !== publicAddress.toLowerCase()) {
    console.error("Recovered address is not the same as input address.");
    return res.status(401).json({ error: "Signature verification failed." });
  }

  //* Check whether or not user rented the payment nft.
  const user = await getUserData({ publicAddress });
  console.log("user: ", user);
  req.session.user = user;
  await req.session.save();
  console.log("req.session.user: ", req.session.user);

  return res.status(200).json({ user });
}

export default withIronSessionApiRoute(handler, sessionOptions);
