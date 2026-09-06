const pool = require("../config/db");
const { firstRow } = require("../utils/spResults");

async function userHasAuctionAccess(user, auctionId) {
  if (!user || !auctionId) return false;

  const [resultSets] = await pool.query("CALL sp_check_auction_access(?, ?, ?)", [
    user.userId,
    user.role,
    auctionId,
  ]);

  const access = firstRow(resultSets);
  return Boolean(access?.has_access);
}

function checkAuctionAccess(paramName = "auctionId") {
  return async (req, res, next) => {
    try {
      const auctionId = req.params[paramName] || req.body.auction_id;

      if (!auctionId) {
        return res.status(400).json({ message: "auctionId is required" });
      }

      const hasAccess = await userHasAuctionAccess(req.user, Number(auctionId));

      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this auction" });
      }

      next();
    } catch (error) {
      console.error("checkAuctionAccess error", error);
      res.status(500).json({ message: "Access check failed" });
    }
  };
}

module.exports = { checkAuctionAccess, userHasAuctionAccess };
