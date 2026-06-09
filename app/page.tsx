"use client";

import { useEffect, useMemo, useState } from "react";

const modes = [
  { key: "overall", name: "OVERALL", icon: "/global.png" },
  { key: "nethpot", name: "NETHPOT", icon: "/nethpot.webp" },
  { key: "sword", name: "SWORD", icon: "/swordd.webp" },
  { key: "axe", name: "AXE", icon: "/axe.webp" },
  { key: "smp", name: "SMP", icon: "/smp.webp" },
  { key: "crystal", name: "CRYSTAL", icon: "/crystal.webp" },
  { key: "mace", name: "MACE", icon: "/mace.webp" },
];

const gameModes = modes.filter((m) => m.key !== "overall");

const tierPoints: Record<string, number> = {
  HT1: 60,
  LT1: 45,
  HT2: 30,
  LT2: 20,
  HT3: 10,
  LT3: 6,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
  NT: 0,
};

function getTierData(player: any, modeKey: string) {
  const raw = player?.tiers?.[modeKey];

  if (!raw) return { current: "NT", peak: "NT", points: 0 };

  if (typeof raw === "string") {
    return {
      current: raw,
      peak: raw,
      points: tierPoints[raw] || 0,
    };
  }

  const current = raw.current || raw.tier || "NT";
  const peak = raw.peak || current;

  return {
    current,
    peak,
    points: raw.points ?? tierPoints[current] ?? 0,
  };
}

function tierNumber(tier: string) {
  if (!tier || tier === "NT") return null;
  return tier.replace("HT", "").replace("LT", "");
}

function tierCircle(tier: string) {
  if (!tier || tier === "NT") return "border-slate-500 bg-[#101827]";
  if (tier.startsWith("HT")) {
    return "border-yellow-400 bg-[#101827] shadow-[0_0_14px_rgba(255,220,0,0.55)]";
  }
  return "border-orange-500 bg-[#101827]";
}

function tierBadge(tier: string) {
  if (!tier || tier === "NT") return "bg-[#6b4300] text-yellow-100";
  if (tier.startsWith("HT")) return "bg-[#8a6000] text-yellow-200";
  return "bg-[#a34f00] text-orange-100";
}

const siteTitle = "BoltPvP Tierlist";
const siteIcon = "/boltlogo.png";
const fallbackBodySkin = "https://render.crafty.gg/3d/bust/Steve";
const fallbackHeadSkin = "https://mc-heads.net/avatar/Steve/80";

function safeIgn(player: any) {
  return encodeURIComponent(String(player?.ign || "Steve").trim() || "Steve");
}

function skinBody(player: any) {
  const ign = player?.premium === false ? "Steve" : safeIgn(player);
  return `https://render.crafty.gg/3d/bust/${ign}`;
}

function skinHead(player: any) {
  const ign = player?.premium === false ? "Steve" : safeIgn(player);
  return `https://mc-heads.net/avatar/${ign}/80`;
}

function rankIcon(rank: string) {
  const cleanRank = String(rank || "Rookie").trim().toLowerCase();

  if (cleanRank.includes("master")) return "/combat_master.webp";
  if (cleanRank.includes("ace")) return "/combat_ace.webp";
  if (cleanRank.includes("specialist")) return "/combat_specialist.svg";

  return "/rookie.svg";
}

function rankName(rank: string) {
  return String(rank || "Rookie").trim() || "Rookie";
}

function RankSkin({ player }: { player: any }) {
  return (
    <div className="relative h-[104px] w-[104px] overflow-hidden">
      <img
        src={skinBody(player)}
        alt={player?.ign || "player"}
        onError={(e) => {
          e.currentTarget.src = fallbackBodySkin;
        }}
        className="absolute left-1/2 top-[-15px] h-[170px] w-[170px] -translate-x-1/2 object-contain"
      />
    </div>
  );
}

