import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../lib/session";

export type User = {
  isLoggedIn: boolean;
  publicAddress: string;
};

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  // console.log("req.session.user: ", req.session.user);

  if (req.session.user) {
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
      publicAddress: "",
    });
  }
}

export default withIronSessionApiRoute(userRoute, sessionOptions);
