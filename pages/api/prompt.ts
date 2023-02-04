import { ethers } from "ethers";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../lib/session";
import promptNFTABI from "../../contracts/promptNFT.json";
import { getProvider } from "lib/util";
const { decrypt } = require("@metamask/eth-sig-util");

export type PromptResult = {
  isLoggedIn: boolean;
  prompt: string;
};

//* TODO: Check caller address is owner or renter from contract.
async function promptRoute(
  req: NextApiRequest,
  res: NextApiResponse<PromptResult>
) {
  // console.log("call /api/prompt");
  // console.log("req.session.user: ", req.session.user);

  if (req.session.user) {
    const user = req.session.user;
    const publicAddress = user.publicAddress;
    const { tokenId } = await req.body;

    //* Get the contract owner encrypted prompt from nft contract with token id.
    //* Get prompt nft contract.
    const provider = getProvider({
      chainName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
    });
    const promptNftContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS!,
      promptNFTABI["abi"],
      provider
    );

    const signer = new ethers.Wallet(
      process.env.NEXT_PUBLIC_PROMPTER_PRIVATE_KEY ?? "",
      provider
    );
    // console.log("signer: ", signer);
    const contractOwnerEncryptDataResult = await promptNftContract
      .connect(signer)
      .getContractOwnerPrompt(tokenId);
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

    //* Decrypt the contract owner encrypted prompt.
    const contractOwnerDecryptResult = decrypt({
      encryptedData: contractOwnerEncryptData,
      privateKey: process.env.NEXT_PUBLIC_PROMPTER_PRIVATE_KEY,
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
