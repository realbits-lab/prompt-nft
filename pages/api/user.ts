import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import rentmarketABI from "@/contracts/rentMarket.json";
import Web3 from "web3";
import { sessionOptions } from "@/lib/session";

export type User = {
  isLoggedIn: boolean;
  publicAddress: string;
  rentPaymentNft: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse<User>) {
  // console.log("call /api/user");
  // console.log("req.session.user: ", req.session.user);

	//* Check user login.
  if (!req.session.user) {
    res.json({
      isLoggedIn: false,
      publicAddress: "",
      rentPaymentNft: false,
    });
    return;
  }

  const publicAddress = req.session.user.publicAddress;

  const RENT_MARKET_CONTRACT_ADDRES =
    process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS;
  const PAYMENT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS;
  const PAYMENT_NFT_TOKEN_ID = process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN;
  const ALCHEMY_API_URL = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

  const web3 = new Web3(ALCHEMY_API_URL);
  const rentMarketContract = new web3.eth.Contract(
    rentmarketABI.abi,
    RENT_MARKET_CONTRACT_ADDRES
  );

  let rentPaymentNft = false;
  const result = await rentMarketContract.methods.getAllRentData().call();
  result?.map(function (rentData: any) {
    // console.log("rentData: ", rentData);
    // console.log("publicAddress: ", publicAddress);
    // console.log("PAYMENT_NFT_CONTRACT_ADDRESS: ", PAYMENT_NFT_CONTRACT_ADDRESS);
    // console.log("PAYMENT_NFT_TOKEN_ID: ", PAYMENT_NFT_TOKEN_ID);

		//* Find user rent history for payment nft.
    if (
      rentData.renteeAddress.toLowerCase() === publicAddress?.toLowerCase() &&
      rentData.nftAddress.toLowerCase() ===
        PAYMENT_NFT_CONTRACT_ADDRESS?.toLowerCase() &&
      Number(rentData.tokenId) === Number(PAYMENT_NFT_TOKEN_ID)
    ) {
      rentPaymentNft = true;
    }
  });
  // console.log("rentPaymentNft: ", rentPaymentNft);

  res.json({
    ...req.session.user,
    isLoggedIn: true,
    rentPaymentNft: rentPaymentNft,
  });
  return;
}

export default withIronSessionApiRoute(handler, sessionOptions);
