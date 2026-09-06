import {
  ShieldCheck,
  Smartphone,
  Lock,
  Menu,
  MoreVertical,
  Target,
  Radio,
  History,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("SUPER_ADMIN"); // visual tab only
  const [rememberMe, setRememberMe] = useState(false);

  async function sendOtp() {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const cleanMobile = mobile.trim();
      if (!cleanMobile) return setError("Please enter a valid mobile number");
      const res = await api.post("/auth/send-otp", { mobile: cleanMobile });
      setMobile(cleanMobile);
      setOtpSent(true);
      if (rememberMe) localStorage.setItem("rememberedMobile", cleanMobile);
      setMessage(
        res.data.devOtp
          ? `OTP sent. Dev Code: ${res.data.devOtp}`
          : "OTP sent successfully to your mobile number."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const cleanMobile = mobile.trim();
      const cleanOtp = otp.trim();
      if (!cleanMobile) return setError("Please enter mobile number");
      if (!cleanOtp) return setError("Please enter the received OTP");
      const res = await api.post("/auth/verify-otp", {
        mobile: cleanMobile,
        otp: cleanOtp,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.role === "SUPER_ADMIN") navigate("/super-admin");
      else navigate("/select-organization");
    } catch (err) {
      setError(err.response?.data?.message || "Login verification failed");
    } finally {
      setLoading(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    otpSent ? verifyOtp() : sendOtp();
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans selection:bg-[#8DC63F] selection:text-white lg:flex">
      {/* ===================== MOBILE / TABLET TOP BAR ===================== */}
      <div className="flex items-center justify-between bg-[#0b0f0c] px-5 py-4 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          className="text-white/80 transition hover:text-white"
        >
          <Menu size={22} />
        </button>
        <span className="text-lg font-black italic uppercase tracking-wider text-white">
          Sportz<span className="text-[#8DC63F]">Mitra</span>
        </span>
        <button
          type="button"
          aria-label="More options"
          className="text-white/80 transition hover:text-white"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* ===================== HERO PANEL ===================== */}
      <div className="relative flex h-56 shrink-0 items-end overflow-hidden bg-[#0b0f0c] sm:h-64 lg:h-auto lg:w-[56%] lg:items-center lg:justify-center">
        {/* Background flairs standing in for the hero photo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f0c] via-[#0f1710] to-[#0b0f0c]" />
        <div className="absolute -right-10 top-0 h-72 w-72 rounded-full bg-[#8DC63F]/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#EC008C]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(0,0,0,0.65),_transparent_60%)]" />

        {/* Hero copy — hidden on the compact mobile strip, shown from sm up */}
        <div className="relative z-10 hidden w-full max-w-lg px-8 pb-10 sm:block lg:px-12 lg:pb-0">
          <h2 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white lg:text-5xl">
            Build Teams
            <br />
            Create <span className="text-[#EC008C]">Legends</span>
          </h2>
          <p className="mt-4 text-sm font-semibold text-slate-300 lg:text-base">
            Live Auctions. Real Passion. Beyond the Game.
          </p>

          <div className="mt-8 flex gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-[#8DC63F]">
                <Target size={20} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-300">
                Organize
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-[#8DC63F]">
                <Radio size={20} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-300">
                Bid Live
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-[#8DC63F]">
                <History size={20} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-300">
                Make History
              </span>
            </div>
          </div>

          <p className="mt-10 hidden text-xs font-bold uppercase tracking-[0.2em] text-slate-400 lg:block">
            Sports bring people together,
            <br />
            we make it happen.
          </p>
        </div>
      </div>

      {/* ===================== FORM PANEL ===================== */}
      <div className="relative z-10 -mt-8 flex flex-1 flex-col items-center px-4 pb-10 sm:-mt-10 lg:mt-0 lg:w-[44%] lg:justify-center lg:px-10 lg:py-12">
        <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl shadow-black/10 sm:p-8 lg:rounded-3xl lg:border lg:border-slate-200">
          {/* Brand header — desktop only, mobile shows it in the top bar */}
          <div className="mb-6 hidden text-center lg:block">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EC008C] to-[#8DC63F] text-white shadow-md">
              <ShieldCheck size={30} />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-wider text-slate-900">
              Sportz<span className="text-[#8DC63F]">Mitra</span>
            </h1>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Welcome Back!
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {otpSent
                ? "Enter the OTP sent to your mobile number"
                : "Login to your account to continue"}
            </p>
          </div>

          {/* Role tabs — visual selector matching the reference design */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole("SUPER_ADMIN")}
              className={`rounded-lg py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                role === "SUPER_ADMIN"
                  ? "bg-[#EC008C] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setRole("AUCTION_ADMIN")}
              className={`rounded-lg py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                role === "AUCTION_ADMIN"
                  ? "bg-[#EC008C] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Auction Admin
            </button>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Mobile Number
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 transition-colors focus-within:border-[#8DC63F] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#8DC63F]">
                <Smartphone size={20} className="shrink-0 text-[#8DC63F]" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={loading || otpSent}
                  placeholder="Enter 10 digit mobile"
                  className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 outline-none disabled:opacity-60"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Enter Verification OTP
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 transition-colors focus-within:border-[#EC008C] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#EC008C]">
                  <Lock size={20} className="shrink-0 text-[#EC008C]" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                    placeholder="Enter OTP"
                    className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#EC008C] focus:ring-[#EC008C]"
                />
                Remember me
              </label>
              {otpSent && (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="font-bold text-[#EC008C] hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {message && (
              <div className="rounded-xl border border-[#8DC63F]/40 bg-[#8DC63F]/10 p-3.5 text-xs font-bold text-[#5c8a22]">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#EC008C] to-[#8DC63F] py-4 text-xs font-black italic uppercase tracking-[0.2em] text-white shadow-md shadow-[#EC008C]/15 transition active:scale-95 hover:opacity-95 disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : otpSent
                ? "Verify & Continue"
                : "Send Login OTP"}
            </button>

            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setMessage("");
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-extrabold uppercase text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Change Mobile Number
              </button>
            )}

            <div className="flex items-center gap-3 pt-1">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                or
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              disabled
              title="Coming soon"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-500 opacity-70"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4-17.2 10z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.5 0 10.5-1.9 14.3-5.2l-6.6-5.4C29.7 35.1 27 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 39.9 16.4 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.6 36.5 44 30.8 44 24c0-1.2-.1-2.3-.4-3.5z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-extrabold text-slate-800">Dev Credentials</p>
            <div className="mt-1 flex justify-between">
              <span>Super Admin:</span>
              <span className="font-mono font-bold text-[#5c8a22]">
                9999999999
              </span>
            </div>
            <div className="mt-0.5 flex justify-between">
              <span>Auction Admin:</span>
              <span className="font-mono font-bold text-[#5c8a22]">
                8888888888
              </span>
            </div>
            <div className="mt-0.5 flex justify-between">
              <span>Default OTP:</span>
              <span className="font-mono font-bold text-[#EC008C]">
                123456
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] font-semibold text-slate-400">
            © 2024 SportzMitra. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}