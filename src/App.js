import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  Ship,
  UserPlus,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// --- SETUP FIREBASE ---
const envConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : null;
const firebaseConfig = {
  apiKey: "AIzaSyBtX0Yu4gA8KUseT2SIRqoHAVBvpJLzb-M",
  authDomain: "crew-matrix-app.firebaseapp.com",
  projectId: "crew-matrix-app",
  storageBucket: "crew-matrix-app.firebasestorage.app",
  messagingSenderId: "383886678503",
  appId: "1:383886678503:web:741913d8c4ba67ce630542",
  measurementId: "G-4CTVL1WNBC",
};
const app = initializeApp(firebaseConfig);
const authFirebase = getAuth(app);
const db = getFirestore(app);

// --- KAMUS SINGKATAN SERTIFIKAT PELAUT ---
const CERT_DICTIONARY = {
  bst: "Basic Safety Training (BST)",
  coc: "Certificate of Competency (CoC)",
  aff: "Advanced Fire Fighting (AFF)",
  mfa: "Medical First Aid (MFA)",
  mefa: "Medical First Aid (MEFA)",
  mc: "Medical Care (MC)",
  scrb: "Survival Craft and Rescue Boats (SCRB)",
  scrbs: "Survival Craft and Rescue Boats (SCRBS)",
  brm: "Bridge Resource Management (BRM)",
  erm: "Engine Resource Management (ERM)",
  sso: "Ship Security Officer (SSO)",
  sdsd: "Seafarers with Designated Security Duties (SDSD)",
  sat: "Security Awareness Training (SAT)",
  erw: "Engine Room Watchkeeping (ERW)",
  nkw: "Navigational Watchkeeping (NKW)",
  boct: "Basic Oil and Chemical Tanker (BOCT)",
  blt: "Basic Liquefied Gas Tanker (BLT)",
  aot: "Advanced Oil Tanker (AOT)",
  act: "Advanced Chemical Tanker (ACT)",
  agt: "Advanced Gas Tanker (AGT)",
};

const sanitizeInput = (str) => {
  if (!str) return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        tag
      ])
  );
};

