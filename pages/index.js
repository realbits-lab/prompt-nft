import { MetaMaskProvider } from "metamask-react";
import Mint from "../components/Mint";

export default function Home() {
  return (
    <MetaMaskProvider>
      <Mint />
    </MetaMaskProvider>
  );
}
