import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import CardNft from "@/components/CardNft";
import WalletProfile from "@/components/WalletProfile";

export default function ListRent({ data, isLoading }) {
  const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL;
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
              // console.log("nftData: ", nftData);
              // console.log("idx: ", idx);
              // console.log("pageIndex: ", pageIndex);
              // Check idx is in pagination.
              // pageIndex.rent starts from 1.
              // idx starts from 0.
              if (
                idx >= (pageIndex - 1) * NUMBER_PER_PAGE &&
                idx < pageIndex * NUMBER_PER_PAGE
              ) {
                return <CardNft nftData={nftData} />;
              }
            })}
            <Pagination
              count={Math.ceil(data.length / NUMBER_PER_PAGE)}
              page={pageIndex}
              onChange={handlePageIndexChange}
              variant="outlined"
              sx={{
                padding: "10",
                ul: {
                  "& .MuiPaginationItem-root": {
                    color: "darkgrey",
                    "&.Mui-selected": {
                      background: "lightcyan",
                      color: "darkgrey",
                    },
                  },
                },
              }}
            />
          </Box>
        </>
      );
    },
    [data, pageIndex]
  );

  return <RentCardList />;
}
