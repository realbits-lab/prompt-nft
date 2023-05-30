import { getPublicClient } from "@wagmi/core";
import promptNFTABI from "@/contracts/promptNFT.json";

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
    };
  }) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }

    this.name = "FetchError";
    this.response = response;
    this.data = data ?? { message: message };
  }
}

async function getMetadata({
  tokenId,
  promptNftContract,
  signer,
}: {
  tokenId: any;
  promptNftContract: any;
  signer: any;
}) {
  // console.log("call getMetadata()");
  // console.log("tokenId: ", tokenId);

  if (!promptNftContract || !signer || !tokenId) {
    console.error(
      "promptNftContract or signer is null or undefined in getMetadata."
    );
    throw new Error(
      `Invalid contract(${promptNftContract}) or signer(${signer}) or tokenId(${tokenId}) for provider.`
    );
  }

  try {
    const tokenURI = await promptNftContract
      .connect(signer)
      .tokenURI(tokenId.toNumber());
    // console.log("tokenURI: ", tokenURI);

    //* Get token metadata from token uri.
    const fetchResult = await fetch(tokenURI);
    const tokenMetadata = await fetchResult.blob();
    const metadataJsonTextData = await tokenMetadata.text();
    const metadataJsonData = JSON.parse(metadataJsonTextData);

    return metadataJsonData;
  } catch (error) {
    console.error(error);
  }
}

async function getAllMyOwnData({
  promptNftContract,
  rentMarketContract,
  signer,
  ownerAddress,
}: {
  promptNftContract: any;
  rentMarketContract: any;
  signer: any;
  ownerAddress: any;
}) {
  console.log("call getAllMyOwnData()");
  // console.log("promptNftContract: ", promptNftContract);
  // console.log("signer: ", signer);
  // console.log("ownerAddress: ", ownerAddress);

  //* Check error case.
  if (!promptNftContract) {
    throw new Error("Prompt nft contract is undefined.");
  }
  // if (!signer) {
  //   throw new Error("Signer is undefined.");
  // }

  //* Get total supply of prompt nft.
  const publicClient = getPublicClient();
  // const totalSupply = (await publicClient.readContract({
  //   address: `0x${process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS?.slice(
  //     2
  //   )}`,
  //   abi: promptNFTABI["abi"],
  //   functionName: "balanceOf",
  //   args: [ownerAddress],
  // })) as any;
  const totalSupply = await promptNftContract.read.balanceOf([ownerAddress]);
  // console.log("totalSupply: ", totalSupply);

  //* Get all metadata per each token as to token uri.
  let tokenDataArray: Array<any> = [];
  for (let i = 0; i < totalSupply; i++) {
    //* Get token id and uri.
    const tokenId = await promptNftContract.read.tokenOfOwnerByIndex([
      ownerAddress,
      i,
    ]);

    //* Add token metadata.
    tokenDataArray.push({
      tokenId: tokenId,
    });
  }
  // console.log("tokenDataArray: ", tokenDataArray);

  //* Return token data array.
  return tokenDataArray;
}

async function getAllRentData({
  rentMarketContract,
  signer,
  renterAddress,
}: {
  rentMarketContract: any;
  signer: any;
  renterAddress: any;
}) {
  // console.log("call getAllRentData()");
  // console.log("rentMarketContract: ", rentMarketContract);
  // console.log("signer: ", signer);
  // console.log("renterAddress: ", renterAddress);

  if (!rentMarketContract || !signer) {
    console.error(
      "rentMarketContract or signer is null or undefined in getAllRentData."
    );
    return [];
  }

  const allRentDataResult = await rentMarketContract
    .connect(signer)
    .getAllRentData();
  // console.log("allRentDataResult:", allRentDataResult);

  const allRentDataArrayWithMetadata = allRentDataResult.filter(
    (rentElement: any) =>
      rentElement.renteeAddress.localeCompare(renterAddress, undefined, {
        sensitivity: "accent",
      }) === 0
  );

  // Return all my rent data array.
  return allRentDataArrayWithMetadata;
}

