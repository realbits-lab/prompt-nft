import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "@/lib/session";

export type User = {
  isLoggedIn: boolean;
  publicAddress: string;
  rentPaymentNft: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse<User>) {
  console.log("call /api/user");
  console.log("req.session.user: ", req.session.user);

  if (req.session.user) {
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
      publicAddress: "",
      rentPaymentNft: false,
    });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
