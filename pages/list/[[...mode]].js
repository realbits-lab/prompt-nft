import React from "react";
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useRecoilStateLoadable, useRecoilValueLoadable } from "recoil";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Slide from "@mui/material/Slide";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@/components/List";
import useUser from "@/lib/useUser";
import {
  RBSnackbar,
  AlertSeverity,
  writeToastMessageState,
  readToastMessageState,
  writeDialogMessageState,
  readDialogMessageState,
} from "@/lib/util";
import fetchJson, { FetchError } from "@/lib/fetchJson";
const User = dynamic(() => import("../../components/User"), {
  ssr: false,
});

function HideOnScroll(props) {
  const { children, window } = props;

  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

export default function ListPage(props) {
  // console.log("call ListPage()");

  const DEFAULT_MENU = "draw";
  const BOARD_URL = "https://muve.moim.co/forums/QEUREBYLO";
  let MARKET_URL;
  if (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK === "matic") {
    MARKET_URL = "https://rent-market-production.vercel.app/";
  } else {
    MARKET_URL = "https://rent-market-development.vercel.app/";
  }
  const router = useRouter();
  const queryMode = router.query.mode;
  const queryUpdated = router.query.updated;
  // console.log("router.query: ", router.query);
  // console.log("queryUpdated: ", queryUpdated);
  // console.log("queryMode: ", queryMode);

  const { user, mutateUser } = useUser();
  const [mode, setMode] = React.useState(DEFAULT_MENU);
  const [newImageCount, setNewImageCount] = React.useState(0);
  const BUTTON_BORDER_RADIUS = 25;
  const SELECTED_BUTTON_BACKGROUND_COLOR = "#21b6ae";
  const SELECTED_BUTTON_PADDING = "2px 2px";

  //*---------------------------------------------------------------------------
  //* Setting menu variables.
  //*---------------------------------------------------------------------------
  const [settingMenuAnchorEl, setSettingMenuAnchorEl] = React.useState(null);
  const openSettingMenu = Boolean(settingMenuAnchorEl);
  function handleSettingMenuOpen(event) {
    setSettingMenuAnchorEl(event.currentTarget);
  }
  function handleSettingMenuClose() {
    setSettingMenuAnchorEl(null);
  }

  //*---------------------------------------------------------------------------
  //* Snackbar variables.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);
  const writeToastMessage =
    writeToastMessageLoadable?.state === "hasValue"
      ? writeToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: undefined,
          snackbarTime: new Date(),
          snackbarOpen: false,
        };

  const readToastMessageLoadable = useRecoilValueLoadable(
    readToastMessageState
  );
  const readToastMessage =
    readToastMessageLoadable?.state === "hasValue"
      ? readToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: undefined,
          snackbarTime: new Date(),
          snackbarOpen: false,
        };

  //*---------------------------------------------------------------------------
  //* Prompt dialog variables.
  //*---------------------------------------------------------------------------
  const [writeDialogMessageLoadable, setWriteDialogMessage] =
    useRecoilStateLoadable(writeDialogMessageState);
  const writeDialogMessage =
    writeDialogMessageLoadable?.state === "hasValue"
      ? writeDialogMessageLoadable.contents
      : {
          decyprtedPrompt: undefined,
          openDialog: false,
        };

  const readDialogMessageLoadable = useRecoilValueLoadable(
    readDialogMessageState
  );
  const readDialogMessage =
    readDialogMessageLoadable?.state === "hasValue"
      ? readDialogMessageLoadable.contents
      : {
          decyprtedPrompt: undefined,
          openDialog: false,
        };

  React.useEffect(
    function () {
      // console.log("call useEffect()");
      // console.log("readDialogMessage: ", readDialogMessage);
      // console.log("queryMode: ", queryMode);

      if (
        queryMode &&
        Array.isArray(queryMode) === true &&
        queryMode.length > 0
      ) {
        // console.log("setMode(queryMode[0])");
        setMode(queryMode[0]);
      } else {
        // console.log("setMode(image)");
        setMode(DEFAULT_MENU);
      }
    },
    [queryMode]
  );

  function AppBarButton({ buttonMode }) {
    return (
      <Button
        key={buttonMode}
        style={{
          borderRadius: BUTTON_BORDER_RADIUS,
          backgroundColor:
            buttonMode === mode ? SELECTED_BUTTON_BACKGROUND_COLOR : null,
          padding: SELECTED_BUTTON_PADDING,
        }}
        sx={{ my: 2, color: "white" }}
        onClick={(e) => {
          // console.log("call onClick()");
          // console.log("buttonMode: ", buttonMode);
          // console.log("newImageCount: ", newImageCount);

          if (buttonMode === "image" && newImageCount > 0) {
            // console.log("route to /list/image?updated=true");
            Router.reload("/list/image?updated=true");
          }

          setMode(buttonMode);
        }}
      >
        {buttonMode.toUpperCase()}
      </Button>
    );
  }

  function setNewBadgeOnImageAppBarButton({ newImageCount }) {
    // console.log("call setNewBadgeOnImageAppBarButton()");
    // console.log("newImageCount: ", newImageCount);
    setNewImageCount(newImageCount);
  }

  //* Propagate wagmi client into List component.
  return (
    <React.Fragment>
      {/*//*App bat menu. */}
      <HideOnScroll {...props}>
        <AppBar>
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: "block" }}></Box>
            <Box sx={{ flexGrow: 1, flexDirection: "row" }}>
              <AppBarButton buttonMode="draw" />
              <Badge
                badgeContent={newImageCount}
                color="secondary"
                overlap="circular"
              >
                <AppBarButton buttonMode="image" />
              </Badge>
              <AppBarButton buttonMode="nft" />
              {/* <AppBarButton buttonMode="own" />
              <AppBarButton buttonMode="rent" /> */}
            </Box>

            <Box>
              {(user === undefined || user.isLoggedIn === false) && <User />}
              {user !== undefined && user.isLoggedIn === true && (
                <Button
                  id="basic-button"
                  aria-controls={openSettingMenu ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openSettingMenu ? "true" : undefined}
                  onClick={(event) => {
                    if (user !== undefined && user.isLoggedIn === true) {
                      handleSettingMenuOpen(event);
                    }
                  }}
                  style={{
                    borderRadius: BUTTON_BORDER_RADIUS,
                    backgroundColor: null,
                    padding: SELECTED_BUTTON_PADDING,
                  }}
                  sx={{ my: 2, color: "white" }}
                >
                  <MenuIcon />
                </Button>
              )}
              <Menu
                id="basic-menu"
                anchorEl={settingMenuAnchorEl}
                open={openSettingMenu}
                onClose={handleSettingMenuClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem
                  onClick={() => {
                    setMode("own");
                    handleSettingMenuClose();
                  }}
                >
                  OWN
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMode("rent");
                    handleSettingMenuClose();
                  }}
                >
                  RENT
                </MenuItem>
                <Link
                  href={MARKET_URL}
                  target="_blank"
                  style={{ color: "inherit", textDecoration: "inherit" }}
                >
                  <MenuItem
                    onClick={() => {
                      handleSettingMenuClose();
                    }}
                  >
                    MARKET
                  </MenuItem>
                </Link>
                <Link
                  href={BOARD_URL}
                  target="_blank"
                  style={{ color: "inherit", textDecoration: "inherit" }}
                >
                  <MenuItem
                    onClick={() => {
                      handleSettingMenuClose();
                    }}
                  >
                    BOARD
                  </MenuItem>
                </Link>
                <MenuItem
                  onClick={() => {
                    setMode("theme");
                    handleSettingMenuClose();
                  }}
                >
                  THEME
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    try {
                      mutateUser(
                        await fetchJson(
                          { url: "/api/logout" },
                          { method: "POST" }
                        ),
                        false
                      );
                    } catch (error) {
                      if (error instanceof FetchError) {
                        console.error(error.data.message);
                      } else {
                        console.error("An unexpected error happened:", error);
                      }
                    }
                    setMode("image");
                    handleSettingMenuClose();
                  }}
                >
                  LOGOUT
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/*//*Image content part. */}
      <Box sx={{ my: 2 }}>
        <List
          mode={mode}
          updated={queryUpdated}
          setNewImageCountFunc={setNewBadgeOnImageAppBarButton}
        />
      </Box>

      {/*//*Toast snackbar. */}
      <RBSnackbar
        open={readToastMessage.snackbarOpen}
        message={readToastMessage.snackbarMessage}
        severity={readToastMessage.snackbarSeverity}
        currentTime={readToastMessage.snackbarTime}
      />

      {/*//*Prompt dialog. */}
      <Dialog
        open={readDialogMessage.openDialog}
        onClose={() =>
          setWriteDialogMessage({
            decyprtedPrompt: readDialogMessage.decyprtedPrompt,
            openDialog: false,
          })
        }
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Prompt</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {readDialogMessage.decyprtedPrompt || ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setWriteDialogMessage({
                decyprtedPrompt: readDialogMessage.decyprtedPrompt,
                openDialog: false,
              })
            }
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
