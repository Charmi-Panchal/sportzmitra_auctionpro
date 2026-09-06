function unwrapCallResult(resultSets) {
  if (!Array.isArray(resultSets)) return [];
  return resultSets.filter((set) => Array.isArray(set));
}

function mapPublicSnapshot(resultSets) {
  const sets = unwrapCallResult(resultSets);
  return {
    auction: sets[0]?.[0] || null,
    state: sets[1]?.[0] || null,
    teams: sets[2] || [],
    teamsSummary: sets[2] || [],
    soldPlayers: sets[3] || [],
    unsoldPlayers: sets[4] || [],
    pendingPlayers: sets[5] || [],
    categorySummary: sets[6] || [],
    dashboardSummary: sets[7]?.[0] || {},
  };
}

function mapDashboard(resultSets) {
  const sets = unwrapCallResult(resultSets);
  return {
    auction: sets[0]?.[0] || null,
    teamSummary: sets[1]?.[0] || {},
    playerSummary: sets[2]?.[0] || {},
    state: sets[3]?.[0] || null,
  };
}

function firstRow(resultSets) {
  const sets = unwrapCallResult(resultSets);
  return sets[0]?.[0] || null;
}

module.exports = {
  unwrapCallResult,
  mapPublicSnapshot,
  mapDashboard,
  firstRow,
};
