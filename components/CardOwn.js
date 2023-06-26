import React from "react";
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useContractRead,
  useSignTypedData,
  useContractEvent,
} from "wagmi";
import { getContract } from "wagmi/actions";
import { isMobile } from "react-device-detect";
import { useRecoilStateLoadable } from "recoil";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import {
  AlertSeverity,
  writeToastMessageState,
  writeDialogMessageState,
  handleCheckPrompt,
  getChainId,
} from "@/lib/util";
import useUser from "@/lib/useUser";
import promptNFTABI from "@/contracts/promptNFT.json";

function CardOwn({ nftData }) {
  // console.log("call CardOwn()");
  // console.log("nftData: ", nftData);

  //*---------------------------------------------------------------------------
  //* Wagmi hook.
  //*---------------------------------------------------------------------------
  const PROMPT_NFT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS;
  const [metadata, setMetadata] = React.useState();

  const promptNftContract = getContract({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI["abi"],
  });

  const domain = {
    chainId: getChainId({
      chainName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
    }),
    name: "Realbits",
  };
  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    Login: [{ name: "contents", type: "string" }],
  };
  const value = {
    contents: process.env.NEXT_PUBLIC_LOGIN_SIGN_MESSAGE,
  };
  const {
    data: dataSignTypedData,
    isError: isErrorSignTypedData,
    isLoading: isLoadingSignTypedData,
    isSuccess: isSuccessSignTypedData,
    signTypedData,
    signTypedDataAsync,
  } = useSignTypedData({
    domain: domain,
    types: types,
    value: value,
  });

  const { chains, chain: selectedChain } = useNetwork();
  const { address, isConnected } = useAccount();
  const {
    data: dataWalletClient,
    isError: isErrorWalletClient,
    isLoading: isLoadingWalletClient,
  } = useWalletClient();

  const {
    data: dataTokenURI,
    isError: isErrorTokenURI,
    isLoading: isLoadingTokenURI,
    isValidating: isValidatingTokenURI,
    status: statusTokenURI,
  } = useContractRead({
    address: PROMPT_NFT_CONTRACT_ADDRESS,
    abi: promptNFTABI.abi,
    functionName: "tokenURI",
    args: [nftData?.tokenId],
    watch: true,
    onSuccess(data) {
      // console.log("call onSuccess()");
      // console.log("data: ", data);

      fetch(data).then((fetchResult) =>
        fetchResult.blob().then((tokenMetadata) =>
          tokenMetadata.text().then((metadataJsonTextData) => {
            // console.log("metadataJsonTextData: ", metadataJsonTextData);
            const metadata = JSON.parse(metadataJsonTextData);
            // console.log("metadata: ", metadata);
            setMetadata(metadata);
          })
        )
      );
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

  //*---------------------------------------------------------------------------
  //* Constant variables.
  //*---------------------------------------------------------------------------
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
  const CARD_MARGIN_TOP = "50px";
  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  const { user, mutateUser } = useUser();

  function handleCardMediaImageError(e) {
    // console.log("call handleCardMediaImageError()");
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMAGE_URL;
  }

  //*---------------------------------------------------------------------------
  //* Toast message.
  //*---------------------------------------------------------------------------
  const [writeToastMessageLoadable, setWriteToastMessage] =
    useRecoilStateLoadable(writeToastMessageState);
  const writeToastMessage =
    writeToastMessageLoadable?.state === "hasValue"
      ? writeToastMessageLoadable.contents
      : {
          snackbarSeverity: AlertSeverity.info,
          snackbarMessage: "",
          snackbarTime: new Date(),
          snackbarOpen: true,
        };

  //*---------------------------------------------------------------------------
  //* Prompt dialog.
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

  return (
    <Box sx={{ m: CARD_PADDING, marginTop: CARD_MARGIN_TOP }}>
      <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
        {metadata ? (
          <CardMedia
            component="img"
            image={metadata ? metadata.image : ""}
            onError={handleCardMediaImageError}
          />
        ) : (
          <Skeleton
            variant="rounded"
            width={CARD_MIN_WIDTH}
            height={CARD_MIN_WIDTH}
          />
        )}
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            token id: {nftData?.tokenId.toString()}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            name: {metadata ? metadata.name : ""}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            description: {metadata ? metadata.description : ""}
          </Typography>
          <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
            component="div"
          >
            rent fee: {(nftData?.rentFee / 10n ** 18n).toString()} matic
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={async function () {
              await handleCheckPrompt({
                setWriteToastMessage: setWriteToastMessage,
                setWriteDialogMessage: setWriteDialogMessage,
                isMobile: isMobile,
                user: user,
                nftData: nftData,
                promptNftContract: promptNftContract,
                dataWalletClient: dataWalletClient,
                isConnected: isConnected,
                selectedChain: selectedChain,
                address: address,
                mutateUser: mutateUser,
                signTypedDataAsync: signTypedDataAsync,
              });
            }}
          >
            PROMPT
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

export default CardOwn;
