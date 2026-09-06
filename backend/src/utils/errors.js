function getDbErrorMessage(error) {
  return error?.sqlMessage || error?.message || "Internal server error";
}

function sendError(res, error, fallback = "Internal server error") {
  const message = getDbErrorMessage(error) || fallback;
  const status = error?.sqlState === "45000" ? 400 : 500;
  return res.status(status).json({ message });
}

module.exports = { getDbErrorMessage, sendError };
