import { AppProps } from "next/app";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, WagmiConfig, createConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
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

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// Add emotion cache.
const clientSideEmotionCache = createEmotionCache();

// Add more properties.
const MyApp: React.FunctionComponent<MyAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const theme = createTheme(themeOptions);
  const WALLET_CONNECT_PROJECT_ID =
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";
  // const METAMASK_DEEP_LINK = "test.fictures.xyz";
  // const METAMASK_DEEP_LINK = "7096-218-238-111-214.ngrok-free.app";
  const UNIVERSAL_LINK = "https://7096-218-238-111-214.ngrok-free.app";

  let chains: any[] = [];
  if (
    getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK }) ===
    "matic"
  ) {
    chains = [polygon];
  } else if (
    getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK }) ===
    "maticmum"
  ) {
    chains = [polygonMumbai];
  } else if (
    getChainName({ chainId: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK }) ===
    "localhost"
  ) {
    chains = [localhost];
  } else {
    chains = [];
  }
  // console.log(
  //   "process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK: ",
  //   process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK
  // );
  // console.log(
  //   "process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: ",
  //   process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
  // );

  //* Wagmi client
  const {
    publicClient: wagmiPublicClient,
    webSocketPublicClient: wagmiWebSocketPublicClient,
  } = configureChains(chains, [
    w3mProvider({
      projectId: WALLET_CONNECT_PROJECT_ID,
    }),
    alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
  ]);
  // console.log("chains: ", chains);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      ...w3mConnectors({
        version: 2,
        chains,
        projectId: WALLET_CONNECT_PROJECT_ID,
      }),
      // new WalletConnectConnector({
      //   chains: [polygon, polygonMumbai],
      //   options: {
      //     projectId: WALLET_CONNECT_PROJECT_ID,
      //   },
      // }),
      new MetaMaskConnector({
        chains,
      }),
    ],
    publicClient: wagmiPublicClient,
    // webSocketPublicClient: wagmiWebSocketPublicClient,
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

          <Web3Modal
            projectId={WALLET_CONNECT_PROJECT_ID}
            ethereumClient={ethereumClient}
            mobileWallets={[
              {
                id: "metaMask",
                name: "Metamask",
                links: {
                  native: "metamask://",
                  universal: UNIVERSAL_LINK,
                },
              },
            ]}
            // walletImages={metaMask: "/metamask-logo.png"}
          />
        </ThemeProvider>
      </CacheProvider>
    </SWRConfig>
  );
};

export default MyApp;
