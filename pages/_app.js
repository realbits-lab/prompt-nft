import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { configureChains, WagmiConfig, createConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SWRConfig } from "swr";
import { RecoilRoot } from "recoil";
import { GoogleAnalytics } from "nextjs-google-analytics";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import "@/styles/globals.css";
import { themeOptions } from "@/utils/themeOptions";
import createEmotionCache from "@/utils/createEmotionCache";
import fetchJson from "@/lib/fetchJson";
import * as gtag from "@/lib/gtag";

// Add emotion cache.
const clientSideEmotionCache = createEmotionCache();

// Add more properties.
function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}) {
  const theme = createTheme(themeOptions);
  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";
  const BLOCKCHAIN_NETWORK = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

  let chains;
  switch (BLOCKCHAIN_NETWORK) {
    case "localhost":
    default:
      chains = [localhost];
      break;

    case "matic":
      chains = [polygon];
      break;

    case "maticmum":
      chains = [polygonMumbai];
      break;
  }

  //* Wagmi client
  const {
    publicClient: wagmiPublicClient,
    webSocketPublicClient: wagmiWebSocketPublicClient,
  } = configureChains(chains, [
    alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
    publicProvider(),
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    publicClient: wagmiPublicClient,
    webSocketPublicClient: wagmiWebSocketPublicClient,
  });

  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

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
              <GoogleAnalytics trackPageViews />
              <Head>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                              window.dataLayer = window.dataLayer || [];
                              function gtag(){dataLayer.push(arguments);}
                              gtag('js', new Date());

                              gtag('config', '${gtag.GA_TRACKING_ID}', {
                                page_path: window.location.pathname,
                              });
                            `,
                  }}
                />
              </Head>
              {/* Global Site Tag (gtag.js) - Google Analytics */}
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
              />
              <Component {...pageProps} />
            </RecoilRoot>
          </WagmiConfig>
        </ThemeProvider>
      </CacheProvider>
    </SWRConfig>
  );
}

export default MyApp;
