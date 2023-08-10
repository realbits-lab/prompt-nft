import React, { useState } from "react";
import {
  useAccount,
  useWalletClient,
  useNetwork,
  useConnect,
} from "wagmi";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useRecoilStateLoadable } from "recoil";
import useUser from "@/lib/useUser";
import fetchJson, { FetchError } from "@/lib/fetchJson";
import { writeToastMessageState } from "@/lib/util";
import { KeyedMutator } from "swr";
import { LoginButtonDesktop } from "./User.styled";

interface Networks {
  [key: string]: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}

const networks: Networks = {
  mumbai: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: "Mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  },
};

export const changeNetwork = async ({
  networkName,
}: {
  networkName: string;
}) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
};

const handleLogout = async ({
  mutateUser,
}: {
  mutateUser: KeyedMutator<User>;
}) => {
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
};

interface HandleSignMessageProps {
  account: string | undefined;
  chainId: number | undefined;
  walletClient: any;
}

export const handleSignMessage = async ({
  account,
  chainId,
  walletClient,
}: HandleSignMessageProps) => {
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
};

interface HandleAuthenicateProps {
  publicAddress: string | undefined;
  signature: string;
  mutateUser: KeyedMutator<User>;
}

const handleAuthenticate = async ({
  publicAddress,
  signature,
  mutateUser,
}: HandleAuthenicateProps) => {
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
    changeNetwork({ networkName: "mumbai" });
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
};

interface HandleLoginClickProps {
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  walletClient: any;
  mutateUser: KeyedMutator<User>;
  isConnected: boolean;
  setClickLogin: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenConnectorsDialog: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

//* Handle login click.
const handleLoginClick = async ({
  address,
  chainId,
  walletClient,
  mutateUser,
  isConnected,
  setClickLogin,
  setOpenConnectorsDialog,
}: HandleLoginClickProps) => {
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
};

interface Props {
  hidden?: boolean;
}

const User = ({ hidden = false }: Props) => {
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
  const { user, mutateUser } = useUser();

  const { data: walletClient } = useWalletClient({
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      if (clickLogin === true) {
        handleLoginClick({
          address,
          chainId: selectedChain?.id,
          walletClient: data,
          isConnected,
          mutateUser,
          setClickLogin,
          setOpenConnectorsDialog,
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

  const handleLogoutClick = async ({
    mutateUser,
  }: {
    mutateUser: KeyedMutator<User>;
  }) => {
    await handleLogout({ mutateUser });
  };

  if (hidden === true) {
    return null;
  }

  return (
    <>
      {user?.isLoggedIn !== true && (
        <LoginButtonDesktop.Button
          onClick={() => {
            setClickLogin(true);

            handleLoginClick({
              address,
              chainId: selectedChain?.id,
              walletClient,
              isConnected,
              mutateUser,
              setClickLogin,
              setOpenConnectorsDialog,
            });
          }}
        >
          Login
        </LoginButtonDesktop.Button>
      )}

      {user?.isLoggedIn === true && (
        <LoginButtonDesktop.Button
          onClick={() => {
            handleLogoutClick({ mutateUser });
          }}
        >
          Logout
        </LoginButtonDesktop.Button>
      )}

      {
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
      }
    </>
  );
};

export default User;
