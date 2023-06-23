import React from "react";
import dynamic from "next/dynamic";
const ListPage = dynamic(() => import("../../components/ListPage"), {
  ssr: false,
});

export default function handler() {
  return <ListPage />;
}
