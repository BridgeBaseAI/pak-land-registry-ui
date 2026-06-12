import { useState } from "react";
import { ethers } from "ethers";

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
  const [landInfo, setLandInfo] = useState(null);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    setStatus("Wallet connected: " + accounts[0]);
};

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  const registerLand = async () => {
    try {
      setStatus("Registering land...");
      const contract = await getContract();
      const tx = await contract.registerLand(account, location, area, cnic, "ipfs://demo");
      await tx.wait();
      setStatus("✅ Land registered successfully!");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  const lookupLand = async () => {
    try {
      setStatus("Looking up...");
      const contract = await getContract();
      const land = await contract.getLand(tokenId);
      const owner = await contract.getLandOwner(tokenId);
      setLandInfo({ location: land[0], area: land[1], ownerCNIC: land[2], owner });
      setStatus("");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "700px", margin: "auto" }}>
      <h1>🏠 Pakistan Land Registry</h1>
      <h3>Blockchain-Powered Property Verification</h3>

      <button onClick={connectWallet} style={{ padding: "10px 20px", marginBottom: "20px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
        {account ? "✅ Connected: " + account.slice(0,6) + "..." : "Connect MetaMask"}
      </button>

      <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h2>Register Land</h2>
        <input placeholder="Location (e.g. Plot 5, DHA Karachi)" value={location} onChange={e => setLocation(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }} /><br />
        <input placeholder="Area (e.g. 500 sq yards)" value={area} onChange={e => setArea(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }} /><br />
        <input placeholder="Owner CNIC (e.g. 42101-1234567-1)" value={cnic} onChange={e => setCnic(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }} /><br />
        <button onClick={registerLand} style={{ padding: "10px 20px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Register Land (Mint NFT)
        </button>
      </div>

      <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h2>Verify Ownership</h2>
        <input placeholder="Enter Land Token ID (e.g. 1)" value={tokenId} onChange={e => setTokenId(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }} /><br />
        <button onClick={lookupLand} style={{ padding: "10px 20px", background: "#7c3aed", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Verify Ownership
        </button>
        {landInfo && (
          <div style={{ marginTop: "15px", background: "white", padding: "15px", borderRadius: "8px" }}>
            <p><b>📍 Location:</b> {landInfo.location}</p>
            <p><b>📐 Area:</b> {landInfo.area}</p>
            <p><b>🪪 Owner CNIC:</b> {landInfo.ownerCNIC}</p>
            <p><b>👛 Wallet:</b> {landInfo.owner}</p>
          </div>
        )}
      </div>

      {status && <p style={{ color: status.includes("✅") ? "green" : "#dc2626" }}>{status}</p>}
    </div>
  );
}

export default App;