import { useState, useEffect } from "react";
import {
  useAccount,
  useWalletClient,
  useNetwork,
  useConnect,
} from "wagmi";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Link from "@mui/material/Link";
import { useRecoilStateLoadable } from "recoil";
import useUser from "@/lib/useUser";
import fetchJson, { FetchError } from "@/lib/fetchJson";
import { AlertSeverity, writeToastMessageState } from "@/lib/util";
import { handleChangeNetwork } from "@/lib/util";
import { Typography } from "@mui/material";

const targetNetWorkName = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

export async function handleSignMessage({
  account,
  chainId,
  walletClient,
}) {
  // console.log("call handleSignMessage()");
  // console.log("account: ", account);
  // console.log("chainId: ", chainId);
  // console.log("walletClient: ", walletClient);

  const domain = {
    chainId: chainId,
    name: "Realbits",
  };
  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    Login: [{ name: "contents", type: "string" }],
  };
  const primaryType = "Login";
  const message = {
    contents: process.env.NEXT_PUBLIC_LOGIN_SIGN_MESSAGE,
  };

  const signature = await walletClient?.signTypedData({
    account,
    domain,
    types,
    primaryType,
    message,
  });

  return signature;
}

export async function handleAuthenticate({
  publicAddress,
  signature,
  mutateUser,
}) {
  // console.log("call handleAuthenticate()");

  const body = { publicAddress, signature };
  let userData;
  try {
    userData = await fetchJson(
      { url: "/api/login" },
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    handleChangeNetwork({ networkName: targetNetWorkName });
  }

  // console.log("userData: ", userData);

  try {
    mutateUser(userData);
  } catch (error) {
    if (error instanceof FetchError) {
      console.error(error.data.message);
    } else {
      console.error("An unexpected error happened:", error);
    }
  }
}

export async function handleLogout({ mutateUser }) {
  try {
    mutateUser(
      await fetchJson({ url: "/api/logout" }, { method: "POST" }),
      false
    );
  } catch (error) {
    if (error instanceof FetchError) {
      console.error(error.data.message);
    } else {
      console.error("An unexpected error happened:", error);
    }
  }
}

export default function User({ hidden = false }) {
  //*----------------------------------------------------------------------------
  //* Wagmi.
  //*----------------------------------------------------------------------------
  const { chains, chain: selectedChain } = useNetwork();
  // console.log("selectedChain: ", selectedChain);
  const {
    connector: activeConnector,
    address,
    isConnected,
  } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);

  const { data: walletClient } = useWalletClient({
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      if (clickLogin === true) {
        handleLoginClick({
          chainId: selectedChain?.id,
          walletClient: data,
          mutateUser,
        });
      }
    },
    onError(error) {
      // console.log("error: ", error);
    },
    onSettled(data, error) {},
  });
  // console.log("walletClient: ", walletClient);

  const {
    connect,
    connectors,
    error: errorConnect,
    isLoading: isLoadingConnect,
    pendingConnector,
  } = useConnect({
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("error: ", error);
    },
    onSettled(data, error) {},
  });

  //*----------------------------------------------------------------------------
  //* Hook.
  //*----------------------------------------------------------------------------
  const { user, mutateUser } = useUser();
  // console.log("user: ", user);
  const [clickLogin, setClickLogin] = useState(false);

  //*---------------------------------------------------------------------------
  //* Snackbar.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  //*---------------------------------------------------------------------------
  //* Connectors select dialog.
  //*---------------------------------------------------------------------------
  const [openConnectorsDialog, setOpenConnectorsDialog] =
    useState(false);

  useEffect(() => {
    window.ethereum?.on("chainChanged", async () => {
      try {
        await mutateUser(
          await fetchJson({ url: "/api/logout" }, { method: "POST" }),
          false
        );
      } catch (error) {
        if (error instanceof FetchError) {
          console.error(error.data.message);
        } else {
          console.error("An unexpected error happened:", error);
        }
      }
    });
  }, []);

  //* Listen account change.
  useEffect(() => {
    // console.log("call useEffect()");
    // console.log("activeConnector: ", activeConnector);
    // console.log("user: ", user);

    async function handleConnectorUpdate({ account, chain }) {
      // console.log("call handleConnectorUpdate()");
      // console.log("account: ", account);
      // console.log("chain: ", chain);
      // console.log("user: ", user);
      // console.log("selectedChain?.id: ", selectedChain?.id);

      if (user?.isLoggedIn === true) {
        try {
          await mutateUser(
            await fetchJson(
              { url: "/api/logout" },
              { method: "POST" }
            ),
            false
          );
        } catch (error) {
          if (error instanceof FetchError) {
            console.error(error.data.message);
          } else {
            console.error("An unexpected error happened:", error);
          }
        }
      }
    }

    if (activeConnector) {
      activeConnector.on("change", handleConnectorUpdate);
    }

    return () => {
      // console.log("call activeConnector?.off()");

      activeConnector?.off("change", handleConnectorUpdate);
    };
  }, []);

  //* Handle login click.
  async function handleLoginClick({
    chainId,
    walletClient,
    mutateUser,
  }) {
    // console.log("call handleLoginClick()");
    // console.log("chainId: ", chainId);
    // console.log("walletClient: ", walletClient);
    // console.log("mutateUser: ", mutateUser);
    // console.log("isConnected: ", isConnected);

    if (isConnected === false) {
      setOpenConnectorsDialog(true);
      return;
    }
    // if (!address) {
    //   setWriteToastMessage({
    //     snackbarSeverity: AlertSeverity.warning,
    //     snackbarMessage: "Wallet is not connected.",
    //     snackbarTime: new Date(),
    //     snackbarOpen: true,
    //   });
    //   return;
    // }

    const publicAddress = address?.toLowerCase();
    // console.log("publicAddress: ", publicAddress);

    // Popup MetaMask confirmation modal to sign message with nonce data.
    //* TODO: Should check the chain id.
    const signMessageResult = await handleSignMessage({
      account: publicAddress,
      chainId,
      walletClient,
    });
    // console.log("signMessageResult: ", signMessageResult);

    // Send signature to back-end on the /auth route.
    await handleAuthenticate({
      publicAddress: publicAddress,
      signature: signMessageResult,
      mutateUser,
    });

    setClickLogin(false);
  }

  //* Handle logout click.
  async function handleLogoutClick({ mutateUser }) {
    await handleLogout({ mutateUser });
  }

  function renderConnectorsDialog() {
    return (
      <Dialog
        onClose={() => setOpenConnectorsDialog(false)}
        open={openConnectorsDialog}
      >
        <DialogTitle>Select connectors</DialogTitle>
        <List sx={{ pt: 0 }}>
          {connectors.map((connector, idx) => (
            <ListItem disableGutters key={connector.id}>
              {connector.ready ? (
                <ListItemButton
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setOpenConnectorsDialog(false);
                  }}
                >
                  {connector.name}
                  {!connector.ready && " (unsupported)1"}
                  {isLoadingConnect &&
                    connector.id === pendingConnector?.id &&
                    " (connecting)"}
                </ListItemButton>
              ) : (
                <ListItemButton
                  onClick={() => {
                    window.open(
                      "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn/related"
                    );
                  }}
                >
                  MetaMask를 설치한 후 다시 로그인해 주세요.
                </ListItemButton>
              )}
            </ListItem>
          ))}
        </List>
      </Dialog>
    );
  }

  if (hidden === true) {
    return null;
  }

  //* Render.
  return (
    <>
      {user?.isLoggedIn !== true && (
        <Button
          sx={{ my: 2, color: "white", display: "block" }}
          onClick={() => {
            setClickLogin(true);

            handleLoginClick({
              chainId: selectedChain?.id,
              walletClient,
              mutateUser,
            });
          }}
        >
          Login
        </Button>
      )}

      {user?.isLoggedIn === true && (
        <Button
          sx={{ my: 2, color: "white", display: "block" }}
          onClick={() => {
            handleLogoutClick({ mutateUser });
          }}
        >
          Logout
        </Button>
      )}

      {renderConnectorsDialog()}
    </>
  );
}