function ProfileSkin({ player }: { player: any }) {
  return (
    <div className="relative h-[265px] w-[235px] overflow-hidden">
      <img
        src={skinBody(player)}
        alt={player?.ign || "player"}
        onError={(e) => {
          e.currentTarget.src = fallbackBodySkin;
        }}
        className="absolute left-1/2 top-[-22px] h-[350px] w-[350px] -translate-x-1/2 object-contain"
      />
    </div>
  );
}

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState("overall");
  const [page, setPage] = useState<"home" | "tierlist">("home");
  const [pageVisible, setPageVisible] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState<any | null>(null);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderFade, setLoaderFade] = useState(false);
  const [cursorTip, setCursorTip] = useState({ show: false, text: "", x: 0, y: 0 });

  useEffect(() => {
    document.title = siteTitle;

    let icon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = siteIcon;
  }, []);

  function tooltip(text: string) {
    return {
      onMouseEnter: (e: any) => setCursorTip({ show: true, text, x: e.clientX, y: e.clientY }),
      onMouseMove: (e: any) => setCursorTip((t) => ({ ...t, x: e.clientX, y: e.clientY })),
      onMouseLeave: () => setCursorTip((t) => ({ ...t, show: false })),
    };
  }

  function goPage(next: "home" | "tierlist") {
    if (next === page) return;
    setPageVisible(false);
    window.setTimeout(() => {
      setPage(next);
      setPageVisible(true);
      window.location.hash = next;
    }, 260);
  }

  useEffect(() => {
    const initial = window.location.hash.replace("#", "");
    if (initial === "tierlist") setPage("tierlist");

    const fadeTimer = setTimeout(() => setLoaderFade(true), 1000);
    const removeTimer = setTimeout(() => setShowLoader(false), 1450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  async function loadPlayers() {
    try {
      const res = await fetch("/api/players", { cache: "no-store" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setPlayers(Array.isArray(data) ? data : []);
    } catch {
      setPlayers([]);
    }
  }

  useEffect(() => {
    loadPlayers();
    const timer = setInterval(loadPlayers, 5000);
    return () => clearInterval(timer);
  }, []);

  const rankedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [players]);

  const searchTerm = search.trim().toLowerCase();

  const searched = useMemo(() => {
    if (!searchTerm) return rankedPlayers.slice(0, 100);

    return rankedPlayers.filter((p) =>
      String(p.ign || "").toLowerCase().includes(searchTerm)
    );
  }, [rankedPlayers, searchTerm]);

  const topTen = useMemo(() => {
    return rankedPlayers.slice(0, 10);
  }, [rankedPlayers]);

  const totalTests = useMemo(() => {
    return players.reduce((total, player) => {
      return (
        total +
        gameModes.filter((mode) => getTierData(player, mode.key).current !== "NT").length
      );
    }, 0);
  }, [players]);

  const currentMode = modes.find((m) => m.key === activeMode);

  function openProfile(player: any) {
    setLoadingPlayer(player);
    setTimeout(() => {
      setSelectedPlayer(player);
      setLoadingPlayer(null);
    }, 260);
  }

  function closeProfile() {
    setSelectedPlayer(null);
    setLoadingPlayer(null);
  }

  function rankPosition(player: any) {
    const index = rankedPlayers.findIndex((p) => p.ign === player.ign);
    return index === -1 ? 1 : index + 1;
  }

  function playersForTier(num: string) {
    const modePlayers = searchTerm ? searched : rankedPlayers;

    return modePlayers
      .filter((p) => tierNumber(getTierData(p, activeMode).current) === num)
      .sort((a, b) => {
        const at = getTierData(a, activeMode).current;
        const bt = getTierData(b, activeMode).current;

        if (at.startsWith("HT") && bt.startsWith("LT")) return -1;
        if (at.startsWith("LT") && bt.startsWith("HT")) return 1;

        return (b.points || 0) - (a.points || 0);
      });
  }

  async function copyServerIp() {
    try {
      await navigator.clipboard.writeText("boltpvp.fun");
      alert("Server IP copied: boltpvp.fun");
    } catch {
      alert("Copy failed. IP: boltpvp.fun");
    }
  }

  const goldButton =
    "min-w-[320px] rounded-2xl border-2 border-yellow-400 bg-black/80 px-12 py-7 text-2xl font-black tracking-[2px] text-yellow-200 shadow-[0_0_30px_rgba(255,200,0,0.28)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.07] hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_45px_rgba(255,215,0,0.65)]";

  const discordButton =
    "inline-flex items-center justify-center gap-3 rounded-2xl bg-[#5865f2] px-9 py-5 text-xl font-black text-white shadow-[0_0_26px_rgba(88,101,242,0.35)] transition hover:-translate-y-1 hover:scale-[1.04] hover:bg-[#4752c4]";

  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden bg-[#100600] text-white">
      <style jsx global>{`
        @keyframes glitterFall {
          0% { transform: translate3d(0, -20vh, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate3d(35px, 120vh, 0); opacity: 0; }
        }
        @keyframes topSlash {
          0% { transform: translateX(-150%) skewX(-18deg); opacity: 0; }
          15% { opacity: 0.75; }
          50% { opacity: 1; }
          100% { transform: translateX(210%) skewX(-18deg); opacity: 0; }
        }
        @keyframes modalPop {
          from { transform: scale(0.88); opacity: 0; }
          to { transform: scale(0.9); opacity: 1; }
        }
        @keyframes loadAcross {
          0% { transform: translateX(-140%); }
          100% { transform: translateX(420%); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .page-zoom {
          zoom: 0.8;
          width: 125%;
        }
        @supports not (zoom: 1) {
          .page-zoom {
            width: 125%;
            transform: scale(0.8);
            transform-origin: top left;
          }
        }
        .modal-pop { animation: modalPop 0.2s ease-out; }
        .hero-float { animation: floatUp 3s ease-in-out infinite; }
      `}</style>

      {showLoader && (
        <div className={`fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-[#050913] transition-opacity duration-700 ${loaderFade ? "opacity-0" : "opacity-100"}`}>
          <div className="flex flex-col items-center gap-8">
            <img src="/boltlogo.png" alt="BoltPvP" className="h-44 w-44 object-contain drop-shadow-[0_0_45px_rgba(255,210,0,0.95)]" style={{ animation: "logoPulse 1.1s ease-in-out infinite" }} />
            <div className="relative h-3 w-96 overflow-hidden rounded-full bg-slate-800">
              <div className="absolute left-0 top-0 h-full w-28 animate-[loadAcross_1.15s_linear_infinite] rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-300 shadow-[0_0_18px_rgba(255,190,0,0.9)]" />
            </div>
            <p className="text-xl font-black tracking-[6px] text-yellow-300">LOADING BOLTPVP</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-0 bg-[#100600]" />
      <div className="fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_18%,rgba(120,62,0,0.75)_0%,rgba(56,22,0,0.65)_28%,rgba(20,7,0,0.95)_65%,rgba(4,1,0,1)_100%)]" />
      <div className="fixed inset-0 z-[2] bg-[linear-gradient(180deg,rgba(255,190,0,0.10)_0%,rgba(0,0,0,0.10)_45%,rgba(0,0,0,0.45)_100%)]" />
      <div className="fixed inset-0 z-[3] opacity-[0.045] bg-[linear-gradient(rgba(255,210,0,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,210,0,.35)_1px,transparent_1px)] bg-[size:46px_46px]" />

      <div className="pointer-events-none fixed inset-0 z-[4] overflow-hidden">
        {Array.from({ length: 180 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-yellow-200"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${(i * 17) % 100}%`,
              top: `${-20 - ((i * 31) % 100)}vh`,
              opacity: 0.3 + (i % 5) * 0.1,
              animationName: "glitterFall",
              animationDuration: `${6 + (i % 8)}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDelay: `-${(i * 0.47) % 10}s`,
              boxShadow: "0 0 10px #ffd700, 0 0 18px #ffb700",
            }}
          />
        ))}
      </div>

      <div className="page-zoom relative z-10">
        <section className="min-h-screen px-6 py-6">
          <header className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-black/25 px-5 py-4 backdrop-blur-md">
            <button onClick={() => goPage("home")} className="flex items-center gap-4 transition hover:scale-[1.02]"> 
              <img src="/boltlogo.png" alt="BoltPvP" className="h-16 w-16 object-contain drop-shadow-[0_0_20px_rgba(255,200,0,0.8)]" />
              <div className="text-left">
                <h1 className="text-3xl font-black text-yellow-300">BoltPvP</h1>
                <p className="tracking-[5px] text-xs text-yellow-100">OFFICIAL TIERLIST</p>
              </div>
            </button>

            <nav className="flex items-center gap-4">
              <button onClick={() => goPage("home")} className={`rounded-xl px-8 py-4 text-3xl font-black transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-yellow-400/10 hover:text-yellow-300 ${page === "home" ? "text-yellow-300 underline decoration-yellow-300 decoration-4 underline-offset-8" : "text-white"}`}>Home</button>
              <button onClick={() => goPage("tierlist")} className={`rounded-xl px-8 py-4 text-3xl font-black transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-yellow-400/10 hover:text-yellow-300 ${page === "tierlist" ? "text-yellow-300 underline decoration-yellow-300 decoration-4 underline-offset-8" : "text-white"}`}>Tierlist</button>
            </nav>

            <a href="https://discord.gg/boltpvp" target="_blank" className={discordButton}> 
              <img src="/discord.png" alt="Discord" className="h-7 w-7 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              Discord
            </a>
          </header>

          <div className={`transition-all duration-500 ease-out ${pageVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
            {page === "home" && (
              <section className="grid min-h-[820px] grid-cols-[1fr_720px] items-center gap-14 px-8 py-12">
                <div className="max-w-4xl">
                  <h2 className="max-w-6xl text-9xl font-black leading-[0.9] tracking-tight text-white drop-shadow-[0_0_34px_rgba(255,215,0,0.38)]">
                    <span className="text-yellow-300">BoltPvP</span>
                    <br />
                    Tier List
                  </h2>

                  <p className="mt-8 max-w-4xl text-4xl font-bold leading-[1.35] text-yellow-100/85">
                    Check the best players, view every gamemode tier, and apply for official BoltPvP testing.
                  </p>

                  <div className="mt-8 grid max-w-4xl grid-cols-3 gap-5">
                    <div className="group relative overflow-hidden rounded-3xl border border-yellow-500/35 bg-[radial-gradient(circle_at_30%_20%,rgba(255,220,0,0.18),rgba(0,0,0,0.72)_55%)] p-6 shadow-[0_0_26px_rgba(255,190,0,0.16)] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.06] hover:border-yellow-300 hover:shadow-[0_0_45px_rgba(255,210,0,0.45)]">
                      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,210,0,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,210,0,.7)_1px,transparent_1px)] bg-[size:24px_24px]" />
                      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-400/20 blur-2xl transition group-hover:bg-yellow-300/35" />
                      <div className="text-3xl">🏆</div>
                      <div className="relative z-10 mt-2 text-2xl font-black text-yellow-300">Ranked Tiers</div>
                      <p className="relative z-10 mt-2 text-base font-semibold text-yellow-100/75">Track every official result across all modes.</p>
                    </div>
                    <div className="group relative overflow-hidden rounded-3xl border border-yellow-500/35 bg-[radial-gradient(circle_at_30%_20%,rgba(255,220,0,0.18),rgba(0,0,0,0.72)_55%)] p-6 shadow-[0_0_26px_rgba(255,190,0,0.16)] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.06] hover:border-yellow-300 hover:shadow-[0_0_45px_rgba(255,210,0,0.45)]">
                      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,210,0,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,210,0,.7)_1px,transparent_1px)] bg-[size:24px_24px]" />
                      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-400/20 blur-2xl transition group-hover:bg-yellow-300/35" />
                      <div className="text-3xl">⚔️</div>
                      <div className="relative z-10 mt-2 text-2xl font-black text-yellow-300">PvP Modes</div>
                      <p className="relative z-10 mt-2 text-base font-semibold text-yellow-100/75">Sword, Axe, SMP, Mace, Crystal and Nethpot.</p>
                    </div>
                    <div className="group relative overflow-hidden rounded-3xl border border-yellow-500/35 bg-[radial-gradient(circle_at_30%_20%,rgba(255,220,0,0.18),rgba(0,0,0,0.72)_55%)] p-6 shadow-[0_0_26px_rgba(255,190,0,0.16)] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.06] hover:border-yellow-300 hover:shadow-[0_0_45px_rgba(255,210,0,0.45)]">
                      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,210,0,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,210,0,.7)_1px,transparent_1px)] bg-[size:24px_24px]" />
                      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-400/20 blur-2xl transition group-hover:bg-yellow-300/35" />
                      <div className="text-3xl">⚡</div>
                      <div className="relative z-10 mt-2 text-2xl font-black text-yellow-300">Fast Testing</div>
                      <p className="relative z-10 mt-2 text-base font-semibold text-yellow-100/75">Apply through Discord and join the queue.</p>
                    </div>
                  </div>

                  <div className="hero-float group relative mt-8 max-w-4xl overflow-hidden rounded-[36px] border border-yellow-400/45 bg-[radial-gradient(circle_at_20%_30%,rgba(255,211,0,0.16),rgba(0,0,0,0.78)_55%)] p-7 shadow-[0_0_45px_rgba(255,190,0,0.20)] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.035] hover:border-yellow-300 hover:shadow-[0_0_60px_rgba(255,215,0,0.45)]">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,210,0,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,210,0,.7)_1px,transparent_1px)] bg-[size:28px_28px]" />
                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-yellow-400/20 blur-3xl transition group-hover:bg-yellow-300/35" />
                    <div className="relative z-10 flex items-center gap-7">
                      <div className="relative h-36 w-36 overflow-hidden rounded-3xl border border-yellow-400/40 bg-yellow-400/10">
                        {topTen[0] ? (
                          <img src={skinBody(topTen[0])} alt={topTen[0].ign} onError={(e) => { e.currentTarget.src = fallbackBodySkin; }} className="absolute left-1/2 top-[-18px] h-52 w-52 -translate-x-1/2 object-contain" />
                        ) : (
                          <img src="/boltlogo.png" alt="BoltPvP" className="h-full w-full object-contain p-6" />
                        )}
                      </div>

                      <div>
                        <div className="text-lg font-black tracking-[4px] text-yellow-300">CURRENT #1 PLAYER</div>
                        <div className="mt-2 text-5xl font-black text-white">{topTen[0]?.ign || "Waiting..."}</div>
                        <div className="mt-2 text-2xl font-black text-yellow-200">{topTen[0]?.points || 0} points</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-wrap gap-5">
                    <button onClick={() => goPage("tierlist")} className={goldButton}>VIEW TIERLIST</button>
                    <a href="https://discord.gg/boltpvp" target="_blank" className={goldButton}>APPLY FOR TESTING</a>
                  </div>

                  <div className="mt-12 grid max-w-2xl grid-cols-2 gap-6">
                    <div className="group relative overflow-hidden rounded-3xl border border-yellow-500/35 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.18),rgba(0,0,0,0.78)_60%)] p-8 text-center shadow-[0_0_28px_rgba(255,180,0,0.14)] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.06] hover:border-yellow-300 hover:shadow-[0_0_45px_rgba(255,215,0,0.45)]">
                      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,210,0,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,210,0,.7)_1px,transparent_1px)] bg-[size:26px_26px]" /> 
                      <div className="relative z-10 text-8xl font-black text-yellow-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">{players.length}</div>
                      <div className="relative z-10 mt-2 text-2xl font-black tracking-[4px] text-yellow-100/75">TOTAL PLAYERS</div>
                    </div>
                    <div className="group relative overflow-hidden rounded-3xl border border-yellow-500/35 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.18),rgba(0,0,0,0.78)_60%)] p-8 text-center shadow-[0_0_28px_rgba(255,180,0,0.14)] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.06] hover:border-yellow-300 hover:shadow-[0_0_45px_rgba(255,215,0,0.45)]">
                      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,210,0,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,210,0,.7)_1px,transparent_1px)] bg-[size:26px_26px]" /> 
                      <div className="relative z-10 text-8xl font-black text-yellow-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">{totalTests}</div>
                      <div className="relative z-10 mt-2 text-2xl font-black tracking-[4px] text-yellow-100/75">TOTAL TESTS</div>
                    </div>
                  </div>
                </div>

                <aside className="rounded-[32px] border border-yellow-500/35 bg-[#081326]/90 p-8 shadow-[0_0_55px_rgba(255,190,0,0.18)] backdrop-blur-md">
                  <h3 className="mb-7 text-center text-4xl font-black tracking-[4px] text-yellow-300">TOP 10 PLAYERS</h3>
                  <div className="space-y-3">
                    {topTen.map((player, index) => (
                      <button
                        key={player._id || player.ign}
                        onClick={() => openProfile(player)}
                        className="grid w-full grid-cols-[60px_76px_1fr_auto] items-center gap-4 rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4 text-left transition hover:-translate-y-1 hover:border-yellow-300 hover:bg-yellow-500/10"
                      >
                        <span className="text-2xl font-black text-yellow-300">#{index + 1}</span>
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-yellow-400/10">
                          <img src={skinBody(player)} alt={player.ign} onError={(e) => { e.currentTarget.src = fallbackBodySkin; }} className="absolute left-1/2 top-[-12px] h-28 w-28 -translate-x-1/2 object-contain" />
                        </div>
                        <span>
                          <span className="block text-2xl font-black text-white">{player.ign}</span>
                          <span className="text-base text-blue-300">{player.region || "AS"}</span>
                        </span>
                        <span className="rounded-lg bg-yellow-400/15 px-4 py-3 text-lg font-black text-yellow-300">{player.points || 0} pts</span>
                      </button>
                    ))}

                    {topTen.length === 0 && (
                      <div className="rounded-2xl border border-yellow-500/20 bg-black/35 py-12 text-center text-yellow-100/70">No players yet.</div>
                    )}
                  </div>

                  <button onClick={() => goPage("tierlist")} className="mt-6 w-full rounded-2xl border border-yellow-400/50 bg-yellow-400/10 px-6 py-5 text-2xl font-black text-yellow-300 transition hover:-translate-y-1 hover:scale-[1.02] hover:bg-yellow-400 hover:text-black">
                    View Full Leaderboard →
                  </button>
                </aside>
              </section>
            )}

            {page === "tierlist" && (
              <>
                <section className="mt-8 text-center">
                  <button onClick={() => setActiveMode("overall")} className="transition hover:scale-[1.04]"> 
                    <img src="/boltlogo.png" alt="Bolt Logo" className="mx-auto h-56 w-56 object-contain drop-shadow-[0_0_40px_rgba(255,210,0,0.85)]" />
                  </button>

                  <h2 className="mt-3 text-6xl font-black tracking-[8px] text-yellow-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">TIER LIST</h2>
                  <p className="mt-3 text-xl">The official rankings for BoltPvP&apos;s top players.</p>

                  <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-4">
                    {modes.map((mode) => (
                      <button
                        key={mode.key}
                        onClick={() => setActiveMode(mode.key)}
                        className={`flex min-w-[160px] items-center justify-center gap-3 rounded-xl border-2 px-6 py-4 font-black transition hover:scale-105 ${
                          activeMode === mode.key
                            ? "border-yellow-300 bg-black text-yellow-300 shadow-[0_0_20px_rgba(255,215,0,0.75)]"
                            : "border-orange-500 bg-black/65 text-white"
                        }`}
                      >
                        <img src={mode.icon} alt={mode.name} className="h-7 w-7 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        {mode.name}
                      </button>
                    ))}
                  </div>

                  <div className="mx-auto mt-8 flex w-full max-w-5xl gap-4">
                    <div className="flex flex-1 items-center rounded-xl border-2 border-orange-500 bg-black/80 px-5 py-4"> 
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for a player..." className="w-full bg-transparent text-lg outline-none placeholder:text-yellow-100" />
                      <span className="text-2xl">🔍</span>
                    </div>

                    <button onClick={copyServerIp} className="flex w-[230px] items-center justify-center rounded-xl border-2 border-yellow-300 bg-yellow-400 px-6 py-4 font-black text-black transition hover:scale-[1.02]">IP: BOLTPVP.FUN</button>
                  </div>
                </section>

                {activeMode === "overall" && (
                  <section id="rankings" className="relative mx-auto mt-10 max-w-[1500px] overflow-visible rounded-2xl border border-yellow-500/40 bg-[#081326]/95 p-5">
                    <div className="grid grid-cols-[190px_1.1fr_155px_1fr] px-4 pb-4 text-sm font-black tracking-[3px] text-yellow-100">
                      <span>#</span>
                      <span>PLAYER</span>
                      <span>REGION</span>
                      <span>TIERS</span>
                    </div>

                    <div className="space-y-5 overflow-visible">
                      {searched.map((player) => {
                        const actualRank = rankPosition(player);

                        return (
                          <div key={player._id || player.ign} onClick={() => openProfile(player)} className="relative z-10 grid cursor-pointer grid-cols-[190px_1.1fr_155px_1fr] items-center rounded-xl border border-yellow-500/30 bg-[#132039]/95 px-4 py-4 transition-all duration-300 ease-out hover:z-50 hover:-translate-y-1 hover:scale-[1.012] hover:border-yellow-300 hover:bg-[#1b3158]"> 
                            <div className="relative h-[90px] w-[176px] overflow-hidden rounded-none">
                              <div className={`absolute inset-0 ${actualRank === 1 ? "bg-[#f8c82d]" : actualRank === 2 ? "bg-[#aebfc4]" : actualRank === 3 ? "bg-[#c36a2b]" : "bg-[#1c2a3e]"}`} style={{ clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)" }} />
                              {actualRank <= 3 && <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-20 animate-[topSlash_2.6s_ease-in-out_infinite] bg-white/25 blur-[1px]" />}
                              <span className="absolute left-5 top-4 z-10 text-4xl font-black text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.8)]">{actualRank}.</span>
                              <div className="absolute right-[7px] bottom-[-7px] z-10"><RankSkin player={player} /></div>
                            </div>

                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-4xl font-black">{player.ign}</h3>
                                <div className="rounded-sm border border-yellow-500 bg-[#2b1200] px-4 py-1 text-lg font-black text-yellow-300">+{player.points || 0}</div>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xl font-black text-blue-300">
                                <img src={rankIcon(player.rank)} alt={rankName(player.rank)} className="h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                <span>{rankName(player.rank)}</span>
                              </div>
                            </div>

                          <span className="flex w-fit items-center gap-2 rounded-lg border border-green-400 bg-green-500/25 px-4 py-3 text-xl font-black text-green-200">
                            <img src="/region.png" alt="region" className="h-6 w-6 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                            {player.region || "AS"}
                          </span>

                          <div className="flex flex-wrap gap-4 overflow-visible">
                            {gameModes.map((mode) => {
                              const data = getTierData(player, mode.key);
                              const tier = data.current;
                              const hoverId = `${player.ign}-${mode.key}`;

                              return (
                                <div key={mode.key} className="relative flex flex-col items-center" onMouseEnter={() => setHoveredTier(hoverId)} onMouseLeave={() => setHoveredTier(null)}>
                                  <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition hover:scale-110 ${tierCircle(tier)}`}>
                                    <img src={mode.icon} alt={mode.name} className="h-7 w-7 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                  </div>
                                  <span className={`mt-1 rounded-md px-3 py-1 text-sm font-black ${tierBadge(tier)}`}>{tier}</span>
                                  {hoveredTier === hoverId && (
                                    <div className="pointer-events-none absolute bottom-24 left-1/2 z-[9999] w-48 -translate-x-1/2 border border-yellow-500 bg-[#2b1200] p-4 text-left shadow-[0_0_18px_rgba(255,200,0,0.25)]">
                                      <p className="mb-2 border-b border-yellow-500 pb-2 font-black text-white">{mode.name} Rank</p>
                                      <p className="font-bold text-yellow-100">Peak:<span className="float-right text-yellow-300">{data.peak}</span></p>
                                      <p className="font-bold text-yellow-100">Current:<span className="float-right text-yellow-300">{data.current}</span></p>
                                      <p className="font-bold text-yellow-100">Points:<span className="float-right text-yellow-300">+{data.points}</span></p>
                                      <div className="absolute bottom-[-8px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-yellow-500 bg-[#2b1200]" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {activeMode !== "overall" && (
                  <section className="mx-auto mt-10 max-w-[1500px]">
                    <div className="mb-7 flex items-center justify-between rounded-3xl border border-yellow-400/40 bg-[#120700]/90 px-8 py-6">
                      <div className="flex items-center gap-5">
                        <img src={currentMode?.icon || "/global.png"} alt="" className="h-12 w-12 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        <h1 className="text-4xl font-black text-yellow-300">{currentMode?.name} PvP</h1>
                      </div>
                      <div className="rounded-full border border-yellow-400/40 bg-black/60 px-6 py-3 font-black text-yellow-200">🟢 Live Ranking Feed</div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      {["1", "2", "3", "4", "5"].map((tierNum) => {
                        const list = playersForTier(tierNum);
                        return (
                          <div key={tierNum} className="overflow-hidden rounded-t-2xl border border-yellow-500/25 bg-[#0b1426]/95">
                            <div className={`py-4 text-center text-3xl font-black ${tierNum === "1" ? "bg-yellow-500/30 text-yellow-300" : tierNum === "2" ? "bg-gray-500/30 text-gray-200" : tierNum === "3" ? "bg-orange-800/40 text-orange-300" : "bg-slate-800 text-blue-200"}`}>🏆 Tier {tierNum}</div>
                            <div className="space-y-[4px] bg-black/20 p-1">
                              {list.map((player) => {
                                const data = getTierData(player, activeMode);
                                const tier = data.current;
                                return (
                                  <div key={player._id || player.ign} onClick={() => openProfile(player)} className={`flex cursor-pointer items-center justify-between border-l-4 px-3 py-3 transition hover:translate-x-2 ${tier.startsWith("HT") ? "border-yellow-300 bg-yellow-500/25" : "border-orange-500 bg-orange-500/20"}`}> 
                                    <div className="flex items-center gap-3">
                                      <img src={skinHead(player)} alt={player.ign} onError={(e) => { e.currentTarget.src = fallbackHeadSkin; }} className="h-10 w-10 rounded-sm object-cover" />
                                      <div>
                                        <span className="block text-lg font-black">{player.ign}</span>
                                        <span className="text-xs text-green-300">{player.region || "AS"} • {tier}</span>
                                      </div>
                                    </div>
                                    <span className="text-3xl font-black text-yellow-300">{tier.startsWith("HT") ? "»" : "›"}</span>
                                  </div>
                                );
                              })}
                              {list.length === 0 && <div className="py-10 text-center text-sm text-gray-400">No players</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </section>

        <footer className="mt-24 border-t border-blue-900/40 bg-[linear-gradient(90deg,#020816_0%,#031022_40%,#010814_100%)] px-6 py-16">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-4">
                <img src="/boltlogo.png" alt="BoltPvP" className="h-16 w-16 object-contain drop-shadow-[0_0_18px_rgba(255,210,0,0.45)]" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div>
                  <h2 className="text-4xl font-black text-yellow-300">BoltPvP</h2>
                  <p className="mt-1 tracking-[4px] text-sm text-yellow-100">OFFICIAL TIERLIST</p>
                </div>
              </div>
              <p className="mt-6 max-w-md text-lg leading-9 text-slate-300">The official BoltPvP tier list website for rankings, profiles and competitive PvP leaderboards.</p>
              <button onClick={copyServerIp} className="mt-8 flex items-center gap-4 rounded-2xl border border-blue-500/30 bg-[#07172d] px-6 py-5 text-left transition hover:scale-[1.02] hover:border-blue-400/60"> 
                <span className="text-sm font-bold uppercase tracking-[2px] text-slate-400">SERVER IP</span>
                <span className="font-mono text-2xl font-black text-white">boltpvp.fun</span>
                <span className="ml-1 text-xl text-blue-400">📋</span>
              </button>
            </div>

            <div>
              <h3 className="text-3xl font-black uppercase tracking-[2px] text-white">Quick Links</h3>
              <div className="mt-3 h-[3px] w-10 rounded-full bg-blue-500" />
              <div className="mt-8 space-y-5 text-lg">
                <button onClick={() => goPage("home")} className="block text-slate-300 transition hover:text-white">🏠 Home</button>
                <button onClick={() => goPage("tierlist")} className="block text-slate-300 transition hover:text-white">🏆 Rankings</button>
                <a href="https://discord.gg/boltpvp" target="_blank" className="block text-slate-300 transition hover:text-white">💬 Discord</a>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-black uppercase tracking-[2px] text-white">Connect</h3>
              <div className="mt-3 h-[3px] w-10 rounded-full bg-blue-500" />
              <div className="mt-8">
                <a href="https://discord.gg/boltpvp" target="_blank" className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:scale-105 hover:border-blue-400/50 hover:bg-white/10"> 
                  <img src="/discord.png" alt="Discord" className="h-10 w-10 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </a>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-14 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-slate-400">© 2026 BoltPvP. All rights reserved.</div>
        </footer>
      </div>

      {loadingPlayer && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-yellow-500 bg-[#120600] px-14 py-10 text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
            <p className="mt-5 text-2xl font-black text-yellow-300">Loading Profile...</p>
          </div>
        </div>
      )}

      {selectedPlayer && (
        <div onClick={closeProfile} className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div onClick={(e) => e.stopPropagation()} className="modal-pop relative w-full max-w-2xl scale-[0.9] rounded-[34px] border border-yellow-700 bg-[#140700] p-6">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,190,0,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,190,0,.35)_1px,transparent_1px)] bg-[size:38px_38px]" />

            <a href="https://discord.gg/boltpvp" target="_blank" className="absolute left-6 top-6 z-50 transition hover:scale-110"> 
              <img src="/discord.png" alt="discord" className="h-12 w-12 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </a>

            <button type="button" onClick={(e) => { e.stopPropagation(); closeProfile(); }} className="absolute right-6 top-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-3xl font-black text-white transition hover:scale-110 hover:bg-orange-500">×</button>

            <div className="relative z-10 flex flex-col items-center">
              <ProfileSkin player={selectedPlayer} />
              <h1 className="mt-2 text-center text-5xl font-black text-white">{selectedPlayer.ign}</h1>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400 bg-emerald-500/15 px-4 py-2 text-xl font-black text-emerald-300">
                  <img src="/region.png" alt="region" className="h-5 w-5 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  {selectedPlayer.region || "AS"}
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2 text-xl font-black text-yellow-300">
                  <img src={rankIcon(selectedPlayer.rank)} alt={rankName(selectedPlayer.rank)} className="h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  {rankName(selectedPlayer.rank)}
                </div>
                <div className="rounded-sm border border-yellow-500 bg-[#2b1200] px-5 py-2 text-xl font-black text-yellow-300">+{selectedPlayer.points || 0}</div>
              </div>

              <div className="mt-6 flex h-24 w-24 rotate-45 items-center justify-center border-4 border-orange-500 bg-[#1b0a00]">
                <span className="-rotate-45 text-3xl font-black text-white">#{rankPosition(selectedPlayer)}</span>
              </div>

              <div className="mt-7 w-full rounded-[24px] border border-yellow-700 bg-black/40 p-5">
                <h2 className="mb-5 text-center text-4xl font-black tracking-[7px] text-yellow-400">TIERS</h2>
                <div className="grid grid-cols-6 place-items-center gap-4">
                  {gameModes.map((mode) => {
                    const data = getTierData(selectedPlayer, mode.key);
                    const tier = data.current;
                    const hoverId = `profile-${mode.key}`;
                    return (
                      <div key={mode.key} className="relative flex flex-col items-center" onMouseEnter={() => setHoveredTier(hoverId)} onMouseLeave={() => setHoveredTier(null)}>
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition hover:scale-110 ${tierCircle(tier)}`}>
                          <img src={mode.icon} alt={mode.name} className="h-7 w-7 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        </div>
                        <div className={`mt-1 rounded-lg px-3 py-1 text-sm font-black ${tierBadge(tier)}`}>{tier}</div>
                        {hoveredTier === hoverId && (
                          <div className="pointer-events-none absolute -top-40 left-1/2 z-[9999] w-44 -translate-x-1/2 border border-yellow-500 bg-[#2b1200] p-3 text-left text-sm shadow-[0_0_18px_rgba(255,200,0,0.25)]">
                            <p className="mb-2 border-b border-yellow-500 pb-1 font-black text-white">{mode.name} Rank</p>
                            <p className="font-bold text-yellow-100">Peak:<span className="float-right text-yellow-300">{data.peak}</span></p>
                            <p className="font-bold text-yellow-100">Current:<span className="float-right text-yellow-300">{data.current}</span></p>
                            <p className="font-bold text-yellow-100">Points:<span className="float-right text-yellow-300">+{data.points}</span></p>
                            <div className="absolute bottom-[-8px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-yellow-500 bg-[#2b1200]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 text-center text-xl font-black text-orange-300">SERVER IP: boltpvp.fun</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}