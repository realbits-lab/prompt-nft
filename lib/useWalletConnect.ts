import { useAccount, useNetwork } from "wagmi";
import { getAccount } from "@wagmi/core";
import { getChainId } from "@/lib/util";

export default function useWalletConnect(): Boolean {
  // console.log("call useWalletConnect()");

  //* Check wallet connect.
  //* - Should connect to wallet.
  const { connector, isConnected } = useAccount();
  // console.log("isConnected: ", isConnected);

  const account = getAccount();
  // console.log("account: ", account);

  // if (isConnected === false) {
  //   return false;
  // }

  //* Check network setting.
  //* - Should use the configured network.
  const { chain, chains } = useNetwork();
  // console.log("chain: ", chain);

  const configuredChainId = getChainId({
    chainName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
  });
  // console.log("configuredChainId: ", configuredChainId);

  if (chain?.id !== configuredChainId) {
    return false;
  }

  //* Return wallet connect status.
  //* - Return true or false.
  return true;
}
