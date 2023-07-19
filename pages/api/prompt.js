import {
  createWalletClient,
  http,
  publicActions,
  encodeFunctionData,
  decodeAbiParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, localhost, polygonMumbai } from "viem/chains";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import promptNFTABI from "@/contracts/promptNFT.json";

const { decrypt } = require("@metamask/eth-sig-util");

async function handler(req, res) {
  console.log("call /api/prompt");
  // console.log("req.session.user: ", req.session.user);

  const PROMPTER_PRIVATE_KEY = process.env.NEXT_PUBLIC_PROMPTER_PRIVATE_KEY;
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;

  if (req.session.user) {
    const user = req.session.user;
    const { tokenId } = await req.body;

    //* Use viem.
    const account = privateKeyToAccount(`0x${PROMPTER_PRIVATE_KEY}`);
    // console.log("account: ", account);

    let blockchainNetwork;
    let transportUrl;
    switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
      case "localhost":
      default:
        blockchainNetwork = localhost;
        transportUrl = "http://localhost:8545";
        break;

      case "matic":
        blockchainNetwork = polygon;
        transportUrl = "https://rpc-mainnet.maticvigil.com";
        break;

      case "maticmum":
        blockchainNetwork = polygonMumbai;
        transportUrl = "https://rpc-mumbai.maticvigil.com/";
        break;
    }

    const publicClient = createWalletClient({
      account: account,
      chain: blockchainNetwork,
      transport: http(transportUrl),
    }).extend(publicActions);
    // console.log("publicClient: ", publicClient);

    const data = encodeFunctionData({
      abi: promptNFTABI["abi"],
      functionName: "getContractOwnerPrompt",
      args: [BigInt(tokenId)],
    });

    const callResponse = await publicClient.call({
      account: account.address,
      data: data,
      to: PROMPT_NFT_CONTRACT_ADDRESS,
    });
    // console.log("callResponse: ", callResponse);

    const outputs = promptNFTABI["abi"].find(
      (abi) => abi?.name === "getContractOwnerPrompt"
    ).outputs;
    // console.log("outputs: ", outputs);

    const [contractOwnerEncryptDataResult, negativePrompt1] =
      decodeAbiParameters(outputs, callResponse?.data);

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
    try {
      const contractOwnerDecryptResult = decrypt({
        encryptedData: contractOwnerEncryptData,
        privateKey: process.env.NEXT_PUBLIC_PROMPTER_PRIVATE_KEY,
      });
      // console.log("contractOwnerDecryptResult:", contractOwnerDecryptResult);

      res.json({
        isLoggedIn: true,
        prompt: contractOwnerDecryptResult,
        error: undefined,
      });
    } catch (error) {
      console.error(error);
      res.json({
        isLoggedIn: undefined,
        prompt: undefined,
        error: error,
      });
    }
  } else {
    res.json({
      isLoggedIn: false,
      prompt: "User is not logged in.",
      error: undefined,
    });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
