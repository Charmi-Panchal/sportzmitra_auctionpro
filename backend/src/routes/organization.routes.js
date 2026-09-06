const express = require("express");
const pool = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { sendError } = require("../utils/errors");

const router = express.Router();

router.get("/my-organizations", authMiddleware, requireRole("AUCTION_ADMIN"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*
       FROM organizations o
       JOIN organization_admins oa ON oa.organization_id = o.id
       WHERE oa.user_id = ?
         AND oa.status = 'ACTIVE'
         AND o.status = 'ACTIVE'
       ORDER BY o.organization_name`,
      [req.user.userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("my-organizations error", error);
    sendError(res, error);
  }
});

router.post("/", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const {
      organization_name,
      contact_person,
      contact_mobile,
      plan_type,
      plan_expiry_date,
      max_auctions_allowed,
      logo_url,
    } = req.body;

    if (!organization_name) {
      return res.status(400).json({ message: "organization_name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO organizations
       (organization_name, contact_person, contact_mobile, logo_url, plan_type, plan_start_date,
        plan_expiry_date, max_auctions_allowed, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, 'ACTIVE', ?)`,
      [
        organization_name,
        contact_person || null,
        contact_mobile || null,
        logo_url || null,
        plan_type || "FREE_TRIAL",
        plan_expiry_date || null,
        max_auctions_allowed || 1,
        req.user.userId,
      ]
    );

    res.json({ message: "Organization created", organization_id: result.insertId });
  } catch (error) {
    console.error("create organization error", error);
    sendError(res, error);
  }
});

router.get("/", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM organizations ORDER BY id DESC`);
    res.json(rows);
  } catch (error) {
    console.error("list org error", error);
    sendError(res, error);
  }
});

router.get("/:id", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM organizations WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("get org error", error);
    sendError(res, error);
  }
});

router.put("/:id", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const {
      organization_name,
      contact_person,
      contact_mobile,
      plan_type,
      plan_expiry_date,
      max_auctions_allowed,
      logo_url,
    } = req.body;

    if (!organization_name) {
      return res.status(400).json({ message: "organization_name is required" });
    }

    const [result] = await pool.query(
      `UPDATE organizations
       SET organization_name = ?,
           contact_person = ?,
           contact_mobile = ?,
           logo_url = ?,
           plan_type = ?,
           plan_expiry_date = ?,
           max_auctions_allowed = ?
       WHERE id = ?`,
      [
        organization_name,
        contact_person || null,
        contact_mobile || null,
        logo_url || null,
        plan_type || "FREE_TRIAL",
        plan_expiry_date || null,
        max_auctions_allowed || 1,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ message: "Organization updated successfully" });
  } catch (error) {
    console.error("update organization error", error);
    sendError(res, error);
  }
});

router.patch("/:id/status", authMiddleware, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [result] = await pool.query(
      `UPDATE organizations SET status = ? WHERE id = ?`,
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ message: `Organization marked as ${status}` });
  } catch (error) {
    console.error("update organization status error", error);
    sendError(res, error);
  }
});

module.exports = router;
