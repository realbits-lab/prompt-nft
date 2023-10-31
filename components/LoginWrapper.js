import Box from "@mui/material/Box";
import useUser from "@/lib/useUser";
import User from "@/components/User";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoginWrapper({ children }) {
  // console.log("call LoginWrapper()");

  //*----------------------------------------------------------------------------
  //* User hook.
  //*----------------------------------------------------------------------------
  const { user, isLoading } = useUser();
  console.log("user: ", user);
  console.log("isLoading: ", isLoading);

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
      {isLoading === true ? (
        <CircularProgress size={50} color="primary" />
      ) : (
        <User title="Click for login" buttonColor="primary" />
      )}
    </Box>
  );
}
