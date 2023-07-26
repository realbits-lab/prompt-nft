import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";
import Box from "@mui/material/Box";
import useUser from "@/lib/useUser";

export default function LoginWrapper({ children }) {
  //*----------------------------------------------------------------------------
  //* User hook.
  //*----------------------------------------------------------------------------
  const { user, mutateUser } = useUser();
  // console.log("user: ", user);

  //*---------------------------------------------------------------------------
  //* Constant variables.
  //*---------------------------------------------------------------------------
  const CARD_MARGIN_TOP = "80px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  if (user?.isLoggedIn === true) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        minWidth: CARD_MIN_WIDTH,
        maxWidth: CARD_MAX_WIDTH,
        marginTop: CARD_MARGIN_TOP,
      }}
    >
      Click the LOGIN button.
    </Box>
  );
}
