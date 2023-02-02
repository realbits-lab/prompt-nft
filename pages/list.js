import React from "react";
import PropTypes from "prop-types";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon, polygonMumbai, localhost } from "wagmi/chains";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import List from "../components/List";
import User from "../components/User";
import { getChainName } from "../components/Util";

function HideOnScroll(props) {
  const { children, window } = props;

  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

function ListPage(props) {
  // console.log("call ListPage()");

  const [mode, setMode] = React.useState("image");
  const BUTTON_BORDER_RADIUS = 25;
  const SELECTED_BUTTON_BACKGROUND_COLOR = "#21b6ae";
  const SELECTED_BUTTON_PADDING = "2px 2px";

  let chains = [];
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

  //* Wagmi client
  const { provider } = configureChains(chains, [
    walletConnectProvider({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    }),
  ]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({ appName: "web3Modal", chains }),
    provider,
  });

  //* Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiClient, chains);

  const AppBarButton = ({ buttonMode }) => {
    return (
      <Button
        key={buttonMode}
        style={{
          borderRadius: BUTTON_BORDER_RADIUS,
          backgroundColor:
            mode === buttonMode && SELECTED_BUTTON_BACKGROUND_COLOR,
          padding: SELECTED_BUTTON_PADDING,
        }}
        sx={{ my: 2, color: "white" }}
        onClick={(e) => {
          e.preventDefault();
          setMode(buttonMode);
        }}
      >
        {buttonMode.toUpperCase()}
      </Button>
    );
  };

  //* Propagate wagmi client into List component.
  return (
    <React.Fragment>
      <WagmiConfig client={wagmiClient}>
        <HideOnScroll {...props}>
          <AppBar>
            <Toolbar>
              <Box sx={{ flexGrow: 1, display: "block" }}></Box>
              <Box sx={{ flexDirection: "row", flexGrow: 1 }}>
                <AppBarButton buttonMode="image" />
                <AppBarButton buttonMode="nft" />
                <AppBarButton buttonMode="own" />
                <AppBarButton buttonMode="rent" />
              </Box>

              {/* <Box sx={{ flexGrow: 0 }}>
                <User />
              </Box> */}
            </Toolbar>
          </AppBar>
        </HideOnScroll>

        <Container>
          <Box sx={{ my: 2 }}>
            <List mode={mode} />
          </Box>
        </Container>
      </WagmiConfig>

      <Web3Modal
        projectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
        ethereumClient={ethereumClient}
      />
    </React.Fragment>
  );
}

export default ListPage;
