import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { PrismaClient } from "@prisma/client";

async function handler(req, res) {
  //* Check method error.
  if (req.method !== "GET") {
    res.status(500).json({ error: "Unavailable method. Support only GET." });
    return;
  }

  //* Connect database.
  const prisma = new PrismaClient();
  await prisma.$connect();

  //* Check query.
  const params = req.query.updated;
  // console.log("params: ", params);

  //* Check session for newly-updated images checking of all api.
  let fetchTimestamp;
  if (req.session.updated) {
    // console.log("req.session.updated: ", req.session.updated);

    if (params === "true") {
      //* Update fetch timestamp in a session.
      fetchTimestamp = new Date();
      const updated = { fetchTimestamp: fetchTimestamp };
      req.session.updated = updated;
      await req.session.save();
    } else {
      fetchTimestamp = req.session.updated.fetchTimestamp;
    }
  } else {
    // console.log("no req.session.updated");
    fetchTimestamp = new Date();
    const updated = { fetchTimestamp: fetchTimestamp };
    req.session.updated = updated;
    await req.session.save();
    // console.log("saved req.session.updated: ", req.session.updated);
  }
  // console.log("fetchTimestamp: ", fetchTimestamp);

  //* GET /api/all
  //* Check imageUrl and prompt was saved in sqlite already.
  try {
    const findManyResult = await prisma.post.findMany({
      where: {
        isEncrypted: false,
        createdAt: { lte: fetchTimestamp },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // console.log("findManyResult: ", findManyResult);
    // console.log(
    //   "typeof findManyResult.createdAt: ",
    //   typeof findManyResult.createdAt
    // );

    if (findManyResult === null) {
      await prisma.$disconnect();
      return res.status(500).json({ data: "nok" });
    }

    const fineManyUpdateResult = await prisma.post.findMany({
      where: {
        isEncrypted: false,
        createdAt: { gte: fetchTimestamp },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // console.log("fineManyUpdateResult: ", fineManyUpdateResult);

    //* Send 200 OK response.
    await prisma.$disconnect();
    return res.status(200).json({
      data: findManyResult,
      newlyUpdatedData: fineManyUpdateResult,
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ data: "nok" });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