async function getAllRegisterData({
  rentMarketContract,
  signer,
}: {
  rentMarketContract: any;
  signer: any;
}) {
  if (!rentMarketContract || !signer) {
    console.error(
      "rentMarketContract or signer is null or undefined in getAllRegisterData."
    );
    return [];
  }

  //* Get all collection data from rentmarket contract.
  //* collectionAddress
  const allCollectionResultArray = await rentMarketContract
    .connect(signer)
    .getAllCollection();
  // console.log("allCollectionResultArray: ", allCollectionResultArray);

  //* Get all nft data from rentmarket contract.
  //* nftAddress
  const allRegisterDataResultArray = await rentMarketContract
    .connect(signer)
    .getAllRegisterData();
  // console.log("allRegisterDataResultArray: ", allRegisterDataResultArray);

  const addressFilteredDataArray = allRegisterDataResultArray.filter(function (
    registerData: any
  ) {
    return allCollectionResultArray.some(function (collection: any) {
      return (
        registerData.nftAddress.localeCompare(
          collection.collectionAddress,
          undefined,
          { sensitivity: "accent" }
        ) === 0
      );
    });
  });
  // console.log("addressFilteredDataArray: ", addressFilteredDataArray);

  //* Return token data array.
  return addressFilteredDataArray.reverse();
}

export default async function fetchJson<JSON = unknown>(
  {
    url,
    command,
    promptNftContract,
    rentMarketContract,
    signer,
    tokenId,
    ownerAddress,
    renterAddress,
  }: {
    url: RequestInfo;
    command: string;
    promptNftContract: any;
    rentMarketContract: any;
    signer: any;
    tokenId: any;
    ownerAddress: any;
    renterAddress: any;
  },
  init?: RequestInit
): Promise<any> {
  console.log("call fetchJson()");
  // console.log("url: ", url);
  // console.log("type: ", type);
  // console.log("contract: ", contract);
  // console.log("signer: ", signer);
  // console.log("remain: ", remain);
  // console.log("init: ", init);

  if (url === undefined) {
    switch (command) {
      case "getAllRegisterData":
        const getAllRegisterDataResult = await getAllRegisterData({
          rentMarketContract: rentMarketContract,
          signer: signer,
        });
        return getAllRegisterDataResult;

      case "getAllMyOwnData":
        const getAllMyOwnDataResult = await getAllMyOwnData({
          promptNftContract: promptNftContract,
          rentMarketContract: rentMarketContract,
          signer: signer,
          ownerAddress: ownerAddress,
        });
        console.log("getAllMyOwnDataResult: ", getAllMyOwnDataResult);
        return getAllMyOwnDataResult;

      case "getAllMyRentData":
        const getAllMyRentData = await getAllRentData({
          rentMarketContract: rentMarketContract,
          signer: signer,
          renterAddress: renterAddress,
        });
        // console.log("getAllMyRentData: ", getAllMyRentData);
        return getAllMyRentData;

      case "getMetadata":
        // console.log("case getMetadata");
        // console.log("url: ", url);
        // console.log("type: ", type);
        // console.log("contract: ", contract);
        // console.log("signer: ", signer);
        // console.log("tokenId: ", tokenId);
        // console.log("remain: ", remain);
        const metadata = await getMetadata({
          promptNftContract: promptNftContract,
          signer: signer,
          tokenId: tokenId,
        });
        // console.log("metadata: ", metadata);
        return metadata;

      default:
        throw new Error(`Invalid API(${url}) for provider.`);
    }
  }

  const response = await fetch(url, init);

  // if the server replies, there's always some data in json
  // if there's a network error, it will throw at the previous line
  const data = await response.json();
  // console.log("data: ", data);

  // response.ok is true when res.status is 2xx
  // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
  if (response?.ok) {
    return data;
  }

  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}
