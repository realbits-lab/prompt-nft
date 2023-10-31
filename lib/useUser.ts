import { useState, useEffect } from "react";
import useSWR from "swr";
import { User } from "@/types/user";
import useWalletConnect from "@/lib/useWalletConnect";
import fetchJson, { FetchError } from "@/lib/fetchJson";

export default function useUser() {
  console.log("call useUser()");

  //* Call useWalletConnect for checking the safe wallet connection.
  const walletConnectionStatus: Boolean = useWalletConnect();
  console.log("walletConnectionStatus: ", walletConnectionStatus);

  const { data: user, mutate: mutateUser } = useSWR<User>({ url: "/api/user" });
  console.log("user: ", user);

  const [returnUserData, setReturnUserData] = useState(user);

  useEffect(() => {
    async function postUserLogout() {
      if (walletConnectionStatus === false && user?.isLoggedIn === true) {
        try {
          await mutateUser(
            await fetchJson({ url: "/api/logout" }, { method: "POST" }),
            false
          );

          setReturnUserData(user);
        } catch (error) {
          if (error instanceof FetchError) {
            console.error(error.data.message);
          } else {
            console.error("An unexpected error happened:", error);
          }
        }
      }
    }

    postUserLogout();
  }, [user]);

  console.log("user: ", user);
  return { user, mutateUser };
}
