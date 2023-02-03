import { ethers } from "ethers";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../lib/session";
import promptNFTABI from "../../contracts/promptNFT.json";
import type { User } from "../../user/user";

const { decrypt } = require("@metamask/eth-sig-util");

export type PromptResult = {
  isLoggedIn: boolean;
  prompt: string;
};

async function promptRoute(
  req: NextApiRequest,
  res: NextApiResponse<PromptResult>
) {
  // console.log("req.session.user: ", req.session.user);

	//* TODO: Fix user authentication method.
  if (req.session.user) {
    const user = req.session.user;
    const publicAddress = user.publicAddress;
    const { tokenId } = await req.body;

    //* TODO: Get the contract owner encrypted prompt from nft contract with token id.
    //* Get prompt nft contract.
    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:8545"
    );
    const promptNftContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS!,
      promptNFTABI["abi"],
      provider
    );

    const contractOwnerEncryptDataResult =
      await promptNftContract.getContractOwnerPrompt(tokenId);
    // console.log(
    //   "contractOwnerEncryptDataResult:",
    //   contractOwnerEncryptDataResult
    // );
    const contractOwnerEncryptData = {
      ciphertext: contractOwnerEncryptDataResult["ciphertext"],
      ephemPublicKey: contractOwnerEncryptDataResult["ephemPublicKey"],
      nonce: contractOwnerEncryptDataResult["nonce"],
      version: contractOwnerEncryptDataResult["version"],
    };

    // TODO: Decrypt the contract owner encrypted prompt.
    const contractOwnerDecryptResult = decrypt({
      encryptedData: contractOwnerEncryptData,
      privateKey: process.env.NEXT_PUBLIC_CONTRACT_OWNER_PRIVATE_KEY,
    });
    // console.log("contractOwnerDecryptResult:", contractOwnerDecryptResult);

    res.json({
      isLoggedIn: true,
      prompt: contractOwnerDecryptResult,
    });
  } else {
    res.json({ isLoggedIn: false, prompt: "User is not logged in." });
  }
}

export default withIronSessionApiRoute(promptRoute, sessionOptions);
