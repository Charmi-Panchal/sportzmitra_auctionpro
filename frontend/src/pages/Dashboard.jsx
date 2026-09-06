import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import {
  UserCheck,
  CircleDollarSign,
  UserX,
  Gavel,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  ChevronRight,
  Trophy,
  Zap,
} from "lucide-react";

const playerImages = {
  rohit:
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=200&q=80",
  player1:
    "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=200&q=80",
  player2:
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=200&q=80",
};

const stats = [
  { title: "Active auctions", value: "03", change: "+12.5%", icon: Gavel },
  { title: "Players sold", value: "128", change: "+18.2%", icon: UserCheck },
  { title: "Total sale value", value: "₹24.85L", change: "+24.8%", icon: CircleDollarSign },
  { title: "Unsold players", value: "42", change: "-8.4%", icon: UserX, down: true },
];

const upcomingAuctions = [
  { short: "PCC", title: "Pune Champions Cup", date: "25 May", time: "10:00 AM", status: "Ready" },
  { short: "MPL", title: "Mumbai Premier League", date: "01 Jun", time: "04:00 PM", status: "Draft" },
  { short: "GCL", title: "Gujarat Cricket League", date: "08 Jun", time: "11:30 AM", status: "Ready" },
];

const teams = [
  { rank: 1, name: "Strikers", purse: "₹4,15,000", percent: 82 },
  { rank: 2, name: "Warriors", purse: "₹6,40,000", percent: 76 },
  { rank: 3, name: "Titans", purse: "₹5,20,000", percent: 64 },
  { rank: 4, name: "Royals", purse: "₹4,10,000", percent: 51 },
  { rank: 5, name: "Challengers", purse: "₹3,65,000", percent: 43 },
];

const recentPlayers = [
  { name: "Rohit Sharma", team: "Strikers", amount: "₹6,50,000", time: "10:45 AM", image: playerImages.rohit },
  { name: "Shubman Gill", team: "Warriors", amount: "₹6,00,000", time: "10:21 AM", image: playerImages.player1 },
  { name: "Jasprit Bumrah", team: "Titans", amount: "₹5,50,000", time: "10:04 AM", image: playerImages.player2 },
  { name: "Hardik Pandya", team: "Royals", amount: "₹5,15,000", time: "09:48 AM", image: playerImages.player1 },
];

const liveAuction = { title: "Summer League 2024", sold: 245, total: 300 };

