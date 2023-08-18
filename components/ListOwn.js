import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import CardNft from "@/components/CardNft";
import WalletProfile from "@/components/WalletProfile";

export default function ListOwn({ data, isLoading }) {
  // console.log("call ListOwn()");
  // console.log("isLoading: ", isLoading);
  // console.log("data: ", data);
  // console.log("allMyOwnDataCount: ", allMyOwnDataCount);
  const NUMBER_PER_PAGE = 1;

  const CARD_MAX_WIDTH = 420;
  const CARD_MIN_WIDTH = 375;

  const [pageIndex, setPageIndex] = React.useState(1);
  const handlePageIndexChange = (event, value) => {
    setPageIndex(value);
  };

  function LoadingPage() {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Owned NFT list</Typography>
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
        <Card
          sx={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}
        >
          <CardContent
            sx={{
              padding: "10",
            }}
          >
            <Typography>Owned NFT list</Typography>
            <Typography variant="h7">{message}</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const OwnCardList = React.useCallback(
    function OwnCardList() {
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
              message={"You do not have any image prompt NFT."}
            />
          </>
        );
      }

      return (
        <>
          <WalletProfile />

          <Box
            sx={{ marginTop: 1 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography>Owned NFT list</Typography>

            {data.map((nftData, idx) => {
              // console.log("nftData: ", nftData);
              // console.log("idx: ", idx);
              // console.log("pageIndex: ", pageIndex);
              // Check idx is in pagination.
              // pageIndex.own starts from 1.
              // idx starts from 0.

              return (
                <Box
                  sx={{
                    width: "100%",
                    marginTop: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <CardNft nftData={nftData} key={idx} />
                </Box>
              );
            })}
          </Box>
        </>
      );
    },
    [data, pageIndex, isLoading]
  );

  return <OwnCardList />;
}
