import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import useUser from "@/lib/useUser";
import { useNetwork, useAccount, useSwitchNetwork, useConnect } from "wagmi";
import User from "@/components/User";
import CircularProgress from "@mui/material/CircularProgress";
import { BrowserView, MobileView } from "react-device-detect";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { isWalletConnected, getChainId } from "@/lib/util";

export default function LoginWrapper({ children }) {
  // console.log("call LoginWrapper()");

  const [openConnectorsDialog, setOpenConnectorsDialog] = useState(false);
  const [isWalletNetworkConnect, setIsWalletNetworkConnect] = useState();
  const { chains, chain: selectedChain } = useNetwork();
  const { address, isConnected } = useAccount();
  const {
    chains: useSwitchNetworkChains,
    error,
    isLoading: useSwitchNetworkIsLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();
  const {
    connect,
    connectors,
    error: errorConnect,
    isLoading: isLoadingConnect,
    pendingConnector,
  } = useConnect();

  //*----------------------------------------------------------------------------
  //* User hook.
  //*----------------------------------------------------------------------------
  const { user, isLoading } = useUser();
  // console.log("user: ", user);
  // console.log("isLoading: ", isLoading);

  //*---------------------------------------------------------------------------
  //* Constant variables.
  //*---------------------------------------------------------------------------
  const CARD_MARGIN_TOP = "60px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  useEffect(() => {
    console.log("call useEffect()");
    console.log("selectedChain: ", selectedChain);
    console.log("isConnected: ", isConnected);

    if (isWalletConnected({ isConnected, selectedChain }) === true) {
      setIsWalletNetworkConnect(true);
    } else {
      setIsWalletNetworkConnect(false);
    }
  }, [isConnected, selectedChain]);

  function ChangeWalletButton() {
    return (
      <Button
        variant="outlined"
        onClick={() => {
          switchNetwork?.(
            getChainId({
              chainName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
            })
          );
        }}
      >
        <Typography color="primary">
          Change wallet network to {process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}
        </Typography>
      </Button>
    );
  }

  function CheckingWalletMessage() {
    return (
      <Box sx={{ mt: CARD_MARGIN_TOP }}>
        <CircularProgress size={5} />
      </Box>
    );
  }

  function CheckingConnection() {
    return (
      <>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Button
            variant="contained"
            onClick={() => {
              setOpenConnectorsDialog(true);
            }}
          >
            CONNECT
          </Button>
        </Box>

        <Dialog
          onClose={() => setOpenConnectorsDialog(false)}
          open={openConnectorsDialog}
        >
          <DialogTitle>Select connectors</DialogTitle>
          <List sx={{ pt: 0 }}>
            {connectors.map((connector, idx) => (
              <ListItem disableGutters key={connector.id}>
                <ListItemButton
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setOpenConnectorsDialog(false);
                  }}
                >
                  {connector.name}
                  {!connector.ready && " (unsupported)"}
                  {isLoadingConnect &&
                    connector.id === pendingConnector?.id &&
                    " (connecting)"}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Dialog>
      </>
    );
  }

  function MobileMessage() {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          mt: CARD_MARGIN_TOP,
          mx: CARD_MARGIN_TOP,
        }}
      >
        <Typography variant="h6" color="primary">
          No support for mobile device now. Sorry for that. Please use desktop
          chrome browser for this fictures service.
        </Typography>
      </Box>
    );
  }

  if (isConnected === false) {
    return <CheckingConnection />;
  } else if (isLoading === false && user?.isLoggedIn === true) {
    return (
      <>
        <BrowserView>
          {isWalletNetworkConnect === true ? (
            children
          ) : isWalletNetworkConnect === false ? (
            <ChangeWalletButton />
          ) : (
            <CheckingWalletMessage />
          )}
        </BrowserView>
        <MobileView>
          <MobileMessage />
        </MobileView>
      </>
    );
  } else {
    return (
      <>
        <BrowserView>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            sx={{
              minWidth: CARD_MIN_WIDTH,
              maxWidth: CARD_MAX_WIDTH,
              marginTop: CARD_MARGIN_TOP,
            }}
          >
            {isLoading === true ? (
              <CircularProgress size={50} color="primary" />
            ) : isWalletNetworkConnect === true ? (
              <User title="Click for login" buttonColor="primary" />
            ) : isWalletNetworkConnect === false ? (
              <ChangeWalletButton />
            ) : (
              <CheckingWalletMessage />
            )}
          </Box>
        </BrowserView>
        <MobileView>
          <MobileMessage />
        </MobileView>
      </>
    );
  }
}
