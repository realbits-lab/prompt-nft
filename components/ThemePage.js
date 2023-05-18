import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

export default function ThemePage() {
  const CARD_MARGIN_TOP = "60px";
  const CARD_MIN_WIDTH = 375;
  const CARD_PADDING = 1;

  return (
    <Box
      sx={{
        m: CARD_PADDING,
        marginTop: CARD_MARGIN_TOP,
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "start",
      }}
    >
      <Card>
        <CardContent
          sx={{
            width: "90vw",
          }}
        >
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Desert theme
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
