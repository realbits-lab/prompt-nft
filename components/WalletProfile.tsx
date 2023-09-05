import { useState, useEffect } from "react";
import { useAccount, useNetwork, useConnect } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { shortenAddress } from "@/lib/util";

export default function WalletProfile() {
  const CARD_MARGIN_TOP = "60px";

  //* Wagmi hooks.
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { chain } = useNetwork();

  //* Connectors select dialog.
  const [openConnectorsDialog, setOpenConnectorsDialog] = useState(false);

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
                  {isLoading &&
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

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ mt: CARD_MARGIN_TOP }}>
        <Button variant="outlined">
          Address : {shortenAddress({ address })}
        </Button>
        <Button variant="outlined">Network : {chain?.network || "n/a"}</Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (!isConnected && !isConnecting) {
              setOpenConnectorsDialog(true);
            }
          }}
        >
          Status :{" "}
          {isConnected
            ? "connected"
            : isConnecting
            ? "connecting"
            : "not connected"}
        </Button>
      </Box>

      {renderConnectorsDialog()}
    </>
  );
}
