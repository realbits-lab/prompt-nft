import { v4 as uuidv4, v1 } from "uuid";

export const getChainName = ({ chainId }) => {
  // https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.js
  const chainIds = {
    0: "kardia",
    1: "ethereum",
    5: "goerli",
    6: "kotti",
    8: "ubiq",
    10: "optimism",
    19: "songbird",
    20: "elastos",
    25: "cronos",
    30: "rsk",
    40: "telos",
    50: "xdc",
    52: "csc",
    55: "zyx",
    56: "binance",
    57: "syscoin",
    60: "gochain",
    61: "ethereumclassic",
    66: "okexchain",
    70: "hoo",
    82: "meter",
    87: "nova network",
    88: "tomochain",
    100: "xdai",
    106: "velas",
    108: "thundercore",
    122: "fuse",
    128: "heco",
    137: "matic",
    200: "xdaiarb",
    246: "energyweb",
    250: "fantom",
    269: "hpb",
    288: "boba",
    321: "kucoin",
    336: "shiden",
    361: "theta",
    416: "sx",
    534: "candle",
    592: "astar",
    820: "callisto",
    888: "wanchain",
    1088: "metis",
    1231: "ultron",
    1284: "moonbeam",
    1285: "moonriver",
    1337: "localhost",
    2000: "dogechain",
    2020: "ronin",
    2222: "kava",
    4689: "iotex",
    5050: "xlc",
    5551: "nahmii",
    6969: "tombchain",
    8217: "klaytn",
    9001: "evmos",
    10000: "smartbch",
    31337: "localhost",
    32659: "fusion",
    42161: "arbitrum",
    42170: "arb-nova",
    42220: "celo",
    42262: "oasis",
    43114: "avalanche",
    47805: "rei",
    55555: "reichain",
    71402: "godwoken",
    80001: "maticmum",
    333999: "polis",
    888888: "vision",
    1313161554: "aurora",
    1666600000: "harmony",
    11297108109: "palm",
    836542336838601: "curio",
  };

  // console.log("chainId: ", chainId);
  // console.log("Number(chainId): ", Number(chainId));
  if (typeof chainId === "string" || chainId instanceof String) {
    if (chainId.startsWith("0x") === true) {
      return chainIds[Number(chainId)];
    } else {
      return chainId;
    }
  } else if (isInt(chainId) === true) {
    return chainIds[chainId];
  }
};

export const checkBlockchainNetwork = ({ inputChainId }) => {
  // console.log("inputChainId: ", inputChainId);
  const chainName = getChainName({ chainId: inputChainId });
  // console.log("chainName: ", chainName);

  if (chainName === process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    return true;
  } else {
    return false;
  }
};

// https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
export const isInt = (value) => {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
};

export const getUniqueKey = () => {
  // return Math.random().toString(16).slice(2);
  return uuidv4();
};
