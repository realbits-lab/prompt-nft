import { useAccount, useWalletClient, useNetwork } from "wagmi";
import Button from "@mui/material/Button";
import useUser from "@/lib/useUser";
import fetchJson, { FetchError } from "@/lib/fetchJson";

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
  // console.log("isError: ", isError);
  // console.log("isLoading: ", isLoading);
  const { user, mutateUser } = useUser();
  // const { status, connect, account, chainId, ethereum } = useMetaMask();

  // console.log("user: ", user);

  const handleLoginClick = async () => {
    const publicAddress = address.toLowerCase();
    // console.log("publicAddress: ", publicAddress);

    // Check user with public address and receive nonce as to user.
    // If user does not exist, back-end would add user data.
    const jsonResult = await fetchJson({ url: `/api/nonce/${publicAddress}` });
    // console.log("jsonResult: ", jsonResult);

    // Popup MetaMask confirmation modal to sign message with nonce data.
    const signMessageResult = await handleSignMessage({
      publicAddress: publicAddress,
      nonce: jsonResult.data.nonce,
    });
    // console.log("signMessageResult: ", signMessageResult);

    // Send signature to back-end on the /auth route.
    await handleAuthenticate({
      publicAddress: publicAddress,
      signature: signMessageResult,
    });
  };

  const handleSignMessage = async ({ publicAddress, nonce }) => {
    // console.log("selectedChain.id: ", selectedChain.id);
    const msgParams = JSON.stringify({
      domain: {
        chainId: selectedChain.id,
        name: "Realbits",
      },

      // Defining the message signing data content.
      message: {
        contents: `Login with ${nonce} nonce number.`,
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

    const params = [address, msgParams];
    const method = "eth_signTypedData_v4";

    const requestResult = await ethereum.request({
      method,
      params,
    });
    // console.log("requestResult: ", requestResult);
    return requestResult;
  };

  const handleAuthenticate = async ({ publicAddress, signature }) => {
    const body = { publicAddress, signature };
    try {
      mutateUser(
        await fetchJson(
          { url: "/api/login" },
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        )
      );
    } catch (error) {
      if (error instanceof FetchError) {
        console.error(error.data.message);
      } else {
        console.error("An unexpected error happened:", error);
      }
    }
  };

  const handleLogoutClick = async () => {
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

  return (
    <>
      {(user === undefined || user.isLoggedIn === false) && (
        <Button
          sx={{ my: 2, color: "white", display: "block" }}
          onClick={async () => {
            await handleLoginClick();
          }}
        >
          Login
        </Button>
      )}
      {user !== undefined && user.isLoggedIn === true && (
        <Button
          sx={{ my: 2, color: "white", display: "block" }}
          onClick={async () => {
            await handleLogoutClick();
          }}
        >
          Logout
        </Button>
      )}
    </>
  );
}
