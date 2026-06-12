import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, CheckCircle, MapPin, Zap, Lock, Home as HomeIcon,
  Copy, Check, Send, Loader2, Ruler, IdCard, Shield, Globe2,
  Building2, TreePine, Landmark
} from "lucide-react";

// ── Google Fonts ─────────────────────────────────────────────────────────────
const FONT_ID = "plr-fonts";
if (typeof document !== "undefined" && !document.getElementById(FONT_ID)) {
  const link = document.createElement("link");
  link.id = FONT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap";
  document.head.appendChild(link);
}

// ── Contract ─────────────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = "0xE6AEE2993397BE12CA017898EEEeA2143434f630";
const ABI = [
  "function registerLand(address to, string location, string area, string ownerCNIC, string ipfsHash) public returns (uint256)",
  "function getLand(uint256 tokenId) public view returns (tuple(string location, string area, string ownerCNIC, string ipfsHash, bool exists))",
  "function getLandOwner(uint256 tokenId) public view returns (address)",
  "function transferLand(address to, uint256 tokenId) public",
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  green:     "#1a7a4a",
  greenMid:  "#22c55e",
  greenLight:"#4ade80",
  gold:      "#c9a84c",
  goldLight: "#f0d080",
  cream:     "#faf7f0",
  ink:       "#0e1a0f",
  slate:     "#3d5a45",
  mist:      "#e8f0ea",
  cardBg:    "rgba(255,255,255,0.72)",
  body:      "'Plus Jakarta Sans', sans-serif",
  display:   "'Playfair Display', serif",
};

