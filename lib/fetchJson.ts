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

export enum FetchType {
  URL,
  PROVIDER,
}

async function getMetadata({ tokenId, contract, signer }) {
  console.log("call getMetadata()");
  console.log("tokenId: ", tokenId);

  if (!contract || !signer || !tokenId) {
    console.error("contract or signer is null or undefined.");
    throw new FetchError({
      message: `Invalid contract(${contract}) or signer(${signer}) or tokenId(${tokenId}) for provider.`,
    });
  }

  try {
    const tokenURI = await contract
      .connect(signer)
      .tokenURI(tokenId.toNumber());
    console.log("tokenURI: ", tokenURI);

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

async function getAllRegisterData({ contract, signer }) {
  if (!contract || !signer) {
    console.error("contract or signer is null or undefined.");
    return {
      allRegisterDataCount: 0,
      allRegisterDataArray: [],
    };
  }

  //* Get all nft data from rentmarket contract.
  const allRegisterDataResultArray = await contract
    .connect(signer)
    .getAllRegisterData();
  // console.log("allRegisterDataArray: ", allRegisterDataArray);

  //* Return token data array.
  return {
    allRegisterDataCount: allRegisterDataResultArray.length,
    allRegisterDataArray: allRegisterDataResultArray,
  };
}

export default async function fetchJson<JSON = unknown>(
  [url, type, contract, signer, tokenId, ...remain]: [RequestInfo, FetchType],
  init?: RequestInit
): Promise<JSON> {
  console.log("call fetchJson()");
  console.log("url: ", url);
  console.log("type: ", type);
  console.log("contract: ", contract);
  console.log("signer: ", signer);
  console.log("remain: ", remain);
  // console.log("init: ", init);

  if (type === FetchType.PROVIDER) {
    switch (url) {
      case "getAllRegisterData":
        const getAllRegisterDataResult = await getAllRegisterData({
          contract: contract,
          signer: signer,
        });
        console.log("getAllRegisterDataResult: ", getAllRegisterDataResult);
        return getAllRegisterDataResult;

      case "getMetadata":
        const metadata = await getMetadata({
          contract: contract,
          signer: signer,
          tokenId: tokenId,
        });
        console.log("metadata: ", metadata);
        return metadata;

      default:
        throw new FetchError({
          message: `Invalid API(${url}) for provider.`,
        });
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
