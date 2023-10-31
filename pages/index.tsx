import dynamic from "next/dynamic";

const ListPage = dynamic(() => import("../components/ListPage"), {
  ssr: false,
});

export default function Home() {
  return <ListPage />;
}
