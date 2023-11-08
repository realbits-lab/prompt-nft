import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CardNft from "@/components/CardNft";
import WalletProfile from "@/components/WalletProfile";

export default function ListRent({ data, isLoading }) {
  // console.log("call ListRent()");

  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  function LoadingPage() {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Rented NFT list</Typography>
        <CircularProgress sx={{ width: "50vw" }} />
      </Box>
    );
  }

  function NoContentPage({ message }) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}>
          <Typography>Rented NFT list</Typography>
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <Typography variant="h7">{message}</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const RentCardList = React.useCallback(
    function RentCardList(props) {
      if (isLoading === true) {
        return (
          <>
            <WalletProfile />
            <LoadingPage />
          </>
        );
      }

      if (!data || data.length === 0) {
        return (
          <>
            <WalletProfile />
            <NoContentPage
              message={"You have not yet rented any image prompt NFT."}
            />
          </>
        );
      }

      return (
        <>
          <Box
            sx={{ marginTop: 1 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography>Rented NFT list</Typography>

            {data.map((nftData, idx) => {
              return (
                <CardNft nftData={nftData} hideRentButton={true} key={idx} />
              );
            })}
          </Box>
        </>
      );
    },
    [data]
  );

  return <RentCardList />;
}
