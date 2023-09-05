import React from "react";
import WalletProfile from "../WalletProfile";
import {
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import rentmarketABI from "../../contracts/rentMarket.json";
import faucetTokenABI from "../../contracts/faucetToken.json";
import {
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import {
  AlertSeverity,
  getUniqueKey,
  writeToastMessageState,
} from "../../lib/util";
import { useRecoilStateLoadable } from "recoil";

const RENT_MARKET_CONTRACT_ADDRES = process.env
  .NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS as `0x${string}`;
const ZERO_ADDRESS_STRING =
  "0x0000000000000000000000000000000000000000";

const ListFaucet = () => {
  const [formValue, setFormValue] = React.useState({
    tokenAddress: "",
    tokenName: "",
    inputFeeTokenAddress: ZERO_ADDRESS_STRING,
  });
  const { tokenAddress, tokenName, inputFeeTokenAddress } = formValue;

  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);

  const {
    data: dataAllToken,
    isError: isErrorAllToken,
    isLoading: isLoadingAllToken,
    status: statusAllToken,
  }: any = useContractRead({
    address: RENT_MARKET_CONTRACT_ADDRES,
    abi: rentmarketABI.abi,
    functionName: "getAllToken",
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);
    },
    onError(error) {
      // console.log("call onError()");
      // console.log("error: ", error);
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });
  // console.log("dataAllToken: ", dataAllToken);

  const {
    data: dataFaucetToken,
    write: writeFaucetToken,
    isLoading: isLoadingFaucetToken,
  } = useContractWrite({
    abi: faucetTokenABI.abi,
    functionName: "faucet",
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage: "Fauceting token is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onError(error) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: "Fauceting token is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });

  const {
    isLoading: isLoadingTransactionFaucetToken,
    isSuccess: isSuccessTransactionFaucetToken,
  } = useWaitForTransaction({
    hash: dataFaucetToken?.hash,
    onSuccess(data) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.info,
        snackbarMessage:
          "Fauceting token transaction is made successfully.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onError(error) {
      setWriteToastMessage({
        snackbarSeverity: AlertSeverity.error,
        snackbarMessage: "Fauceting token transaction is failed.",
        snackbarTime: new Date(),
        snackbarOpen: true,
      });
    },
    onSettled(data, error) {
      // console.log("call onSettled()");
      // console.log("data: ", data);
      // console.log("error: ", error);
    },
  });

  const faucetTokenValue: any = {
    address: inputFeeTokenAddress,
  };

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormValue((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  return (
    <>
      <WalletProfile />
      <TextField
        select
        fullWidth
        required
        id="outlined"
        label="Token Address"
        name="inputFeeTokenAddress"
        value={inputFeeTokenAddress}
        onChange={handleChange}
        sx={{ marginTop: "10px", marginBottom: "10px" }}
      >
        <MenuItem key={getUniqueKey()} value={ZERO_ADDRESS_STRING}>
          None
        </MenuItem>
        {dataAllToken?.map((token: any, idx: any) => (
          <MenuItem key={idx} value={token.tokenAddress}>
            {token.name}
          </MenuItem>
        ))}
      </TextField>
      <Button
        fullWidth
        sx={{ marginTop: "10px" }}
        disabled={
          isLoadingFaucetToken || isLoadingTransactionFaucetToken
        }
        variant="contained"
        onClick={async () => {
          if (inputFeeTokenAddress === ZERO_ADDRESS_STRING) return;

          try {
            writeFaucetToken?.(faucetTokenValue);
          } catch (error: any) {
            console.error(error);
            setWriteToastMessage({
              snackbarSeverity: AlertSeverity.error,
              snackbarMessage: error.reason,
              snackbarTime: new Date(),
              snackbarOpen: true,
            });
          }

          setWriteToastMessage({
            snackbarSeverity: AlertSeverity.info,
            snackbarMessage: "Make transaction for fauceting token.",
            snackbarTime: new Date(),
            snackbarOpen: true,
          });
        }}
      >
        {isLoadingFaucetToken || isLoadingTransactionFaucetToken ? (
          <Typography>Fauceting...</Typography>
        ) : (
          <Typography>Faucet</Typography>
        )}
      </Button>
    </>
  );
};

export default ListFaucet;
