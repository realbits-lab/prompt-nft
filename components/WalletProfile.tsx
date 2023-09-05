import { useAccount, useNetwork } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { shortenAddress } from "@/lib/util";

export default function WalletProfile() {
  const CARD_MARGIN_TOP = "60px";

  //* Wagmi hooks.
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ mt: CARD_MARGIN_TOP }}>
        <Button variant="outlined">
          Address : {shortenAddress({ address })}
        </Button>
        <Button variant="outlined">Network : {chain?.network || "n/a"}</Button>
        <Button variant="outlined">
          Status :{" "}
          {isConnected
            ? "connected"
            : isConnecting
            ? "connecting"
            : "not connected"}
        </Button>
      </Box>
    </>
  );
}
