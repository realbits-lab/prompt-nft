import axios from "axios";
import { withIronSessionApiRoute } from "iron-session/next";
import { PrismaClient } from "@prisma/client";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

async function handler(req, res) {
  // console.log("call /api/posted");

  //* Check method error.
  if (req.method !== "POST") {
    // console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* Check if already logined.
  if (!req.session.user || req.session.user.isLoggedIn !== true) {
    return res.status(500).json({ error: "User is not logined." });
  }

  //* Required fields in body: prompt
  const { prompt } = req.body;
  // console.log("prompt: ", prompt);

  //* Find prompt.
  let resultPrismaPostFindUnique;
  try {
    resultPrismaPostFindUnique = await prisma.post.findUnique({
      where: {
        prompt: prompt,
      },
    });
    // console.log("resultPrismaPostFindUnique: ", resultPrismaPostFindUnique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "prisma.post.findUnique failed." });
    return;
  }

  //* Return database insert result.
  if (resultPrismaPostFindUnique) {
    res.status(200).json({ data: "ok" });
  } else {
    console.error("resultPrismaPostFindUnique: ", resultPrismaPostFindUnique);
    res.status(500).json({ message: "findUnique failed." });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
