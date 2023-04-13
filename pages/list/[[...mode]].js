import React from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useRecoilStateLoadable, useRecoilValueLoadable } from "recoil";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import List from "../../components/List";
import {
  RBSnackbar,
  AlertSeverity,
  writeToastMessageState,
  readToastMessageState,
  writeDialogMessageState,
  readDialogMessageState,
} from "../../lib/util";

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

function ListPage(props) {
  // console.log("call ListPage()");
  const router = useRouter();
  const queryMode = router.query.mode;
  const queryUpdated = router.query.updated;
  // console.log("router.query: ", router.query);
  // console.log("queryUpdated: ", queryUpdated);
  // console.log("queryMode: ", queryMode);

  const [mode, setMode] = React.useState("image");
  const BUTTON_BORDER_RADIUS = 25;
  const SELECTED_BUTTON_BACKGROUND_COLOR = "#21b6ae";
  const SELECTED_BUTTON_PADDING = "2px 2px";

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
        setMode("image");
      }
    },
    [queryMode]
  );

  const AppBarButton = ({ buttonMode }) => {
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
          setMode(buttonMode);
        }}
      >
        {buttonMode.toUpperCase()}
      </Button>
    );
  };

  //* Propagate wagmi client into List component.
  return (
    <React.Fragment>
      <HideOnScroll {...props}>
        <AppBar>
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: "block" }}></Box>
            <Box sx={{ flexDirection: "row", flexGrow: 1 }}>
              <AppBarButton buttonMode="draw" />
              <AppBarButton buttonMode="image" />
              <AppBarButton buttonMode="nft" />
              <AppBarButton buttonMode="own" />
              <AppBarButton buttonMode="rent" />
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Container>
        <Box sx={{ my: 2 }}>
          <List mode={mode} updated={queryUpdated}/>
        </Box>
      </Container>

      <RBSnackbar
        open={readToastMessage.snackbarOpen}
        message={readToastMessage.snackbarMessage}
        severity={readToastMessage.snackbarSeverity}
        currentTime={readToastMessage.snackbarTime}
      />

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

export default ListPage;
