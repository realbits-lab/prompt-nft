import Box from "@mui/material/Box";
import useUser from "@/lib/useUser";
import User from "@/components/User";
import CircularProgress from "@mui/material/CircularProgress";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
import { Typography } from "@mui/material";

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
  const CARD_MARGIN_TOP = "60px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  if (isLoading === false || user?.isLoggedIn === true) {
    return (
      <>
        <BrowserView>{children}</BrowserView>
        <MobileView>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            sx={{
              mt: CARD_MARGIN_TOP,
              mx: CARD_MARGIN_TOP,
            }}
          >
            <Typography variant="h6" color="primary">
              No support for mobile device now. Sorry for that. Please use
              desktop chrome browser for this fictures service.
            </Typography>
          </Box>
        </MobileView>
      </>
    );
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
