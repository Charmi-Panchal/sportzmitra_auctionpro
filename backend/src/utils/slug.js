function createSlug(text) {
  return String(text || "auction")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function createAuctionCode() {
  return `AUC${Date.now()}`;
}

module.exports = { createSlug, createAuctionCode };
