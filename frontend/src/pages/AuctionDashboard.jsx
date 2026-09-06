import { ArrowRight, Eye, Radio, Shield, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../api/api";

export default function AuctionDashboard() {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const dash = await api.get(`/auctions/${auctionId}/dashboard`);
      setAuction(dash.data.auction);
      setSummary(dash.data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [auctionId]);

  if (window.location.pathname === `/admin/auctions/${auctionId}`) {
    return <Navigate to={`/admin/auctions/${auctionId}/dashboard`} replace />;
  }

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex h-64 items-center justify-center font-bold text-[#EC008C]">
          Loading auction data...
        </div>
      </AdminLayout>
    );
  }

  const cards = [
    {
      label: "Total Teams",
      value: summary.total_teams || 0,
      icon: Shield,
      to: `/admin/auctions/${auctionId}/teams`,
      badgeColor: "bg-[#EC008C]/10 text-[#EC008C]",
      borderColor: "hover:border-[#EC008C]",
    },
    {
      label: "Total Players",
      value: summary.total_players || 0,
      icon: Users,
      to: `/admin/auctions/${auctionId}/players`,
      badgeColor: "bg-[#8DC63F]/10 text-[#5c8a22]",
      borderColor: "hover:border-[#8DC63F]",
    },
    {
      label: "Sold Players",
      value: summary.sold_players || 0,
      icon: TrendingUp,
      to: `/admin/auctions/${auctionId}/reports`,
      badgeColor: "bg-[#EC008C]/10 text-[#EC008C]",
      borderColor: "hover:border-[#EC008C]",
    },
    {
      label: "Available",
      value: summary.available_players || 0,
      icon: Users,
      to: `/admin/auctions/${auctionId}/players`,
      badgeColor: "bg-[#8DC63F]/10 text-[#5c8a22]",
      borderColor: "hover:border-[#8DC63F]",
    },
  ];

  return (
    <AdminLayout
      title={auction?.auction_name || "Auction Dashboard"}
      subtitle="Live auction summary and quick controls"
      active="Dashboard"
      auctionId={auctionId}
      organizationId={auction?.organization_id}
      publicSlug={auction?.public_slug}
    >
      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black italic uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`rounded-xl p-2.5 ${card.badgeColor}`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="mt-4 text-4xl font-black italic text-slate-900">
                {card.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickCard
          title="Manage Teams"
          text="Add teams, set custom purse values, update logos, and manage team owners."
          icon={Shield}
          to={`/admin/auctions/${auctionId}/teams`}
          accent="pink"
        />
        <QuickCard
          title="Manage Players"
          text="Bulk upload Excel files, assign bidding categories, and curate player pools."
          icon={Users}
          to={`/admin/auctions/${auctionId}/players`}
          accent="lime"
        />
        <QuickCard
          title="Live Control Center"
          text="Broadcast players live, control bidding intervals, mark sold/unsold in real time."
          icon={Radio}
          to={`/admin/auctions/${auctionId}/live-control`}
          accent="pink"
        />
      </div>

      {/* Public Display Screen Card */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-[#8DC63F]/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#5c8a22]">
              Live Stream & LED Output
            </span>
            <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
              Public Live View
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Project this live screen on big stages, LED displays, or broadcast directly to audience screens.
            </p>
          </div>
          <Link
            to={`/live/${auction?.public_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#EC008C] px-5 py-3 font-black italic uppercase tracking-wider text-white shadow-md shadow-[#EC008C]/20 transition hover:bg-[#d4007d] active:scale-95"
          >
            <Eye size={16} /> Open Live View
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-[#8DC63F]/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#5c8a22]">
              Audience Statistics
            </span>
            <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
              Public Dashboard
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Show live team balances, sold/unsold/pending counts and category breakdowns to the audience.
            </p>
          </div>
          <Link
            to={`/live/${auction?.public_slug}/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#8DC63F] px-5 py-3 font-black italic uppercase tracking-wider text-white shadow-md shadow-[#8DC63F]/20 transition hover:bg-[#7ab332] active:scale-95"
          >
            <Eye size={16} /> View Dashboard
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

function QuickCard({ title, text, icon: Icon, to, accent }) {
  const isPink = accent === "pink";
  return (
    <Link
      to={to}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div>
        <div
          className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${
            isPink
              ? "bg-[#EC008C]/10 text-[#EC008C]"
              : "bg-[#8DC63F]/10 text-[#5c8a22]"
          }`}
        >
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-black italic uppercase text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">{text}</p>
      </div>

      <div
        className={`mt-6 inline-flex items-center gap-2 text-xs font-black italic uppercase tracking-wider ${
          isPink ? "text-[#EC008C]" : "text-[#5c8a22]"
        }`}
      >
        <span>Access Section</span>
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}