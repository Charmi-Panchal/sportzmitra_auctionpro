const express = require("express");
const pool = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { sendError } = require("../utils/errors");

const router = express.Router();

router.post("/auction-admin", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { name, mobile, email, organization_id } = req.body;

    if (!name || !mobile || !organization_id) {
      return res.status(400).json({ message: "Name, mobile and organization_id are required" });
    }

    await conn.beginTransaction();

    let userId;
    const [existingUsers] = await conn.query(`SELECT id FROM users WHERE mobile = ?`, [mobile]);

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await conn.query(`UPDATE users SET name = ?, email = COALESCE(?, email), status = 'ACTIVE' WHERE id = ?`, [
        name,
        email || null,
        userId,
      ]);
    } else {
      const [userResult] = await conn.query(
        `INSERT INTO users (name, mobile, email, status, is_mobile_verified) VALUES (?, ?, ?, 'ACTIVE', TRUE)`,
        [name, mobile, email || null]
      );
      userId = userResult.insertId;
    }

    await conn.query(`INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, 'AUCTION_ADMIN')`, [userId]);
    await conn.query(
      `INSERT IGNORE INTO organization_admins (organization_id, user_id, status) VALUES (?, ?, 'ACTIVE')`,
      [organization_id, userId]
    );

    await conn.commit();
    res.json({ message: "Auction admin assigned successfully", user_id: userId });
  } catch (error) {
    await conn.rollback();
    console.error("create auction admin error", error);
    sendError(res, error);
  } finally {
    conn.release();
  }
});

router.get("/organization/:id/admins", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.mobile, u.email, oa.status 
       FROM organization_admins oa
       JOIN users u ON oa.user_id = u.id
       WHERE oa.organization_id = ? AND oa.status = 'ACTIVE'`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("list organization admins error", error);
    sendError(res, error);
  }
});

router.delete("/auction-admin/:organization_id/:user_id", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE organization_admins SET status = 'INACTIVE' 
       WHERE organization_id = ? AND user_id = ?`,
      [req.params.organization_id, req.params.user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin mapping not found" });
    }

    res.json({ message: "Admin removed from organization" });
  } catch (error) {
    console.error("remove auction admin error", error);
    sendError(res, error);
  }
});

module.exports = router;
