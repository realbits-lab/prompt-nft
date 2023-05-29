import { AppProps } from "next/app";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, WagmiConfig, createConfig } from "wagmi";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
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
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
    }),
  ]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: modalConnectors({ appName: "web3Modal", chains }),
    publicClient,
  });

  //* Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiConfig, chains);

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        revalidateOnFocus: false,
        keepPreviousData: true,
        onError: (err) => {
          console.error(err);
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
            projectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
            ethereumClient={ethereumClient}
          />
        </ThemeProvider>
      </CacheProvider>
    </SWRConfig>
  );
};

export default MyApp;