export default function Dashboard() {
  const today = new Date();
  const dateString = today.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const progress = Math.round((liveAuction.sold / liveAuction.total) * 100);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayRole = user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "AUCTION_ADMIN" ? "Auction Admin" : "User";

  return (
    <AdminLayout active="Dashboard" liveSummary={liveAuction}>
      {/* =========================================================
          HERO — scoreboard treatment: one big number, one image.
      ========================================================== */}
      <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[#03251b]">
        <img
          src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.16]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03251b] via-[#03251b]/97 to-[#03251b]/60" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ec008c]/15 blur-3xl" />

        <div className="relative grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:px-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ec008c]" />
              <span className="text-[11px] font-semibold text-emerald-100/50">
                {dateString} · {liveAuction.title} is live
              </span>
            </div>

            <h1 className="font-display mt-3 max-w-lg text-[32px] font-bold leading-[1.1] tracking-tight text-white sm:text-[38px]">
              Good morning, {displayRole}.
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-6 text-emerald-100/50">
              One auction is running right now — here's where the bids, the purses
              and the players stand.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/admin/auctions/9001/live-control"
                className="group flex items-center gap-2 rounded-xl bg-[#ec008c] px-5 py-3 text-[13px] font-bold text-white transition hover:bg-[#d9007e]"
              >
                <Zap size={15} />
                Open Live Control
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                className="rounded-xl border border-white/15 px-5 py-3 text-[13px] font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white"
              >
                View schedule
              </button>
            </div>
          </div>

          {/* Live score block */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-baseline justify-between">
              <span className="tabular font-display text-5xl font-bold text-white">
                {liveAuction.sold}
              </span>
              <span className="tabular text-lg font-medium text-emerald-100/35">
                / {liveAuction.total}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-emerald-100/40">
              players sold so far
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8dc63f] to-[#ec008c]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-emerald-100/40">
              <span className="flex items-center gap-1.5">
                <Clock3 size={12} />
                Started 09:30 AM
              </span>
              <span>{progress}% complete</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STAT STRIP — one panel, divided, instead of four
          separate cards.
      ========================================================== */}
      <section className="mb-6 grid grid-cols-2 divide-y divide-black/[0.06] rounded-[24px] border border-black/[0.06] bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <Icon size={18} className="text-[#03251b]/70" strokeWidth={2.25} />
                <span
                  className={`text-[11px] font-bold ${
                    stat.down ? "text-rose-500" : "text-emerald-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="font-display tabular mt-4 text-[26px] font-bold tracking-tight text-[#0f1d17]">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-slate-400">{stat.title}</p>
            </div>
          );
        })}
      </section>

      {/* =========================================================
          UPCOMING AUCTIONS
      ========================================================== */}
      <section className="mb-6 rounded-[24px] border border-black/[0.06] bg-white p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[17px] font-bold text-[#0f1d17]">Upcoming auctions</h3>
          <Link
            to="#"
            className="flex items-center gap-1 text-[12px] font-semibold text-[#ec008c] hover:underline"
          >
            View all
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {upcomingAuctions.map((auction) => (
            <div
              key={auction.title}
              className="group rounded-2xl border border-black/[0.06] p-4 transition hover:border-[#03251b]/15"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#03251b] text-[10px] font-bold text-white">
                  {auction.short}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    auction.status === "Ready"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {auction.status}
                </span>
              </div>
              <p className="mt-3 truncate text-[13px] font-bold text-[#0f1d17]">{auction.title}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {auction.date} · {auction.time}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          LOWER GRID
      ========================================================== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Team purse leaderboard */}
        <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 sm:p-7 xl:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[17px] font-bold text-[#0f1d17]">Team purse</h3>
            <Trophy size={18} className="text-[#8dc63f]" />
          </div>

          <div className="mt-6 space-y-5">
            {teams.map((team) => (
              <div key={team.rank}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                        team.rank === 1 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {String(team.rank).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] font-bold text-[#0f1d17]">{team.name}</span>
                  </div>
                  <span className="tabular text-[12px] font-bold text-[#0f1d17]">{team.purse}</span>
                </div>
                <div className="mt-2 ml-10 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#03251b]"
                    style={{ width: `${team.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently sold */}
        <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 sm:p-7 xl:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[17px] font-bold text-[#0f1d17]">Recently sold</h3>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>

          <div className="mt-4">
            {recentPlayers.map((player, index) => (
              <div
                key={player.name}
                className={`group flex items-center gap-3 py-3 ${
                  index !== recentPlayers.length - 1 ? "border-b border-black/[0.05]" : ""
                }`}
              >
                <img src={player.image} alt={player.name} className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[#0f1d17]">{player.name}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">{player.team}</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-[12px] font-bold text-[#0f1d17]">{player.amount}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">{player.time}</p>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#ec008c]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Brand card */}
        <div className="relative min-h-[260px] overflow-hidden rounded-[24px] bg-[#03251b] p-7 xl:col-span-3">
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#03251b] via-[#03251b]/85 to-[#ec008c]/15" />

          <div className="relative flex h-full flex-col justify-between">
            <ArrowUpRight size={20} className="text-[#8dc63f]" />
            <div>
              <p className="font-display text-[20px] font-bold italic leading-tight text-white">
                Same passion.
                <br />
                <span className="text-[#8dc63f]">A bigger stage.</span>
              </p>
              <p className="mt-4 text-[12px] leading-5 text-emerald-100/45">
                Powering better auctions, stronger teams and unforgettable
                sporting moments.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}