// --- CUSTOM STYLES ---
const CustomStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    :root { --bg-dark: #050A15; --bg-navy: #0A1128; --panel-glass: rgba(30, 30, 36, 0.65); --neon-cyan: #00F0FF; }
    body { background-color: var(--bg-dark); color: #E2E8F0; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
    .glass-panel { background: var(--panel-glass); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); }
    .glass-input { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.1); color: white; transition: all 0.3s ease; }
    .glass-input:focus { border-color: var(--neon-cyan); box-shadow: 0 0 10px rgba(0, 240, 255, 0.2); outline: none; }
    
    @keyframes floatShip { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
    .ship-anim { animation: floatShip 4s ease-in-out infinite; }
    @keyframes glowingWaves { 0% { box-shadow: 0 0 10px rgba(0,240,255,0.2); opacity: 0.5; transform: scaleX(0.8); } 50% { box-shadow: 0 0 30px rgba(0,240,255,0.8); opacity: 1; transform: scaleX(1.2); } 100% { box-shadow: 0 0 10px rgba(0,240,255,0.2); opacity: 0.5; transform: scaleX(0.8); } }
    .wave-glow { animation: glowingWaves 3s infinite alternate ease-in-out; }
    
    .glow-yellow { box-shadow: 0 0 15px rgba(234, 179, 8, 0.4); border: 1px solid rgba(234, 179, 8, 0.6); }
    @keyframes pulseOrange { 0% { box-shadow: 0 0 10px rgba(249, 115, 22, 0.3); border-color: rgba(249, 115, 22, 0.5); } 50% { box-shadow: 0 0 25px rgba(249, 115, 22, 0.8); border-color: rgba(249, 115, 22, 1); } 100% { box-shadow: 0 0 10px rgba(249, 115, 22, 0.3); border-color: rgba(249, 115, 22, 0.5); } }
    .pulse-orange { animation: pulseOrange 2s infinite ease-in-out; }
    @keyframes blinkRed { 0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(239, 68, 68, 0.9); border-color: #ef4444; } 50% { opacity: 0.8; box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.3); } }
    .blink-red { animation: blinkRed 0.8s infinite; }
    
    .cert-expired { filter: grayscale(0.8); opacity: 0.7; background: rgba(20, 20, 20, 0.8); border: 1px solid #333; }
    
    @keyframes hologramScan { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 0.3; } 100% { transform: translateY(100%); opacity: 0; } }
    .hologram-line { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(to right, transparent, var(--neon-cyan), transparent); animation: hologramScan 2s infinite linear; z-index: 20; }
    
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
  `,
    }}
  />
);

// --- COMPONENTS ---
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const sanitizedUser = sanitizeInput(username);
      if (!sanitizedUser.trim()) {
        setError("Nama Operator tidak boleh kosong.");
        setLoading(false);
        return;
      }

      if (password === "wahyu123") {
        sessionStorage.setItem("jwt_token", "token_pip_dynamic_2026");
        sessionStorage.setItem("user_role", "pip");
        sessionStorage.setItem("user_name", sanitizedUser);
        onLogin({ isAuthenticated: true, role: "pip", name: sanitizedUser });
      } else if (password === "kingocean123") {
        sessionStorage.setItem("jwt_token", "token_crew_dynamic_2026");
        sessionStorage.setItem("user_role", "crew");
        sessionStorage.setItem("user_name", sanitizedUser);
        onLogin({ isAuthenticated: true, role: "crew", name: sanitizedUser });
      } else {
        setError("Kredensial tidak valid.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050A15] p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/20 rounded-full blur-[100px]"></div>
      <div className="glass-panel p-6 md:p-10 rounded-2xl w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <div className="absolute bottom-0 w-20 h-4 bg-cyan-500/30 rounded-[50%] blur-sm wave-glow"></div>
          <div className="relative p-4 md:p-5 bg-cyan-900/30 rounded-full border border-cyan-400/50 shadow-[0_0_25px_rgba(0,240,255,0.3)] ship-anim overflow-hidden backdrop-blur-md">
            <div className="hologram-line"></div>
            <Ship
              size={50}
              className="text-cyan-300 relative z-10"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] tracking-widest mb-1">
          CREW MATRIX SERTIFIKAT
        </h2>
        <p className="text-center text-cyan-500/70 text-xs md:text-sm mb-8 uppercase tracking-widest">
          Enterprise Certificate System
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              NAMA OPERATOR / CREW
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-lg text-sm md:text-base"
                placeholder="Ketik nama Anda..."
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              ENCRYPTED KEY (PASSWORD)
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-lg text-sm md:text-base"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-6 rounded-lg font-black tracking-widest uppercase bg-gradient-to-r from-cyan-600 to-cyan-400 text-[#050A15] hover:from-cyan-400 hover:to-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-cyan-300/50 transition-all duration-300 text-sm md:text-base"
          >
            {loading ? "Memverifikasi..." : "MASUK"}
          </button>
        </form>
      </div>
    </div>
  );
};

const HologramWatermark = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] z-0 overflow-hidden">
    <div className="hologram-line"></div>
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] w-[250px] h-[250px] md:w-[500px] md:h-[500px]"
    >
      <circle
        cx="125"
        cy="80"
        r="28"
        fill="currentColor"
        stroke="none"
        opacity="0.2"
      />
      <circle
        cx="100"
        cy="100"
        r="75"
        strokeWidth="4"
        strokeDasharray="25 15"
        opacity="0.8"
      />
      <line
        x1="100"
        y1="5"
        x2="100"
        y2="25"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="175"
        x2="100"
        y2="195"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="100"
        x2="25"
        y2="100"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="175"
        y1="100"
        x2="195"
        y2="100"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="33"
        x2="47"
        y2="47"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="167"
        y1="167"
        x2="153"
        y2="153"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="167"
        y1="33"
        x2="153"
        y2="47"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="167"
        x2="47"
        y2="153"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="35" r="8" strokeWidth="4" />
      <line x1="100" y1="43" x2="100" y2="165" strokeWidth="6" />
      <line
        x1="75"
        y1="55"
        x2="125"
        y2="55"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 35 125 Q 100 200 165 125"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <polygon
        points="30,120 48,122 38,138"
        fill="currentColor"
        stroke="none"
      />
      <polygon
        points="170,120 152,122 162,138"
        fill="currentColor"
        stroke="none"
      />
      <polygon
        points="100,180 88,162 112,162"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M 50 110 L 85 110 L 85 95 L 95 95 L 95 85 L 105 85 L 105 70 L 115 70 L 115 110 L 150 110 L 130 140 L 70 140 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.9"
      />
      <circle cx="85" cy="102" r="1.5" fill="#050A15" />
      <circle cx="95" cy="102" r="1.5" fill="#050A15" />
      <circle cx="105" cy="102" r="1.5" fill="#050A15" />
      <circle cx="115" cy="102" r="1.5" fill="#050A15" />
      <path
        d="M 40 150 Q 70 135 100 150 T 160 150"
        strokeWidth="3"
        opacity="0.7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 50 160 Q 80 145 100 160 T 150 160"
        strokeWidth="2"
        opacity="0.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  </div>
);

const CertificateModal = ({ isOpen, onClose, onSave, certData, crewId }) => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    issueDate: "",
    expiryDate: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (certData) setFormData(certData);
    else setFormData({ name: "", number: "", issueDate: "", expiryDate: "" });
    setError("");
  }, [certData, isOpen]);

  if (!isOpen) return null;

  const handleNameBlur = () => {
    const typedValue = formData.name.trim().toLowerCase();
    if (CERT_DICTIONARY[typedValue]) {
      setFormData((prev) => ({ ...prev, name: CERT_DICTIONARY[typedValue] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.number ||
      !formData.issueDate ||
      !formData.expiryDate
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
      setError("Tanggal Expired harus lebih besar dari Tanggal Terbit.");
      return;
    }

    let finalName = formData.name.trim();
    if (CERT_DICTIONARY[finalName.toLowerCase()]) {
      finalName = CERT_DICTIONARY[finalName.toLowerCase()];
    }

    onSave({
      ...formData,
      name: sanitizeInput(finalName),
      number: sanitizeInput(formData.number),
      crewId: certData ? certData.crewId : crewId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-5 md:p-6 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
            {certData ? "UPDATE DATA" : "INPUT SERTIFIKAT"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircle size={24} />
          </button>
        </div>
        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-900/30 p-2 rounded border border-red-500/30">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Nama Sertifikat (Ketik singkatan, misal: BST)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onBlur={handleNameBlur}
              className="glass-input w-full p-2.5 rounded-lg text-sm"
              placeholder="Contoh: bst / aff / mfa"
              list="cert-suggestions"
              autoComplete="off"
            />
            <datalist id="cert-suggestions">
              {Object.values(CERT_DICTIONARY).map((fullName, index) => (
                <option key={index} value={fullName} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Nomor Sertifikat
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              className="glass-input w-full p-2.5 rounded-lg text-sm"
              placeholder="Contoh: BST-12345"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
                className="glass-input w-full p-2.5 rounded-lg text-sm [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Tanggal Expired
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="glass-input w-full p-2.5 rounded-lg text-sm [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 rounded-lg text-sm font-bold w-full md:w-auto"
            >
              {certData ? "Simpan" : "Tambahkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout, userRole, userName, fbUser }) => {
  const [crews, setCrews] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCrewId, setSelectedCrewId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputCrewName, setInputCrewName] = useState("");
  const [inputCrewRank, setInputCrewRank] = useState("");
  const [editingCrewId, setEditingCrewId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  useEffect(() => {
    if (!fbUser) return;
    const crewsRef = collection(db, "crews");
    const unsubCrews = onSnapshot(
      crewsRef,
      (snapshot) => {
        const fetchedCrews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCrews(fetchedCrews);
      },
      (error) => console.error("Error fetching crews:", error)
    );

    const certsRef = collection(db, "certificates");
    const unsubCerts = onSnapshot(
      certsRef,
      (snapshot) => {
        const fetchedCerts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCertificates(fetchedCerts);
      },
      (error) => console.error("Error fetching certs:", error)
    );

    return () => {
      unsubCrews();
      unsubCerts();
    };
  }, [fbUser]);

  useEffect(() => {
    if (!selectedCrewId && crews.length > 0) setSelectedCrewId(crews[0].id);
    else if (crews.length === 0) setSelectedCrewId(null);
  }, [crews, selectedCrewId]);

  const selectedCrew = crews.find((c) => c.id === selectedCrewId);
  const crewCerts = certificates.filter((c) => c.crewId === selectedCrew?.id);
  const isPip = userRole === "pip";

  const handleSaveCrew = async (e) => {
    e.preventDefault();
    if (!inputCrewName.trim() || !inputCrewRank.trim() || !fbUser) return;

    const crewData = {
      name: sanitizeInput(inputCrewName),
      rank: sanitizeInput(inputCrewRank),
      status: "Onboard",
    };

    if (editingCrewId) {
      await updateDoc(doc(db, "crews", editingCrewId), crewData);
      setEditingCrewId(null);
    } else {
      const newDocRef = await addDoc(collection(db, "crews"), crewData);
      setSelectedCrewId(newDocRef.id);
    }
    setInputCrewName("");
    setInputCrewRank("");
  };

  const handleStartEditCrew = (crew) => {
    setEditingCrewId(crew.id);
    setInputCrewName(crew.name);
    setInputCrewRank(crew.rank);
  };

  const handleDeleteCrew = async (id) => {
    if (!fbUser) return;
    if (
      window.confirm(
        "Hapus crew ini beserta semua sertifikatnya secara permanen?"
      )
    ) {
      await deleteDoc(doc(db, "crews", id));
      const certsToDelete = certificates.filter((cert) => cert.crewId === id);
      for (const cert of certsToDelete) {
        await deleteDoc(doc(db, "certificates", cert.id));
      }
      if (selectedCrewId === id) setSelectedCrewId(null);
      if (editingCrewId === id) {
        setEditingCrewId(null);
        setInputCrewName("");
        setInputCrewRank("");
      }
    }
  };

  const getExpiryStatus = (expiryDateStr) => {
    const expDate = new Date(expiryDateStr);
    const todayDate = new Date();
    const diffDays = Math.ceil((expDate - todayDate) / (1000 * 60 * 60 * 24));
    const prog = Math.min(100, Math.max(0, (diffDays / 365) * 100));

    if (diffDays <= 0)
      return {
        label: "EXPIRED",
        class: "cert-expired",
        icon: <XCircle size={16} className="text-red-500" />,
        days: diffDays,
        prog: 0,
        color: "text-red-500",
        bg: "bg-red-500/20",
        bar: "bg-red-500",
        action: "DOKUMEN MATI",
      };
    if (diffDays <= 10)
      return {
        label: "CRITICAL",
        class: "blink-red",
        icon: <AlertTriangle size={16} className="text-red-400" />,
        days: diffDays,
        prog,
        color: "text-red-400",
        bg: "bg-red-500/20",
        bar: "bg-red-400",
        action: "PERPANJANG SEGERA",
      };
    if (diffDays <= 20)
      return {
        label: "WARNING",
        class: "pulse-orange",
        icon: <Clock size={16} className="text-orange-400" />,
        days: diffDays,
        prog,
        color: "text-orange-400",
        bg: "bg-orange-500/20",
        bar: "bg-orange-400",
        action: "PROSES SEKARANG",
      };
    if (diffDays <= 30)
      return {
        label: "ATTENTION",
        class: "glow-yellow",
        icon: <Clock size={16} className="text-yellow-400" />,
        days: diffDays,
        prog,
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        bar: "bg-yellow-400",
        action: "SIAPKAN DOKUMEN",
      };
    return {
      label: "VALID",
      class: "border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]",
      icon: <CheckCircle size={16} className="text-green-400" />,
      days: diffDays,
      prog,
      color: "text-green-400",
      bg: "bg-green-500/10",
      bar: "bg-green-400",
      action: "STATUS AMAN",
    };
  };

  const expiredCertsCount = crewCerts.filter(
    (c) => getExpiryStatus(c.expiryDate).days <= 0
  ).length;
  const criticalCertsCount = crewCerts.filter((c) => {
    const d = getExpiryStatus(c.expiryDate).days;
    return d > 0 && d <= 10;
  }).length;

  const handleSaveCert = async (cert) => {
    if (!fbUser) return;
    const certData = { ...cert };
    const certId = certData.id;
    delete certData.id;

    if (certId) {
      await updateDoc(doc(db, "certificates", certId), certData);
    } else {
      await addDoc(collection(db, "certificates"), certData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCert = async (id) => {
    if (!fbUser) return;
    if (window.confirm("Hapus sertifikat ini permanen?")) {
      await deleteDoc(doc(db, "certificates", id));
    }
  };

  return (
    <div className="flex h-screen bg-[#050A15]">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out flex-shrink-0 bg-[#0A1128] border-r border-white/5 shadow-[10px_0_30px_rgba(0,0,0,0.5)] ${
          isSidebarOpen
            ? "translate-x-0 w-80 opacity-100"
            : "-translate-x-full w-80 md:w-0 md:opacity-0 overflow-hidden border-none"
        }`}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
                <div className="absolute inset-0 border-[2px] border-transparent border-t-cyan-400 border-b-cyan-600 rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
                <User
                  size={18}
                  className="text-cyan-200 drop-shadow-[0_0_8px_rgba(0,240,255,1)] relative z-10"
                />
              </div>
              <div className="overflow-hidden flex-1">
                <h1 className="text-sm font-bold text-white tracking-widest uppercase truncate">
                  {selectedCrew ? selectedCrew.name : "CREW MATRIX"}
                </h1>
                <p className="text-[10px] text-cyan-500/70 mt-0.5 uppercase tracking-widest">
                  Active Crew Data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-red-400 bg-white/5 rounded-lg flex-shrink-0 transition-colors"
              >
                <LogOut size={16} />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg md:hidden"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider pl-2">
              Active Roster
            </p>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 pb-4">
              {crews.map((crew) => (
                <div
                  key={crew.id}
                  className={`w-full group/crew relative rounded-xl transition-all duration-300 overflow-hidden border ${
                    selectedCrewId === crew.id
                      ? "bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between p-3 md:p-4 relative">
                    <div
                      onClick={() => setSelectedCrewId(crew.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 relative z-10"
                    >
                      <div
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                          selectedCrewId === crew.id
                            ? "bg-cyan-500 text-slate-900"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {crew.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 truncate">
                        <h3
                          className={`font-semibold text-xs md:text-sm truncate ${
                            selectedCrewId === crew.id
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {crew.name}
                        </h3>
                        <p className="text-[10px] md:text-xs text-gray-500 truncate">
                          {crew.rank}
                        </p>
                      </div>
                    </div>
                    {isPip && (
                      <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover/crew:opacity-100 transition-opacity duration-200 relative z-20 bg-transparent md:bg-gradient-to-l from-[#0A1128] via-[#0A1128] pl-2">
                        <button
                          onClick={() => handleStartEditCrew(crew)}
                          className="p-1.5 md:p-1 text-gray-400 hover:text-cyan-400 transition-colors bg-white/5 md:bg-transparent rounded"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCrew(crew.id)}
                          className="p-1.5 md:p-1 text-gray-400 hover:text-red-400 transition-colors bg-white/5 md:bg-transparent rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {crews.length === 0 && (
                <div className="text-center p-4 text-gray-500 text-sm mt-4 border border-dashed border-gray-700 rounded-lg">
                  Database kosong. <br /> Silakan tambah crew baru.
                </div>
              )}
            </div>
          </div>
          {isPip && (
            <div className="p-4 border-t border-white/5 bg-black/20 pb-6 md:pb-4">
              <p className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider pl-1 flex items-center gap-1">
                <UserPlus size={12} />{" "}
                {editingCrewId ? "Update Data Crew" : "Tambah Crew Baru"}
              </p>
              <form onSubmit={handleSaveCrew} className="space-y-2">
                <input
                  type="text"
                  value={inputCrewName}
                  onChange={(e) => setInputCrewName(e.target.value)}
                  placeholder="Input Nama Crew..."
                  className="glass-input w-full p-2.5 md:p-2 text-xs rounded-lg"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCrewRank}
                    onChange={(e) => setInputCrewRank(e.target.value)}
                    placeholder="Input Pangkat (Rank)..."
                    className="glass-input flex-1 p-2.5 md:p-2 text-xs rounded-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2.5 md:p-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 rounded-lg text-xs font-bold transition-all"
                  >
                    <Plus size={16} />
                  </button>
                  {editingCrewId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCrewId(null);
                        setInputCrewName("");
                        setInputCrewRank("");
                      }}
                      className="p-2.5 md:p-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs transition-all"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 relative bg-[#12121A] overflow-hidden flex flex-col w-full">
        <HologramWatermark />
        <header className="glass-panel px-4 md:px-8 py-4 md:py-6 z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 border-b border-white/5 shadow-md">
          <div className="flex items-start md:items-end gap-3 md:gap-5 w-full">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mt-1 md:mb-1 p-2 bg-white/5 border border-white/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-slate-900 transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)] flex-shrink-0"
            >
              <Menu size={20} className="md:w-6 md:h-6" />
            </button>
            <div className="flex-1 overflow-hidden">
              <h2 className="text-xl md:text-3xl font-light text-white mb-1 md:mb-2 truncate">
                Data Sertifikat:{" "}
                <span className="font-bold text-cyan-400">
                  {selectedCrew?.name || "Tidak ada data"}
                </span>
              </h2>
              {selectedCrew && (
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <User size={12} className="md:w-3.5 md:h-3.5" />{" "}
                    {selectedCrew.rank}
                  </span>
                  <span className="flex items-center gap-1 hidden sm:flex">
                    <Users size={12} className="md:w-3.5 md:h-3.5" /> Status:{" "}
                    {selectedCrew.status}
                  </span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[10px] md:text-xs tracking-wider font-semibold">
                    Operator:{" "}
                    <span className="text-white capitalize">{userName}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          {isPip && selectedCrew && (
            <button
              onClick={() => {
                setEditingCert(null);
                setIsModalOpen(true);
              }}
              className="w-full md:w-auto flex justify-center items-center gap-2 px-5 py-3 md:py-2.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500 hover:text-slate-900 transition-all font-semibold text-xs md:text-sm uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <Plus size={16} /> Add Certificate
            </button>
          )}
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 pb-20 md:pb-8">
          {selectedCrew &&
            (expiredCertsCount > 0 || criticalCertsCount > 0) && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl border flex items-center gap-3 md:gap-4 bg-red-900/20 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] blink-red animate-pulse">
                <div className="p-2 md:p-3 bg-red-500/20 rounded-full flex-shrink-0">
                  <Bell size={20} className="text-red-400 md:w-6 md:h-6" />
                </div>
                <div>
                  <h4 className="text-red-400 font-bold text-xs md:text-sm tracking-wider uppercase">
                    Peringatan Sistem
                  </h4>
                  <p className="text-gray-300 text-[10px] md:text-sm mt-0.5 leading-tight md:leading-normal">
                    Ada{" "}
                    <span className="font-bold text-white">
                      {expiredCertsCount} dokumen mati
                    </span>{" "}
                    dan{" "}
                    <span className="font-bold text-white">
                      {criticalCertsCount} dokumen kritis (≤10 Hari)
                    </span>
                    . Segera periksa!
                  </p>
                </div>
              </div>
            )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {crewCerts.map((cert) => {
              const status = getExpiryStatus(cert.expiryDate);
              const isExpired = status.days <= 0;
              return (
                <div
                  key={cert.id}
                  className={`glass-panel rounded-xl p-4 md:p-5 border relative overflow-hidden transition-all duration-500 ${status.class}`}
                >
                  {isExpired && (
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-600/50 transform -translate-y-1/2 -rotate-12 pointer-events-none z-20"></div>
                  )}
                  <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="p-2 md:p-2.5 bg-white/5 rounded-lg border border-white/10 flex-shrink-0">
                        <FileText
                          size={18}
                          className="text-gray-300 md:w-5 md:h-5"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs md:text-sm leading-tight md:pr-4">
                          {cert.name}
                        </h4>
                        <p className="text-[10px] md:text-xs text-gray-500 font-mono mt-0.5">
                          {cert.number}
                        </p>
                      </div>
                    </div>
                    {isPip && (
                      <div className="flex gap-1 md:gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingCert(cert);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-cyan-400 bg-white/5 md:bg-black/20 rounded-md"
                        >
                          <Edit2 size={12} className="md:w-3.5 md:h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCert(cert.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 md:bg-black/20 rounded-md"
                        >
                          <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 md:space-y-2 mt-3 md:mt-4 text-xs md:text-sm relative z-10 bg-black/20 p-2.5 md:p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[10px] md:text-xs">
                        Terbit
                      </span>
                      <span className="text-gray-300 font-mono text-[10px] md:text-xs">
                        {cert.issueDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[10px] md:text-xs">
                        Kedaluwarsa
                      </span>
                      <span
                        className={`${
                          isExpired ? "text-red-500" : "text-gray-300"
                        } font-mono text-[10px] md:text-xs font-bold`}
                      >
                        {cert.expiryDate}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10 relative z-10">
                    <div className="w-full h-1 md:h-1.5 bg-black/60 rounded-full mb-2 md:mb-3 overflow-hidden border border-white/5 relative">
                      <div
                        className={`absolute top-0 left-0 h-full ${status.bar} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`}
                        style={{ width: `${status.prog}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div
                        className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md ${status.bg} border border-white/10 shadow-inner`}
                      >
                        <div className="scale-75 md:scale-100">
                          {status.icon}
                        </div>
                        <span
                          className={`text-[9px] md:text-[11px] font-black tracking-widest uppercase ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-xs md:text-sm font-mono font-bold tracking-wider ${
                            isExpired ? "text-red-500" : "text-white"
                          }`}
                        >
                          {isExpired ? "0 HARI" : `${status.days} HARI`}
                        </span>
                        <span
                          className={`text-[8px] md:text-[9px] uppercase tracking-widest font-bold ${status.color} opacity-80 md:mt-0.5`}
                        >
                          {status.action}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {crews.length > 0 && crewCerts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 md:p-12 glass-panel rounded-xl border-dashed border-gray-600">
                <FileText
                  size={36}
                  className="text-gray-600 mb-3 md:w-12 md:h-12 md:mb-4"
                />
                <p className="text-gray-400 text-xs md:text-sm text-center">
                  Tidak ada sertifikat untuk crew ini.
                </p>
              </div>
            )}
            {crews.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 md:p-12 glass-panel rounded-xl border-dashed border-gray-600">
                <Users
                  size={36}
                  className="text-gray-600 mb-3 md:w-12 md:h-12 md:mb-4"
                />
                <p className="text-gray-400 text-xs md:text-sm text-center px-4">
                  Belum ada crew yang didaftarkan.{" "}
                  <br className="hidden md:block" /> Silakan tambah crew baru di
                  menu.
                </p>
              </div>
            )}
          </div>
        </div>
        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCert}
          certData={editingCert}
          crewId={selectedCrewId}
        />
      </main>
    </div>
  );
};

export default function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    name: "",
  });
  const [fbUser, setFbUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(authFirebase, __initial_auth_token);
      } else {
        await signInAnonymously(authFirebase);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(authFirebase, setFbUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token");
    const role = sessionStorage.getItem("user_role");
    const name = sessionStorage.getItem("user_name");
    if (token && role && name)
      setAuth({ isAuthenticated: true, role: role, name: name });
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("user_name");
    setAuth({ isAuthenticated: false, role: null, name: "" });
  };

  return (
    <>
      <CustomStyles />
      {!auth.isAuthenticated ? (
        <LoginPage onLogin={setAuth} />
      ) : (
        <Dashboard
          onLogout={handleLogout}
          userRole={auth.role}
          userName={auth.name}
          fbUser={fbUser}
        />
      )}
    </>
  );
}
