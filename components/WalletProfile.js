import { useAccount, useNetwork } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { shortenAddress } from "@/lib/util";

export default function WalletProfile() {
  const CARD_MARGIN_TOP = "60px";

  //*---------------------------------------------------------------------------
  //* Wagmi.
  //*---------------------------------------------------------------------------
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ mt: CARD_MARGIN_TOP }}>
        <Button>{shortenAddress({ address })}</Button>
        <Button>{chain?.network}</Button>
        <Button>
          {isConnected
            ? "connected"
            : isConnecting
            ? "connecting"
            : "n/a connection"}
        </Button>
      </Box>
    </>
  );
}