// ── Animated SVG background landscape ────────────────────────────────────────
function LandscapeBG() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c8e6c9" />
          <stop offset="55%"  stopColor="#e8f5e9" />
          <stop offset="100%" stopColor="#f1f8e9" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5d6a7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#81c784" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#66bb6a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#43a047" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#388e3c" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.08" />
        </linearGradient>
        <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="blur3"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      {/* Sky */}
      <rect width="1440" height="900" fill="url(#skyGrad)" />

      {/* Sun */}
      <motion.circle
        cx={160} cy={110} r={54}
        fill="#ffe082" opacity={0.45}
        animate={{ cy: [110, 100, 110], opacity: [0.45, 0.55, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        filter="url(#blur6)"
      />
      <motion.circle
        cx={160} cy={110} r={32}
        fill="#ffd54f" opacity={0.7}
        animate={{ cy: [110, 100, 110] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Clouds */}
      {[
        { cx: 260,  cy: 90,  rx: 110, ry: 34, delay: 0   },
        { cx: 750,  cy: 70,  rx: 140, ry: 38, delay: 1.5 },
        { cx: 1220, cy: 100, rx: 100, ry: 30, delay: 3   },
        { cx: 980,  cy: 55,  rx: 90,  ry: 26, delay: 2   },
      ].map((c, i) => (
        <motion.ellipse
          key={i}
          cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry}
          fill="white" opacity={0.62}
          filter="url(#blur3)"
          animate={{ cx: [c.cx, c.cx + 30, c.cx], opacity: [0.62, 0.72, 0.62] }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
        />
      ))}

      {/* Far hills */}
      <motion.path
        d="M0,520 C180,420 360,480 540,450 C720,420 900,490 1080,460 C1260,430 1380,480 1440,460 L1440,900 L0,900 Z"
        fill="url(#hillFar)"
        filter="url(#blur6)"
        animate={{ d: [
          "M0,520 C180,420 360,480 540,450 C720,420 900,490 1080,460 C1260,430 1380,480 1440,460 L1440,900 L0,900 Z",
          "M0,530 C180,430 360,470 540,445 C720,415 900,500 1080,465 C1260,440 1380,470 1440,450 L1440,900 L0,900 Z",
          "M0,520 C180,420 360,480 540,450 C720,420 900,490 1080,460 C1260,430 1380,480 1440,460 L1440,900 L0,900 Z",
        ]}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Near hills */}
      <motion.path
        d="M0,620 C200,540 400,590 600,560 C800,530 1000,600 1200,570 C1320,555 1400,575 1440,565 L1440,900 L0,900 Z"
        fill="url(#hillNear)"
        filter="url(#blur3)"
        animate={{ d: [
          "M0,620 C200,540 400,590 600,560 C800,530 1000,600 1200,570 C1320,555 1400,575 1440,565 L1440,900 L0,900 Z",
          "M0,610 C200,555 400,580 600,555 C800,525 1000,610 1200,575 C1320,560 1400,565 1440,555 L1440,900 L0,900 Z",
          "M0,620 C200,540 400,590 600,560 C800,530 1000,600 1200,570 C1320,555 1400,575 1440,565 L1440,900 L0,900 Z",
        ]}}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Ground */}
      <rect x="0" y="700" width="1440" height="200" fill="url(#ground)" />

      {/* Field grid lines (land parcels aesthetic) */}
      {[200, 400, 600, 800, 1000, 1200].map((x, i) => (
        <line key={i} x1={x} y1={700} x2={x + 80} y2={900} stroke={T.green} strokeOpacity={0.08} strokeWidth={1} />
      ))}
      {[720, 760, 800, 840].map((y, i) => (
        <line key={i} x1={0} y1={y} x2={1440} y2={y} stroke={T.green} strokeOpacity={0.06} strokeWidth={1} />
      ))}

      {/* Mosque/Landmark silhouette (center) */}
      <g opacity={0.13} transform="translate(680, 530)">
        {/* dome */}
        <ellipse cx="40" cy="50" rx="30" ry="20" fill={T.green} />
        {/* tower */}
        <rect x="34" y="30" width="12" height="60" fill={T.green} />
        <rect x="30" y="26" width="20" height="6" rx="3" fill={T.green} />
        {/* minarets */}
        <rect x="10" y="40" width="7" height="50" fill={T.green} />
        <rect x="63" y="40" width="7" height="50" fill={T.green} />
        <ellipse cx="13" cy="38" rx="5" ry="4" fill={T.green} />
        <ellipse cx="66" cy="38" rx="5" ry="4" fill={T.green} />
      </g>

      {/* Stars (subtle, top portion) */}
      {[
        [900,50],[1050,30],[1150,80],[1300,45],[1380,90],[1410,30],
        [300,40],[450,25],[550,65],[80,55],[1100,110]
      ].map(([x, y], i) => (
        <motion.circle
          key={i} cx={x} cy={y} r={1.5}
          fill="white" opacity={0.4}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Noise overlay for texture */}
      <rect width="1440" height="900" fill="white" opacity={0.08} />
    </svg>
  );
}

// ── Floating particles ────────────────────────────────────────────────────────
function Particles() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${8 + (i * 7.5) % 90}%`,
            top: `${10 + (i * 11) % 80}%`,
            width: i % 3 === 0 ? 6 : 4,
            height: i % 3 === 0 ? 6 : 4,
            borderRadius: "50%",
            background: i % 2 === 0 ? T.greenMid : T.gold,
            opacity: 0.18,
          }}
          animate={{
            y: [-12, 12, -12],
            x: [-6, 6, -6],
            opacity: [0.18, 0.32, 0.18],
          }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

// ── Stat badge ────────────────────────────────────────────────────────────────
function StatBadge({ icon: Icon, label, value }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        background: T.cardBg,
        border: `1px solid rgba(26,122,74,0.15)`,
        borderRadius: 14,
        padding: "16px 20px",
        backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 4px 20px rgba(26,122,74,0.08)",
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${T.green}, ${T.greenMid})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color="white" />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontFamily: T.body }}>{value}</div>
        <div style={{ fontSize: 11, color: T.slate, fontWeight: 500, fontFamily: T.body }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "10px",
  border: `1.5px solid rgba(26,122,74,0.18)`,
  background: "rgba(255,255,255,0.55)",
  color: T.ink,
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: T.body,
  transition: "border 0.2s, box-shadow 0.2s",
};
const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  color: T.slate,
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontFamily: T.body,
};
const cardStyle = {
  background: T.cardBg,
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: 20,
  padding: 30,
  backdropFilter: "blur(20px)",
  boxShadow: "0 8px 40px rgba(26,122,74,0.08), 0 2px 10px rgba(0,0,0,0.04)",
};

function Spinner() {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "flex" }}>
      <Loader2 size={16} />
    </motion.div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [account, setAccount]               = useState("");
  const [location, setLocation]             = useState("");
  const [area, setArea]                     = useState("");
  const [cnic, setCnic]                     = useState("");
  const [tokenId, setTokenId]               = useState("");
  const [landInfo, setLandInfo]             = useState(null);
  const [status, setStatus]                 = useState("");
  const [loading, setLoading]               = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [activeTab, setActiveTab]           = useState("register");
  const [transferTokenId, setTransferTokenId] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [scrolled, setScrolled]             = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const toast = (msg, ms = 4000) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), ms);
  };

  const getContract = async () => {
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, s);
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] });
      const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accs[0]);
      toast("✅ Wallet connected");
    } catch (e) { toast("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const registerLand = async () => {
    if (!location || !area || !cnic) { toast("⚠️ Fill all fields"); return; }
    try {
      setLoading(true); toast("🔄 Registering…");
      const c = await getContract();
      const tx = await c.registerLand(account, location, area, cnic, "ipfs://demo");
      await tx.wait();
      toast("✅ Land registered & NFT minted!");
      setLocation(""); setArea(""); setCnic("");
    } catch (e) { toast("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const lookupLand = async () => {
    if (!tokenId) { toast("⚠️ Enter a token ID"); return; }
    try {
      setLoading(true); toast("🔍 Verifying…");
      const c = await getContract();
      const land = await c.getLand(tokenId);
      const owner = await c.getLandOwner(tokenId);
      setLandInfo({ location: land[0], area: land[1], ownerCNIC: land[2], owner });
      setStatus("");
    } catch (e) { toast("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const transferLand = async () => {
    if (!transferTokenId || !transferAddress) { toast("⚠️ Fill all transfer fields"); return; }
    try {
      setLoading(true); toast("🔄 Transferring…");
      const c = await getContract();
      const tx = await c.transferLand(transferAddress, transferTokenId);
      await tx.wait();
      toast("✅ Land transferred!");
      setTransferTokenId(""); setTransferAddress("");
    } catch (e) { toast("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusStyle = (() => {
    if (status.includes("✅")) return { bg: "rgba(26,122,74,0.08)", border: "rgba(26,122,74,0.28)", color: T.green };
    if (status.includes("❌")) return { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", color: "#dc2626" };
    return { bg: "rgba(201,168,76,0.10)", border: "rgba(201,168,76,0.3)", color: "#92691d" };
  })();

  const TABS = [
    { id: "register", label: "Register",  icon: MapPin      },
    { id: "verify",   label: "Verify",    icon: CheckCircle },
    { id: "transfer", label: "Transfer",  icon: Send        },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: T.body, color: T.ink, position: "relative" }}>
      <LandscapeBG />
      <Particles />

      {/* ── NAV ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(20px)",
          background: scrolled ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.55)",
          borderBottom: `1px solid rgba(26,122,74,${scrolled ? "0.15" : "0.08"})`,
          transition: "background 0.3s, border 0.3s",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.04 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: `linear-gradient(135deg, ${T.green}, #0f5132)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(26,122,74,0.35)",
            }}>
              <Landmark size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: T.display, fontSize: 17, fontWeight: 800, color: T.ink, lineHeight: 1.1 }}>
                PAK<span style={{ color: T.green }}>LAND</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.slate, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Registry · Blockchain
              </div>
            </div>
          </motion.div>

          {/* Nav links (desktop) */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {["Home", "Verify", "About"].map((l) => (
              <span key={l} style={{ fontSize: 13, fontWeight: 600, color: T.slate, padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>{l}</span>
            ))}
          </div>

          {/* Wallet btn */}
          <motion.button
            onClick={connectWallet}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13, fontFamily: T.body,
              background: account
                ? "rgba(26,122,74,0.1)"
                : `linear-gradient(90deg, ${T.green}, #0f5132)`,
              color: account ? T.green : "white",
              boxShadow: account ? "none" : "0 4px 16px rgba(26,122,74,0.38)",
              transition: "all 0.25s",
            }}
          >
            <Wallet size={14} />
            {loading ? <Spinner /> : account ? `${account.slice(0,6)}…${account.slice(-4)}` : "Connect Wallet"}
          </motion.button>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1040, margin: "0 auto", padding: "80px 28px 50px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", marginBottom: 52 }}
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(26,122,74,0.1)", border: "1px solid rgba(26,122,74,0.25)",
              borderRadius: 999, padding: "6px 16px", marginBottom: 22,
              fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: "0.04em",
              backdropFilter: "blur(8px)",
            }}
          >
            <Globe2 size={12} /> Powered by Ethereum Sepolia Testnet
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{
              fontFamily: T.display,
              fontSize: "clamp(40px, 6vw, 66px)",
              fontWeight: 800,
              margin: "0 0 18px",
              lineHeight: 1.1,
              color: T.ink,
              letterSpacing: "-0.02em",
            }}
          >
            Pakistan's Land{" "}
            <span style={{
              background: `linear-gradient(90deg, ${T.green}, ${T.greenMid})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              on Blockchain
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{ fontSize: 16, color: T.slate, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}
          >
            Register land parcels as NFTs, verify ownership in seconds, and transfer property — permanently recorded on-chain.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <StatBadge icon={Shield}    label="Tamper-Proof"    value="100%" />
            <StatBadge icon={Zap}       label="Verify Time"     value="< 3s" />
            <StatBadge icon={Building2} label="Network"         value="Sepolia" />
            <StatBadge icon={TreePine}  label="Carbon Tracked"  value="On-chain" />
          </motion.div>
        </motion.div>

        {/* ── CARD PANEL ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          style={{ maxWidth: 640, margin: "0 auto" }}
        >
          {/* Tab bar */}
          <div style={{
            display: "flex", gap: 4,
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(26,122,74,0.12)",
            borderRadius: 14,
            padding: 5,
            marginBottom: 20,
            backdropFilter: "blur(12px)",
          }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => { setActiveTab(id); setLandInfo(null); }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "12px 8px", border: "none", borderRadius: 10, cursor: "pointer",
                    fontWeight: 700, fontSize: 13, fontFamily: T.body,
                    background: active ? `linear-gradient(90deg, ${T.green}, #0f5132)` : "transparent",
                    color: active ? "white" : T.slate,
                    boxShadow: active ? "0 4px 14px rgba(26,122,74,0.32)" : "none",
                    transition: "all 0.22s",
                  }}
                >
                  <Icon size={13} /> {label}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* ── REGISTER ── */}
            {activeTab === "register" && (
              <motion.div
                key="reg"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
                style={cardStyle}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${T.green}, #0f5132)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={16} color="white" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: T.display }}>Register Land Parcel</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Location", val: location, set: setLocation, ph: "Plot 5, DHA Karachi" },
                    { label: "Area",     val: area,     set: setArea,     ph: "500 sq yards" },
                    { label: "Owner CNIC", val: cnic,   set: setCnic,     ph: "42101-1234567-1" },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label}>
                      <label style={labelStyle}>{label}</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        style={inputStyle}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        placeholder={ph}
                      />
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={registerLand}
                  disabled={loading || !account}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", marginTop: 22, padding: "14px",
                    border: "none", borderRadius: 11, cursor: (loading || !account) ? "not-allowed" : "pointer",
                    opacity: (loading || !account) ? 0.5 : 1,
                    fontWeight: 700, fontSize: 14, color: "white",
                    background: `linear-gradient(90deg, ${T.green}, #0f5132)`,
                    boxShadow: "0 6px 20px rgba(26,122,74,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: T.body,
                  }}
                >
                  {loading ? <><Spinner /> Processing…</> : <><Zap size={15} /> Register Land & Mint NFT</>}
                </motion.button>

                {!account && (
                  <p style={{ textAlign: "center", fontSize: 12, color: T.slate, marginTop: 10 }}>
                    Connect your wallet first
                  </p>
                )}
              </motion.div>
            )}

            {/* ── VERIFY ── */}
            {activeTab === "verify" && (
              <motion.div
                key="ver"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
                style={cardStyle}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg, #2563eb, #1e40af)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle size={16} color="white" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: T.display }}>Verify Ownership</h3>
                </div>

                <label style={labelStyle}>Land Token ID</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  style={inputStyle}
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Enter token ID (e.g. 1)"
                />

                <motion.button
                  onClick={lookupLand}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", marginTop: 16, padding: "14px",
                    border: "none", borderRadius: 11, cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    fontWeight: 700, fontSize: 14, color: "white",
                    background: "linear-gradient(90deg, #2563eb, #1e40af)",
                    boxShadow: "0 6px 20px rgba(37,99,235,0.32)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: T.body,
                  }}
                >
                  {loading ? <><Spinner /> Verifying…</> : <><CheckCircle size={15} /> Verify Ownership</>}
                </motion.button>

                <AnimatePresence>
                  {landInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        marginTop: 20,
                        background: "rgba(26,122,74,0.05)",
                        border: "1px solid rgba(26,122,74,0.2)",
                        borderRadius: 14, padding: 18,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: T.green, fontWeight: 800, fontSize: 14 }}>
                        <CheckCircle size={16} /> Ownership Verified
                      </div>
                      {[
                        { label: "Location",    value: landInfo.location,  icon: MapPin  },
                        { label: "Area",        value: landInfo.area,      icon: Ruler   },
                        { label: "Owner CNIC",  value: landInfo.ownerCNIC, icon: IdCard  },
                        { label: "Wallet",      value: landInfo.owner,     icon: Wallet  },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: "rgba(255,255,255,0.65)", borderRadius: 10,
                            padding: "10px 12px", marginBottom: 8,
                            border: "1px solid rgba(26,122,74,0.1)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <item.icon size={14} color={T.green} />
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                              <div style={{ fontSize: 13, fontWeight: 500, wordBreak: "break-all", color: T.ink }}>{item.value}</div>
                            </div>
                          </div>
                          <motion.button onClick={() => copy(item.value)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                            {copied ? <Check size={14} color={T.green} /> : <Copy size={14} color={T.slate} />}
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── TRANSFER ── */}
            {activeTab === "transfer" && (
              <motion.div
                key="tra"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
                style={cardStyle}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg, #9333ea, #7e22ce)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Send size={16} color="white" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: T.display }}>Transfer Ownership</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Land Token ID</label>
                    <motion.input whileFocus={{ scale: 1.01 }} style={inputStyle} value={transferTokenId} onChange={(e) => setTransferTokenId(e.target.value)} placeholder="Token ID to transfer (e.g. 1)" />
                  </div>
                  <div>
                    <label style={labelStyle}>Recipient Wallet Address</label>
                    <motion.input whileFocus={{ scale: 1.01 }} style={inputStyle} value={transferAddress} onChange={(e) => setTransferAddress(e.target.value)} placeholder="0x…" />
                  </div>
                </div>

                <motion.button
                  onClick={transferLand}
                  disabled={loading || !account}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", marginTop: 22, padding: "14px",
                    border: "none", borderRadius: 11, cursor: (loading || !account) ? "not-allowed" : "pointer",
                    opacity: (loading || !account) ? 0.5 : 1,
                    fontWeight: 700, fontSize: 14, color: "white",
                    background: "linear-gradient(90deg, #9333ea, #7e22ce)",
                    boxShadow: "0 6px 20px rgba(147,51,234,0.32)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: T.body,
                  }}
                >
                  {loading ? <><Spinner /> Transferring…</> : <><Send size={15} /> Transfer Land</>}
                </motion.button>

                <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, fontSize: 13, color: "#7a5c10" }}>
                  ⚠️ Transfers are permanent and irreversible. Double-check the recipient address.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status toast */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                style={{
                  marginTop: 16, padding: "13px 16px",
                  borderRadius: 10, border: `1px solid ${statusStyle.border}`,
                  background: statusStyle.bg, color: statusStyle.color,
                  fontSize: 13, fontWeight: 600, textAlign: "center",
                  backdropFilter: "blur(10px)",
                }}
              >
                {status}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          position: "relative", zIndex: 2,
          borderTop: "1px solid rgba(26,122,74,0.1)",
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(12px)",
          padding: "24px 28px",
          textAlign: "center",
          fontSize: 12, color: T.slate,
          fontFamily: T.body,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
          <Landmark size={14} color={T.green} />
          <span style={{ fontWeight: 700, color: T.ink }}>PAK<span style={{ color: T.green }}>LAND</span> Registry</span>
        </div>
        Built on Ethereum Sepolia · Contract: {CONTRACT_ADDRESS.slice(0, 10)}…{CONTRACT_ADDRESS.slice(-6)}
        <span style={{ marginLeft: 12, color: T.green, fontWeight: 600 }}>Verified ✓</span>
      </motion.footer>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #94a3b8; }
        input:focus {
          border-color: ${T.green} !important;
          box-shadow: 0 0 0 3px rgba(26,122,74,0.12) !important;
        }
        @media (max-width: 640px) {
          h1 { font-size: 36px !important; }
        }
      `}</style>
    </div>
  );
}