import { AppProps } from "next/app";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, WagmiConfig, createConfig } from "wagmi";
import { createPublicClient, http } from "viem";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SWRConfig } from "swr";
import { RecoilRoot } from "recoil";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { CacheProvider, EmotionCache } from "@emotion/react";
import "@/styles/globals.css";
import { themeOptions } from "@/utils/themeOptions";
import createEmotionCache from "@/utils/createEmotionCache";
import fetchJson from "@/lib/fetchJson";
import { getChainName } from "@/lib/util";

// Add emotion cache.
const clientSideEmotionCache = createEmotionCache();

// Add more properties.
function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const theme = createTheme(themeOptions);
  const WALLET_CONNECT_PROJECT_ID =
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";
  // const METAMASK_DEEP_LINK = "test.fictures.xyz";
  // const METAMASK_DEEP_LINK = "7096-218-238-111-214.ngrok-free.app";
  const UNIVERSAL_LINK = "https://7096-218-238-111-214.ngrok-free.app";
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

  let chains;
  let transport;
  switch (BLOCKCHAIN_NETWORK) {
    case "localhost":
    default:
      chains = [localhost];
      transport = http("http://localhost:8545");
      break;

    case "matic":
      chains = [polygon];
      transport = http("https://rpc-mainnet.maticvigil.com");
      break;

    case "maticmum":
      chains = [polygonMumbai];
      transport = http("https://rpc-mumbai.maticvigil.com/");
      break;
  }

  //* Wagmi client
  const {
    publicClient: wagmiPublicClient,
    webSocketPublicClient: wagmiWebSocketPublicClient,
  } = configureChains(chains, [
    // w3mProvider({
    //   projectId: WALLET_CONNECT_PROJECT_ID,
    // }),
    alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains }),
      // ...w3mConnectors({
      //   chains,
      //   version: 1,
      //   projectId: WALLET_CONNECT_PROJECT_ID,
      // }),
    ],
    publicClient: wagmiPublicClient,
    // publicClient: createPublicClient({
    //   chain: chains,
    //   transport: transport,
    // }),
    webSocketPublicClient: wagmiWebSocketPublicClient,
  });

  //* Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiConfig, chains);

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        revalidateOnFocus: false,
        keepPreviousData: false,
        onError: (error) => {
          console.error(error);
        },
      }}
    >
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <WagmiConfig config={wagmiConfig}>
            <RecoilRoot>
              <Component {...pageProps} />
            </RecoilRoot>
          </WagmiConfig>

          {/* <Web3Modal
            projectId={WALLET_CONNECT_PROJECT_ID}
            ethereumClient={ethereumClient}
          /> */}
        </ThemeProvider>
      </CacheProvider>
    </SWRConfig>
  );
}

export default MyApp;
