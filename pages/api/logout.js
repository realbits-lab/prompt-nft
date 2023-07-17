import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";

function handler(req, res) {
  console.log("call /api/logout");

  req.session.destroy();
  res.json({ isLoggedIn: false, publicAddress: "", rentPaymentNft: false });
}

export default withIronSessionApiRoute(handler, sessionOptions);
