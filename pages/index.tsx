import React, { useState } from "react";
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import List from "@/components/List";

const ListPage = dynamic(() => import("../components/ListPage"), {
  ssr: false,
});

export default function IndexPage() {
  console.log("call IndexPage()");

  const MENU_ENUM: { [key: string]: string } = {
    draw: "draw",
    faucet: "faucet",
    image: "image",
    nft: "nft",
    own: "own",
    rent: "rent",
    settings: "settings",
    theme: "theme",
  };
  const DEFAULT_MENU = MENU_ENUM.image;
  const [currentMode, setCurrentMode] = React.useState(DEFAULT_MENU);
  const router = useRouter();
  const queryMode = router.query.index;
  const queryUpdated = router.query.updated;
  console.log("router.query: ", router.query);
  console.log("queryUpdated: ", queryUpdated);
  console.log("queryMode: ", queryMode);

  React.useEffect(
    function () {
      // console.log("call useEffect()");
      // console.log("readDialogMessage: ", readDialogMessage);
      // console.log("queryMode: ", queryMode);

      const mode = getMode({ mode: queryMode?.[0] || DEFAULT_MENU });

      setCurrentMode(mode || DEFAULT_MENU);
    },
    [queryMode]
  );

  function getMode({ mode }: { mode: string }) {
    const result = Object.entries(MENU_ENUM).find(
      ([key, value]) => value === mode
    );
    if (result) return MENU_ENUM[mode];
    return;
  }

  return <ListPage inputMode="draw" />;
}
