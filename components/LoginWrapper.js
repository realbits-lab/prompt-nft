import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import useUser from "@/lib/useUser";
import { useNetwork, useAccount, useSwitchNetwork } from "wagmi";
import User from "@/components/User";
import CircularProgress from "@mui/material/CircularProgress";
import { BrowserView, MobileView } from "react-device-detect";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { isWalletConnected, getChainId } from "@/lib/util";

export default function LoginWrapper({ children }) {
  // console.log("call LoginWrapper()");

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

  //*----------------------------------------------------------------------------
  //* User hook.
  //*----------------------------------------------------------------------------
  const { user, isLoading } = useUser();
  console.log("user: ", user);
  console.log("isLoading: ", isLoading);

  //*---------------------------------------------------------------------------
  //* Constant variables.
  //*---------------------------------------------------------------------------
  const CARD_MARGIN_TOP = "60px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  useEffect(() => {
    // console.log("call useEffect()");
    // console.log("selectedChain: ", selectedChain);
    // console.log("isConnected: ", isConnected);

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

  if (isLoading === false && user?.isLoggedIn === true) {
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
              No support for mobile device now. Sorry for that. Please use
              desktop chrome browser for this fictures service.
            </Typography>
          </Box>
        </MobileView>
      </>
    );
  } else {
    return (
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
    );
  }
}
