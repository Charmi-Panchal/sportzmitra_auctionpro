import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { getImageUrl } from "../utils/imageUrl";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  transports: ["websocket", "polling"],
});

function formatAmount(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function dicebearLogo(seed) {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;
}

const TEAM_ACCENTS = [
  { border: "border-[#e91e63]", badge: "bg-[#e91e63]/10 text-[#e91e63]", glow: "shadow-[#e91e63]/10" },
  { border: "border-[#00c853]", badge: "bg-[#00c853]/10 text-[#00c853]", glow: "shadow-[#00c853]/10" },
  { border: "border-[#0284c7]", badge: "bg-[#0284c7]/10 text-[#0284c7]", glow: "shadow-[#0284c7]/10" },
  { border: "border-[#d97706]", badge: "bg-[#d97706]/10 text-[#d97706]", glow: "shadow-[#d97706]/10" },
  { border: "border-[#9333ea]", badge: "bg-[#9333ea]/10 text-[#9333ea]", glow: "shadow-[#9333ea]/10" },
  { border: "border-[#0d9488]", badge: "bg-[#0d9488]/10 text-[#0d9488]", glow: "shadow-[#0d9488]/10" },
];

const DEFAULT_TEAMS = [];

const DEFAULT_PLAYER_PHOTO =
  "https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=400&h=400&fit=crop&crop=faces";

export default function PublicLiveView() {
  const { publicSlug } = useParams();
  const [auction, setAuction] = useState(null);
  const [state, setState] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState(null);

  const currentPlayer = useMemo(() => {
    if (!state) return null;
    return {
      id: state.current_player_id,
      player_name: state.player_name || "Rohit Sharma",
      category: state.category || "Category A",
      player_role: state.player_role || state.batting_style || "Right Hand Batter",
      base_price: state.base_price || 200000,
      photo_url: state.photo_url,
    };
  }, [state]);

  const loadAuction = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/public/auction/${publicSlug}`);
      setSnapshot(response.data);
      setAuction(response.data.auction || null);
      setState(response.data.state || null);
    } catch (error) {
      console.error("Public auction load error:", error);
    } finally {
      setLoading(false);
    }
  }, [publicSlug]);

  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  useEffect(() => {
    if (!auction?.id) return;

    socket.emit("joinPublicAuction", { auctionId: auction.id, publicSlug });

    const handleSnapshotUpdated = (payload) => {
      if (payload?.auction?.id === auction.id || payload?.auctionId === auction.id) {
        setSnapshot(payload);
        if (payload.auction) setAuction(payload.auction);
        if (payload.state) setState(payload.state);
      }
    };

    const handlePlayerSold = (payload) => {
      if (payload?.auction?.id === auction.id || payload?.auctionId === auction.id) {
        setState((prev) => {
          setCelebration({
            type: "SOLD",
            teamName: payload?.team_name || payload?.sold_team_name || prev?.highest_team_name || "STRIKERS",
            amount: payload?.sold_amount || payload?.bid_amount || prev?.current_bid || 0,
          });
          return payload.state || prev;
        });
        setTimeout(() => setCelebration(null), 2500);
        setSnapshot(payload);
        if (payload.auction) setAuction(payload.auction);
      }
    };

    const handlePlayerUnsold = (payload) => {
      if (payload?.auction?.id === auction.id || payload?.auctionId === auction.id) {
        setCelebration({ type: "UNSOLD" });
        setTimeout(() => setCelebration(null), 2000);
        setSnapshot(payload);
        if (payload.auction) setAuction(payload.auction);
        if (payload.state) setState(payload.state);
      }
    };

    socket.on("auctionSnapshotUpdated", handleSnapshotUpdated);
    socket.on("playerSold", handlePlayerSold);
    socket.on("playerUnsold", handlePlayerUnsold);
    socket.on("playerFinalUnsold", handlePlayerUnsold);

    return () => {
      socket.off("auctionSnapshotUpdated", handleSnapshotUpdated);
      socket.off("playerSold", handlePlayerSold);
      socket.off("playerUnsold", handlePlayerUnsold);
      socket.off("playerFinalUnsold", handlePlayerUnsold);
    };
  }, [auction?.id, publicSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00c853] border-t-transparent" />
      </div>
    );
  }

  const currentBid = Number(state?.current_bid || currentPlayer?.base_price || 650000);
  const winningTeam = state?.highest_team_name || "STRIKERS";
  const winningTeamLogo = state?.highest_team_logo || auction?.highest_team_logo;

  const teams = (snapshot?.teams?.length ? snapshot.teams : DEFAULT_TEAMS).map((t, i) => ({
    ...t,
    accent: TEAM_ACCENTS[i % TEAM_ACCENTS.length],
    resolvedLogo: t.logo_url ? getImageUrl(t.logo_url) : dicebearLogo(t.team_name),
    displayPurse: t.remaining_purse ?? t.remaining_budget ?? 0,
  }));

  const soldCount = snapshot?.soldPlayers?.length ?? 0;
  const unsoldCount = snapshot?.unsoldPlayers?.length ?? 0;
  const pendingCount = snapshot?.pendingPlayers?.length ?? 0;
  const totalSpending = snapshot?.teamsSummary?.reduce((acc, t) => acc + Number(t.used_amount || 0), 0) ?? 0;

  const playerPhoto = currentPlayer?.photo_url
    ? getImageUrl(currentPlayer.photo_url)
    : DEFAULT_PLAYER_PHOTO;

  const resolvedWinningLogo = winningTeamLogo
    ? getImageUrl(winningTeamLogo)
    : dicebearLogo(winningTeam);

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-slate-50 p-3 font-sans text-slate-800 antialiased selection:bg-[#e91e63] selection:text-white sm:p-5 md:p-8">
      {/* Dynamic light background glow effects */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00c853]/5 via-transparent to-[#e91e63]/5 opacity-80" />
      <div className="pointer-events-none fixed inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><path d=%22M0 20h40M20 0v40%22 stroke=%22%23000000%22 stroke-opacity=%220.02%22/></svg>')]" />

      <CelebrationOverlay celebration={celebration} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between gap-4 md:gap-6">
        {/* Top Navigation & Header */}
        <header className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-lg sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#e91e63] to-[#ff6090] text-white shadow-md shadow-[#e91e63]/20">
              <span className="text-xl font-black">⚡</span>
            </div>
            <span className="text-sm font-black tracking-wider text-slate-900">SPORTZMITRA</span>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-center text-lg font-black uppercase tracking-tight text-slate-900 sm:text-xl md:text-2xl">
              {auction?.auction_name || "SUMMER LEAGUE 2024"}
            </h1>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#e91e63]/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#e91e63]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#e91e63]" />
              Live Auction
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs font-bold tracking-widest text-slate-400">PUBLIC STREAM</span>
            <a
              href={`/live/${publicSlug}/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm hover:border-[#e91e63] hover:text-[#e91e63]"
            >
              View Dashboard →
            </a>
          </div>
        </header>

        {/* Main Stage Grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          
          {/* Player Card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md md:col-span-2 lg:col-span-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-100 bg-slate-50 shadow-inner sm:h-44 sm:w-44 md:h-48 md:w-48">
                <img
                  src={playerPhoto}
                  alt={currentPlayer?.player_name || "Player"}
                  className="h-full w-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PLAYER_PHOTO;
                  }}
                />
              </div>

              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                {currentPlayer?.player_name || "ROHIT SHARMA"}
              </h2>

              <p className="mt-1 text-xs font-bold text-slate-500">
                {currentPlayer?.player_role || "Right Hand Batter"}
              </p>
              <span className="mt-2 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                {currentPlayer?.category || "Category A"}
              </span>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Base Price</span>
              <div className="text-xl font-black text-slate-800">
                ₹ {formatAmount(currentPlayer?.base_price || 200000)}
              </div>
            </div>
          </div>

          {/* Current Bid Screen */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md md:col-span-2 lg:col-span-5">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Current Highest Bid</span>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[#00c853]">
                <span className="text-3xl font-black sm:text-4xl md:text-5xl">₹</span>
                <span className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                  {formatAmount(currentBid)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 p-5 text-center border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Leading Bidder</span>
              <div className="mt-3 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-[#00c853]/30">
                  <img src={resolvedWinningLogo} alt={winningTeam} className="h-full w-full object-cover" />
                </div>
                <span className="text-xl font-black uppercase tracking-wide text-slate-900 sm:text-2xl">
                  {winningTeam}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md md:col-span-2 lg:col-span-3">
            <div className="space-y-1">
              <StatRow label="Players Sold" value={soldCount} />
              <StatRow label="Unsold Players" value={unsoldCount} />
              <StatRow label="Pending Players" value={pendingCount} last />
            </div>

            <div className="mt-4 rounded-2xl bg-[#e91e63]/5 p-4 border border-[#e91e63]/10">
              <span className="block text-[10px] font-black uppercase tracking-widest text-[#e91e63]">
                Total Spending
              </span>
              <span className="text-xl font-black text-slate-900 sm:text-2xl">
                ₹ {formatAmount(totalSpending)}
              </span>
            </div>
          </div>
        </div>

        {/* Team Purses Deck */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {teams.map((team, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-2 ${team.accent.border}`}
              >
                <img src={team.resolvedLogo} alt={team.team_name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-[10px] font-black uppercase text-slate-400">
                  {team.team_name}
                </span>
                <span className="text-xs font-black text-slate-900 sm:text-sm">
                  ₹ {formatAmount(team.displayPurse)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stream Footer */}
        <footer className="mt-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>SPORTZMITRA</span>
          <span className="hidden sm:inline">Bid. Build. Belong.</span>
          <span>LIVE BROADCAST</span>
        </footer>
      </div>
    </div>
  );
}

function StatRow({ label, value, last }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${last ? "" : "border-b border-slate-100"}`}>
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-base font-black text-slate-900">{value}</span>
    </div>
  );
}

function CelebrationOverlay({ celebration }) {
  if (!celebration) return null;
  const isSold = celebration.type === "SOLD";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-2xl ${
          isSold ? "border-[#00c853]/30" : "border-[#e91e63]/30"
        }`}
      >
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${
            isSold ? "bg-[#00c853]/10 text-[#00c853]" : "bg-[#e91e63]/10 text-[#e91e63]"
          }`}
        >
          {isSold ? "PLAYER ACQUIRED" : "UNSOLD"}
        </span>

        <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-slate-900">
          {celebration.type}
        </h2>

        {isSold && celebration.teamName && (
          <div className="mt-2 text-lg font-black uppercase text-slate-600">{celebration.teamName}</div>
        )}

        {isSold && celebration.amount && (
          <div className="mt-4 inline-block rounded-2xl bg-slate-50 border border-slate-100 px-6 py-2.5 text-2xl font-black text-[#00c853]">
            ₹ {formatAmount(celebration.amount)}
          </div>
        )}
      </div>
    </div>
  );
}