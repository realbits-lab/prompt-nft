import { useAccount, useWalletClient, useNetwork } from "wagmi";
import { Typography } from "@mui/material";
import { useRecoilStateLoadable } from "recoil";
import useUser from "@/lib/useUser";
import fetchJson, { FetchError } from "@/lib/fetchJson";
import {
  RBSnackbar,
  AlertSeverity,
  writeToastMessageState,
  readToastMessageState,
  writeDialogMessageState,
  readDialogMessageState,
} from "@/lib/util";

export async function handleSignMessage({ accountAddress, chainId }) {
  const msgParams = JSON.stringify({
    domain: {
      chainId: chainId,
      name: "Realbits",
    },

    // Defining the message signing data content.
    message: {
      contents: process.env.NEXT_PUBLIC_LOGIN_SIGN_MESSAGE,
    },
    // Refers to the keys of the *types* object below.
    primaryType: "Login",

    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "chainId", type: "uint256" },
      ],
      // Refer to PrimaryType
      Login: [{ name: "contents", type: "string" }],
    },
  });

  const params = [accountAddress, msgParams];
  const method = "eth_signTypedData_v4";

  const requestResult = await ethereum.request({
    method,
    params,
  });
  // console.log("requestResult: ", requestResult);
  return requestResult;
}

async function handleAuthenticate({ publicAddress, signature, mutateUser }) {
  // console.log("call handleAuthenticate()");

  const body = { publicAddress, signature };
  const userData = await fetchJson(
    { url: "/api/login" },
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
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

export default function User() {
  //*----------------------------------------------------------------------------
  //* Define constance variables.
  //*----------------------------------------------------------------------------
  const { chains, chain: selectedChain } = useNetwork();
  // console.log("selectedChain: ", selectedChain);
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);
  const { data: walletClient } = useWalletClient();
  // console.log("walletClient: ", walletClient);
  const { user, mutateUser } = useUser();
  // console.log("user: ", user);

  //*---------------------------------------------------------------------------
  //* Snackbar variables.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);
  const writeToastMessage =
    writeToastMessageLoadable?.state === "hasValue"
      ? writeToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: undefined,
          snackbarTime: new Date(),
          snackbarOpen: false,
        };

  async function handleLoginClick() {
    if (!address) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.warning,
        snackbarMessage: "Wallet is not connected.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
      return;
    }

    const publicAddress = address.toLowerCase();
    // console.log("publicAddress: ", publicAddress);

    // Popup MetaMask confirmation modal to sign message with nonce data.
    const signMessageResult = await handleSignMessage({
      accountAddress: publicAddress,
      chainId: selectedChain.id,
    });
    // console.log("signMessageResult: ", signMessageResult);

    // Send signature to back-end on the /auth route.
    await handleAuthenticate({
      publicAddress: publicAddress,
      signature: signMessageResult,
      mutateUser,
    });
  }

  async function handleLogoutClick() {
    await handleLogout({ mutateUser });
  }

  return (
    <>
      {(user === undefined || user.isLoggedIn === false) && (
        <Typography
          sx={{ my: 2, color: "white", display: "block" }}
          onClick={async () => {
            await handleLoginClick();
          }}
        >
          Login
        </Typography>
      )}
      {user !== undefined && user.isLoggedIn === true && (
        <Typography
          sx={{ my: 2, color: "white", display: "block" }}
          onClick={async () => {
            await handleLogoutClick();
          }}
        >
          Logout
        </Typography>
      )}
    </>
  );
}
