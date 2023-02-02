import { useMetaMask } from "metamask-react";
import { useWeb3ModalNetwork } from "@web3modal/react";
import { useAccount, useSigner, useContract } from "wagmi";
import Button from "@mui/material/Button";
import useUser from "../lib/useUser";
import fetchJson, { FetchError } from "../lib/fetchJson";

function User() {
  const { user, mutateUser } = useUser();
  const { status, connect, account, chainId, ethereum } = useMetaMask();
  const { selectedChain, setSelectedChain } = useWeb3ModalNetwork();
  // console.log("selectedChain: ", selectedChain);
  const { address, isConnected } = useAccount();
  // console.log("address: ", address);
  // console.log("isConnected: ", isConnected);
  const { data: signer, isError, isLoading } = useSigner();
  // console.log("signer: ", signer);
  // console.log("isError: ", isError);
  // console.log("isLoading: ", isLoading);

  // console.log("user: ", user);

  const handleLoginClick = async () => {
    console.log("call handleLoginClick()");

    const publicAddress = address.toLowerCase();
    console.log("publicAddress: ", publicAddress);

    //* Check user with public address and receive nonce as to user.
    //* If user does not exist, back-end would add user data.
    const jsonResult = await fetchJson(`/api/nonce/${publicAddress}`);
    console.log("jsonResult: ", jsonResult);

    //* Popup MetaMask confirmation modal to sign message with nonce data.
    const signMessageResult = await handleSignMessage({
      publicAddress: publicAddress,
      nonce: jsonResult.data.nonce,
    });
    console.log("signMessageResult: ", signMessageResult);

    //* Send signature to back-end on the /auth route.
    await handleAuthenticate({
      publicAddress: publicAddress,
      signature: signMessageResult,
    });
  };

  async function handleSignMessage({ publicAddress, nonce }) {
    console.log("call handleSignMessage()");
    console.log("selectedChain: ", selectedChain);
    if (!selectedChain) {
      throw Error("No selectedChain");
      return;
    }

    const msgParams = JSON.stringify({
      domain: {
        chainId: selectedChain.id,
        name: "Realbits",
      },

      //* Defining the message signing data content.
      message: {
        contents: `Login with ${nonce} nonce number.`,
      },
      //* Refers to the keys of the *types* object below.
      primaryType: "Login",

      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        //* Refer to PrimaryType
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
  }

  async function handleAuthenticate({ publicAddress, signature }) {
    console.log("call handleAuthenticate()");

    const body = { publicAddress, signature };
    try {
      mutateUser(
        await fetchJson("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
    } catch (error) {
      if (error instanceof FetchError) {
        console.error(error.data.message);
      } else {
        console.error("An unexpected error happened:", error);
      }
    }
  }

  async function handleLogoutClick() {
    try {
      mutateUser(await fetchJson("/api/logout", { method: "POST" }), false);
    } catch (error) {
      if (error instanceof FetchError) {
        console.error(error.data.message);
      } else {
        console.error("An unexpected error happened:", error);
      }
    }
  }

  return (
    <div>
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
    </div>
  );
}

export default User;
