import { useState } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = "0xE6AEE2993397BE12CA017898EEEeA2143434f630";
const ABI = [
  "function registerLand(address to, string location, string area, string ownerCNIC, string ipfsHash) public returns (uint256)",
  "function getLand(uint256 tokenId) public view returns (tuple(string location, string area, string ownerCNIC, string ipfsHash, bool exists))",
  "function getLandOwner(uint256 tokenId) public view returns (address)",
  "function transferLand(address to, uint256 tokenId) public"
];

function App() {
  const [account, setAccount] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [cnic, setCnic] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferTokenId, setTransferTokenId] = useState("");
  const [landInfo, setLandInfo] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("register");

  const connectWallet = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    setStatus("✅ Wallet connected!");
  };

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  const registerLand = async () => {
    try {
      setLoading(true);
      setStatus("⏳ Registering land on blockchain...");
      const contract = await getContract();
      const tx = await contract.registerLand(account, location, area, cnic, "ipfs://demo");
      await tx.wait();
      setStatus("✅ Land registered successfully! Check Sepolia Etherscan.");
      setLocation(""); setArea(""); setCnic("");
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const lookupLand = async () => {
    try {
      setLoading(true);
      setStatus("🔍 Searching blockchain...");
      const contract = await getContract();
      const land = await contract.getLand(tokenId);
      const owner = await contract.getLandOwner(tokenId);
      setLandInfo({ location: land[0], area: land[1], ownerCNIC: land[2], owner });
      setStatus("");
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const transferLand = async () => {
    try {
      setLoading(true);
      setStatus("⏳ Transferring ownership...");
      const contract = await getContract();
      const tx = await contract.transferLand(transferTo, transferTokenId);
      await tx.wait();
      setStatus("✅ Land transferred successfully!");
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    app: { minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", fontFamily: "'Segoe UI', sans-serif", color: "white", overflow: "hidden", position: "relative" },
    header: { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 },
    logo: { fontSize: "24px", fontWeight: "800", background: "linear-gradient(90deg, #60a5fa, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    connectBtn: { padding: "10px 24px", background: account ? "linear-gradient(90deg, #16a34a, #15803d)" : "linear-gradient(90deg, #2563eb, #1d4ed8)", border: "none", borderRadius: "50px", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
    hero: { textAlign: "center", padding: "60px 20px 40px", position: "relative", zIndex: 2 },
    heroTitle: { fontSize: "48px", fontWeight: "900", margin: "0 0 16px", lineHeight: 1.1 },
    heroSub: { fontSize: "18px", color: "#94a3b8", marginBottom: "40px" },
    statsRow: { display: "flex", justifyContent: "center", gap: "40px", marginBottom: "50px", flexWrap: "wrap" },
    statBox: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px 30px", textAlign: "center" },
    statNum: { fontSize: "28px", fontWeight: "800", color: "#60a5fa" },
    statLabel: { fontSize: "13px", color: "#94a3b8", marginTop: "4px" },
    container: { maxWidth: "800px", margin: "0 auto", padding: "0 20px 60px", position: "relative", zIndex: 2 },
    tabs: { display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "6px", marginBottom: "30px", gap: "4px", position: "relative" },
    tab: { flex: 1, padding: "12px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: "transparent", position: "relative", zIndex: 1 },
    card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(10px)" },
    cardTitle: { fontSize: "22px", fontWeight: "700", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" },
    input: { width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", color: "white", fontSize: "15px", marginBottom: "14px", boxSizing: "border-box", outline: "none" },
    btn: { width: "100%", padding: "16px", border: "none", borderRadius: "12px", color: "white", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginTop: "8px" },
    resultCard: { marginTop: "20px", background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.3)", borderRadius: "16px", padding: "20px" },
    resultRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: "14px" },
    statusBox: { marginTop: "20px", padding: "14px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", fontSize: "15px" },
    badge: { display: "inline-block", padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", background: "rgba(96,165,250,0.2)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }
  };

  const tabs = [
    { key: "register", label: "📝 Register Land" },
    { key: "verify", label: "🔍 Verify Ownership" },
    { key: "transfer", label: "🔄 Transfer Land" },
  ];

  // Floating background particles
  const particles = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div style={styles.app}>
      {/* Animated background particles */}
      {particles.map((i) => {
        const size = 4 + (i % 5) * 3;
        const left = (i * 53) % 100;
        const duration = 12 + (i % 6) * 4;
        const delay = (i % 7) * 1.5;
        const colors = ["#60a5fa", "#34d399", "#7c3aed", "#f472b6"];
        return (
          <motion.div
            key={i}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.6, 0.6, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: `${left}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: colors[i % colors.length],
              filter: "blur(1px)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Animated glowing orbs */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "10%", left: "5%", width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.25), transparent 70%)",
          filter: "blur(40px)", zIndex: 0, pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", bottom: "5%", right: "5%", width: 350, height: 350,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.2), transparent 70%)",
          filter: "blur(50px)", zIndex: 0, pointerEvents: "none",
        }}
      />

      {/* Header */}
      <motion.div
        style={styles.header}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          style={styles.logo}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🏛️ PakLandChain
        </motion.div>
        <motion.button
          style={styles.connectBtn}
          onClick={connectWallet}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
        >
          {account ? "✅ " + account.slice(0, 6) + "..." + account.slice(-4) : "Connect Wallet"}
        </motion.button>
      </motion.div>

      {/* Hero */}
      <div style={styles.hero}>
        <motion.div
          style={styles.badge}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Powered by Ethereum Sepolia Testnet
        </motion.div>

        <motion.h1
          style={styles.heroTitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
        >
          Pakistan's First
          <br />
          <motion.span
            style={{
              background: "linear-gradient(90deg, #60a5fa, #34d399, #7c3aed, #60a5fa)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            Blockchain Land Registry
          </motion.span>
        </motion.h1>

        <motion.p
          style={styles.heroSub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Immutable • Transparent • Fraud-Proof Property Records on Blockchain
        </motion.p>

        <div style={styles.statsRow}>
          {[
            { num: "100%", label: "Tamper Proof" },
            { num: "NFT", label: "Based Ownership" },
            { num: "0%", label: "Corruption Risk" },
            { num: "ERC-721", label: "Standard" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              style={styles.statBox}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.12, duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.06, borderColor: "rgba(96,165,250,0.5)" }}
            >
              <div style={styles.statNum}>{s.num}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={styles.container}>
        {/* Tabs */}
        <motion.div
          style={styles.tabs}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              style={{
                ...styles.tab,
                color: activeTab === t.key ? "white" : "#94a3b8",
              }}
              onClick={() => { setActiveTab(t.key); setStatus(""); }}
            >
              {activeTab === t.key && (
                <motion.div
                  layoutId="tabBg"
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                    borderRadius: 12, zIndex: -1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Tab content with animated transitions */}
        <AnimatePresence mode="wait">
          {activeTab === "register" && (
            <motion.div
              key="register"
              style={styles.card}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.cardTitle}>📝 Register New Land Parcel</div>
              <motion.input whileFocus={{ scale: 1.01, borderColor: "#60a5fa" }} style={styles.input} placeholder="📍 Location (e.g. Plot 5, DHA Phase 6, Karachi)" value={location} onChange={e => setLocation(e.target.value)} />
              <motion.input whileFocus={{ scale: 1.01, borderColor: "#60a5fa" }} style={styles.input} placeholder="📐 Area (e.g. 500 Sq Yards)" value={area} onChange={e => setArea(e.target.value)} />
              <motion.input whileFocus={{ scale: 1.01, borderColor: "#60a5fa" }} style={styles.input} placeholder="🪪 Owner CNIC (e.g. 42101-1234567-1)" value={cnic} onChange={e => setCnic(e.target.value)} />
              <motion.button
                style={{ ...styles.btn, background: loading ? "#374151" : "linear-gradient(90deg, #16a34a, #15803d)" }}
                onClick={registerLand}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 20px rgba(22,163,74,0.5)" } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
              >
                {loading ? (
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    ⏳ Minting NFT...
                  </motion.span>
                ) : "🏠 Register Land & Mint NFT"}
              </motion.button>
            </motion.div>
          )}

          {activeTab === "verify" && (
            <motion.div
              key="verify"
              style={styles.card}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.cardTitle}>🔍 Verify Land Ownership</div>
              <motion.input whileFocus={{ scale: 1.01, borderColor: "#7c3aed" }} style={styles.input} placeholder="Enter Land Token ID (e.g. 1)" value={tokenId} onChange={e => setTokenId(e.target.value)} />
              <motion.button
                style={{ ...styles.btn, background: loading ? "#374151" : "linear-gradient(90deg, #7c3aed, #6d28d9)" }}
                onClick={lookupLand}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 20px rgba(124,58,237,0.5)" } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
              >
                {loading ? (
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    🔍 Searching...
                  </motion.span>
                ) : "🔍 Verify on Blockchain"}
              </motion.button>

              <AnimatePresence>
                {landInfo && (
                  <motion.div
                    style={styles.resultCard}
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      style={{ fontWeight: "700", marginBottom: "12px", color: "#34d399" }}
                    >
                      ✅ Land Record Found
                    </motion.div>
                    {[
                      ["📍 Location", landInfo.location],
                      ["📐 Area", landInfo.area],
                      ["🪪 CNIC", landInfo.ownerCNIC],
                      ["👛 Wallet", landInfo.owner],
                    ].map(([label, val], i) => (
                      <motion.div
                        key={label}
                        style={{ ...styles.resultRow, borderBottom: i === 3 ? "none" : styles.resultRow.borderBottom }}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                      >
                        <span style={{ color: "#94a3b8" }}>{label}</span>
                        <span style={{ fontSize: label === "👛 Wallet" ? "12px" : "14px" }}>{val}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "transfer" && (
            <motion.div
              key="transfer"
              style={styles.card}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.cardTitle}>🔄 Transfer Land Ownership</div>
              <motion.input whileFocus={{ scale: 1.01, borderColor: "#dc2626" }} style={styles.input} placeholder="Land Token ID to transfer" value={transferTokenId} onChange={e => setTransferTokenId(e.target.value)} />
              <motion.input whileFocus={{ scale: 1.01, borderColor: "#dc2626" }} style={styles.input} placeholder="New Owner Wallet Address (0x...)" value={transferTo} onChange={e => setTransferTo(e.target.value)} />
              <motion.button
                style={{ ...styles.btn, background: loading ? "#374151" : "linear-gradient(90deg, #dc2626, #b91c1c)" }}
                onClick={transferLand}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 20px rgba(220,38,38,0.5)" } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
              >
                {loading ? (
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    ⏳ Transferring...
                  </motion.span>
                ) : "🔄 Transfer Ownership"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status */}
        <AnimatePresence>
          {status && (
            <motion.div
              style={styles.statusBox}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {status}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;