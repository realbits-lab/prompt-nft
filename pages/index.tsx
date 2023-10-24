import dynamic from "next/dynamic";
import IntroPage from "./intro.page";
const ListPage = dynamic(() => import("../components/ListPage"), {
  ssr: false,
});

export default function Home() {
  return <IntroPage />;
}
