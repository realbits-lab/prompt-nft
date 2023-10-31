import Box from "@mui/material/Box";
import useUser from "@/lib/useUser";
import Typography from "@mui/material/Typography";
import User from "@/components/User";

export default function LoginWrapper({ children }) {
  // console.log("call LoginWrapper()");

  //*----------------------------------------------------------------------------
  //* User hook.
  //*----------------------------------------------------------------------------
  const { user } = useUser();
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
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        minWidth: CARD_MIN_WIDTH,
        maxWidth: CARD_MAX_WIDTH,
        marginTop: CARD_MARGIN_TOP,
      }}
    >
      <User title="Click for login" buttonColor="primary" />
    </Box>
  );
}
