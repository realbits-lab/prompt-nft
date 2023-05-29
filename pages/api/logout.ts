import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

import { sessionOptions } from "@/lib/session";
import type { User } from "@/pages/api/user";

function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  req.session.destroy();
  res.json({ isLoggedIn: false, publicAddress: "" });
}

export default withIronSessionApiRoute(logoutRoute, sessionOptions);
