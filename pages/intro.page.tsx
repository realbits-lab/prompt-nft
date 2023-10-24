import ListPage from "@/components/ListPage";
import React from "react";

const IntroPage = () => {
  const [mainPage, setMainPage] = React.useState(false);

  if (mainPage) {
    return <ListPage />;
  }

  return (
    <div>
      <button
        onClick={() => {
          setMainPage(true);
        }}
      >
        이동
      </button>
    </div>
  );
};

export default IntroPage;
