import React, { useState, useEffect } from "react";
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

// --- CUSTOM INLINE ICON COMPONENT (Replaces lucide-react to fix bundling errors) ---
const Icon = ({ name, size = 24, className = "", strokeWidth = 2, title }) => {
  const icons = {
    Lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    User: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    Users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    FileText: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></>,
    AlertTriangle: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    Plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    Edit2: <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></>,
    Trash2: <><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>,
    LogOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    CheckCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    Clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    XCircle: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
    Ship: <><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/></>,
    UserPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>,
    Bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    Menu: <><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></>,
    X: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    ChevronUp: <><polyline points="18 15 12 9 6 15"/></>,
    ChevronDown: <><polyline points="6 9 12 15 18 9"/></>,
    ChevronLeft: <><path d="m15 18-6-6 6-6"/></>,
    ChevronRight: <><path d="m9 18 6-6-6-6"/></>,
    ChevronsUp: <><path d="m17 11-5-5-5 5"/><path d="m17 18-5-5-5 5"/></>,
    ChevronsDown: <><path d="m7 15 5 5 5-5"/><path d="m7 8 5 5 5-5"/></>,
    Home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    PieChart: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></>,
    Activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    Search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    Grid: <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>,
    Download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {title && <title>{title}</title>}
      {icons[name] || null}
    </svg>
  );
};

// --- SETUP FIREBASE ---
const defaultFirebaseConfig = {
  apiKey: "AIzaSyBtX0Yu4gA8KUseT2SIRqoHAVBvpJLzb-M",
  authDomain: "crew-matrix-app.firebaseapp.com",
  projectId: "crew-matrix-app",
  storageBucket: "crew-matrix-app.firebasestorage.app",
  messagingSenderId: "383886678503",
  appId: "1:383886678503:web:741913d8c4ba67ce630542",
  measurementId: "G-4CTVL1WNBC",
};

// eslint-disable-next-line no-undef
const firebaseConfig = typeof __firebase_config !== "undefined"
  // eslint-disable-next-line no-undef
  ? JSON.parse(__firebase_config)
  : defaultFirebaseConfig;

const app = initializeApp(firebaseConfig);
const authFirebase = getAuth(app);
const db = getFirestore(app);

// eslint-disable-next-line no-undef
const appId = typeof __app_id !== 'undefined' ? __app_id : 'crew-matrix-default';

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
  mcu: "Medical Check-Up (MCU)",
  sb: "Seaman Book (Buku Pelaut)",
  radar: "Radar Observer / Simulator (RADAR)",
  arpa: "Automatic Radar Plotting Aids (ARPA)",
  ecdis: "Electronic Chart Display and Information System (ECDIS)",
  gmdss: "Global Maritime Distress and Safety System (GMDSS)",
  oru: "Operator Radio Umum (ORU)",
  imdg: "International Maritime Dangerous Goods (IMDG)",
  ismc: "International Safety Management Code (ISM Code)",
  endorse: "Certificate of Endorsement (COE / Endorse)",
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
    :root { --bg-dark: #050A15; --bg-navy: #0A1128; --panel-glass: rgba(255, 255, 255, 0.04); --neon-cyan: #00F0FF; }
    body { background-color: var(--bg-dark); color: #E2E8F0; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
    .glass-panel { background: var(--panel-glass); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); }
    .glass-input { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.1); color: white; transition: all 0.3s ease; }
    .glass-input:focus { border-color: var(--neon-cyan); box-shadow: 0 0 10px var(--neon-cyan); outline: none; }
    
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
    
    /* ANIMASI MARQUEE (Berjalan Agak Pelan) */
    .marquee-container { overflow: hidden; white-space: nowrap; position: relative; mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }
    .marquee-text { display: inline-block; padding-left: 100%; animation: scrollMarquee 25s linear infinite; }
    @keyframes scrollMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }

    /* ANIMASI FADE IN */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
    
    /* CUSTOM SCROLLBAR UTK MATRIX/TABLE */
    .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.3); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,240,255,0.6); }

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
            <Icon name="Ship" size={50} className="text-cyan-300 relative z-10" strokeWidth={1.5} />
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
            <Icon name="AlertTriangle" size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              NAMA OPERATOR / CREW
            </label>
            <div className="relative">
              <Icon name="User" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
              <Icon name="Lock" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
      style={{ color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 8px var(--neon-cyan))' }}
      className="w-[250px] h-[250px] md:w-[500px] md:h-[500px]"
    >
      <circle cx="125" cy="80" r="28" fill="currentColor" stroke="none" opacity="0.2" />
      <circle cx="100" cy="100" r="75" strokeWidth="4" strokeDasharray="25 15" opacity="0.8" />
      <line x1="100" y1="5" x2="100" y2="25" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="175" x2="100" y2="195" strokeWidth="5" strokeLinecap="round" />
      <line x1="5" y1="100" x2="25" y2="100" strokeWidth="5" strokeLinecap="round" />
      <line x1="175" y1="100" x2="195" y2="100" strokeWidth="5" strokeLinecap="round" />
      <line x1="33" y1="33" x2="47" y2="47" strokeWidth="5" strokeLinecap="round" />
      <line x1="167" y1="167" x2="153" y2="153" strokeWidth="5" strokeLinecap="round" />
      <line x1="167" y1="33" x2="153" y2="47" strokeWidth="5" strokeLinecap="round" />
      <line x1="33" y1="167" x2="47" y2="153" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="35" r="8" strokeWidth="4" />
      <line x1="100" y1="43" x2="100" y2="165" strokeWidth="6" />
      <line x1="75" y1="55" x2="125" y2="55" strokeWidth="5" strokeLinecap="round" />
      <path d="M 35 125 Q 100 200 165 125" strokeWidth="6" strokeLinecap="round" />
      <polygon points="30,120 48,122 38,138" fill="currentColor" stroke="none" />
      <polygon points="170,120 152,122 162,138" fill="currentColor" stroke="none" />
      <polygon points="100,180 88,162 112,162" fill="currentColor" stroke="none" />
      <path d="M 50 110 L 85 110 L 85 95 L 95 95 L 95 85 L 105 85 L 105 70 L 115 70 L 115 110 L 150 110 L 130 140 L 70 140 Z" fill="currentColor" stroke="none" opacity="0.9" />
      <circle cx="85" cy="102" r="1.5" fill="#050A15" />
      <circle cx="95" cy="102" r="1.5" fill="#050A15" />
      <circle cx="105" cy="102" r="1.5" fill="#050A15" />
      <circle cx="115" cy="102" r="1.5" fill="#050A15" />
      <path d="M 40 150 Q 70 135 100 150 T 160 150" strokeWidth="3" opacity="0.7" strokeLinecap="round" fill="none" />
      <path d="M 50 160 Q 80 145 100 160 T 150 160" strokeWidth="2" opacity="0.4" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-red-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 blink-red">
            <Icon name="AlertTriangle" size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-400 mb-8">{message}</p>
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--neon-cyan), transparent)' }}></div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
            {certData ? "UPDATE DATA" : "INPUT SERTIFIKAT"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="XCircle" size={24} />
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
              className="px-6 py-2 bg-black/40 hover:bg-black/60 text-white border rounded-lg text-sm font-bold w-full md:w-auto"
              style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
            >
              {certData ? "Simpan" : "Tambahkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MARINE_THEMES = {
  cyan: { main: "text-cyan-400", bgLight: "bg-cyan-500/10", border: "border-cyan-500/20", borderSoft: "border-cyan-500/50", glow: "shadow-[0_0_15px_rgba(0,240,255,0.2)]", hex: "#00F0FF", ring: "ring-cyan-400" },
  emerald: { main: "text-emerald-400", bgLight: "bg-emerald-500/10", border: "border-emerald-500/20", borderSoft: "border-emerald-500/50", glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]", hex: "#10b981", ring: "ring-emerald-400" },
  amber: { main: "text-amber-400", bgLight: "bg-amber-500/10", border: "border-amber-500/20", borderSoft: "border-amber-500/50", glow: "shadow-[0_0_15px_rgba(251,191,36,0.2)]", hex: "#fbbf24", ring: "ring-amber-400" }
};

const Dashboard = ({ onLogout, userRole, userName, fbUser }) => {
  const [activeTheme, setActiveTheme] = useState('cyan');
  const theme = MARINE_THEMES[activeTheme];

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [currentView, setCurrentView] = useState("overview"); 
  const [crews, setCrews] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCrewId, setSelectedCrewId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputCrewName, setInputCrewName] = useState("");
  const [inputCrewRank, setInputCrewRank] = useState("");
  const [editingCrewId, setEditingCrewId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  
  // State untuk Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Custom Confirm Action State to replace window.confirm
  const [confirmAction, setConfirmAction] = useState({
    isOpen: false,
    message: "",
    action: null
  });

  const sortedCrews = [...crews].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999;
    const orderB = b.order !== undefined ? b.order : 999999;
    return orderA - orderB;
  });

  // Fungsi untuk mendapatkan status kedaluwarsa dokumen
  const getExpiryStatus = (expiryDateStr) => {
    const expDate = new Date(expiryDateStr);
    const todayDate = new Date();
    const diffDays = Math.ceil((expDate - todayDate) / (1000 * 60 * 60 * 24));
    const prog = Math.min(100, Math.max(0, (diffDays / 365) * 100));

    // Menghitung sisa bulan untuk teks notifikasi berjalan
    const monthsLeft = Math.floor(diffDays / 30);
    let message = "";
    if (diffDays <= 0) {
      message = "SERTIFIKAT KEDALUWARSA - DOKUMEN MATI";
    } else if (monthsLeft < 1) {
      message = "SISA WAKTU KURANG DARI 1 BULAN";
    } else {
      message = `SISA WAKTU: ${monthsLeft} BULAN`;
    }

    if (diffDays <= 0)
      return {
        label: "EXPIRED",
        class: "cert-expired",
        icon: <Icon name="XCircle" size={16} className="text-red-500" />,
        days: diffDays,
        prog: 0,
        color: "text-red-500",
        bg: "bg-red-500/20",
        bar: "bg-red-500",
        action: "DOKUMEN MATI",
        message: message,
      };
    if (diffDays <= 10)
      return {
        label: "CRITICAL",
        class: "blink-red bg-red-950/30",
        icon: <Icon name="AlertTriangle" size={16} className="text-red-400" />,
        days: diffDays,
        prog,
        color: "text-red-400",
        bg: "bg-red-500/20",
        bar: "bg-red-400",
        action: "PERPANJANG SEGERA",
        message: message,
      };
    if (diffDays <= 20)
      return {
        label: "WARNING",
        class: "pulse-orange bg-orange-950/30",
        icon: <Icon name="Clock" size={16} className="text-orange-400" />,
        days: diffDays,
        prog,
        color: "text-orange-400",
        bg: "bg-orange-500/20",
        bar: "bg-orange-400",
        action: "PROSES SEKARANG",
        message: message,
      };
    if (diffDays <= 30)
      return {
        label: "ATTENTION",
        class: "glow-yellow bg-yellow-950/20",
        icon: <Icon name="Clock" size={16} className="text-yellow-400" />,
        days: diffDays,
        prog,
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        bar: "bg-yellow-400",
        action: "SIAPKAN DOKUMEN",
        message: message,
      };
    return {
      label: "VALID",
      class: "border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] bg-green-950/20",
      icon: <Icon name="CheckCircle" size={16} className="text-green-400" />,
      days: diffDays,
      prog,
      color: "text-green-400",
      bg: "bg-green-500/10",
      bar: "bg-green-400",
      action: "STATUS AMAN",
      message: message,
    };
  };

  // Penerapan Derived State untuk Pencarian dan Filter
  const filteredCrews = sortedCrews.filter((crew) => {
    // 1. Pencarian berdasarkan nama
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Filter berdasarkan status
    if (filterStatus === "all") return true;

    // Cari semua sertifikat untuk crew ini
    const crewCertsForFilter = certificates.filter((c) => c.crewId === crew.id);
    
    if (filterStatus === "expired") {
      // Ada minimal 1 sertifikat expired
      return crewCertsForFilter.some((cert) => getExpiryStatus(cert.expiryDate).days <= 0);
    }
    
    if (filterStatus === "critical") {
      // Ada minimal 1 sertifikat kritis (1 - 30 hari)
      return crewCertsForFilter.some((cert) => {
        const days = getExpiryStatus(cert.expiryDate).days;
        return days > 0 && days <= 30; // Termasuk warning (1-30 hari) karena kritis/peringatan
      });
    }

    return true;
  });

  useEffect(() => {
    if (!fbUser) return;
    
    const crewsRef = collection(db, 'artifacts', appId, 'public', 'data', 'crews');
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

    const certsRef = collection(db, 'artifacts', appId, 'public', 'data', 'certificates');
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
    // Only auto-select a crew if we are currently viewing "crew" layout but none is selected
    if (currentView === "crew" && !selectedCrewId && crews.length > 0) {
      setSelectedCrewId(crews[0].id);
    }
  }, [crews, selectedCrewId, currentView]);

  const selectedCrew = crews.find((c) => c.id === selectedCrewId);
  const crewCerts = selectedCrewId ? certificates.filter((c) => c.crewId === selectedCrew?.id) : [];
  const sortedCrewCerts = [...crewCerts].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999;
    const orderB = b.order !== undefined ? b.order : 999999;
    return orderA - orderB;
  });
  const isPip = userRole === "pip";

  const handleSaveCrew = async (e) => {
    e.preventDefault();
    if (!inputCrewName.trim() || !inputCrewRank.trim() || !fbUser) return;

    const newOrder = crews.length > 0 ? Math.max(...crews.map(c => c.order !== undefined ? c.order : 0)) + 1 : 0;

    const crewData = {
      name: sanitizeInput(inputCrewName),
      rank: sanitizeInput(inputCrewRank),
      status: "Onboard",
      order: newOrder,
    };

    if (editingCrewId) {
      const existingCrew = crews.find(c => c.id === editingCrewId);
      if (existingCrew && existingCrew.order !== undefined) {
        crewData.order = existingCrew.order;
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crews', editingCrewId), crewData);
      setEditingCrewId(null);
    } else {
      const newDocRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'crews'), crewData);
      setSelectedCrewId(newDocRef.id);
      setCurrentView("crew");
    }
    setInputCrewName("");
    setInputCrewRank("");
  };

  const handleMoveCrew = async (index, direction) => {
    if (!fbUser) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= filteredCrews.length) return;

    const current = filteredCrews[index];
    const target = filteredCrews[newIndex];

    const currentOrderSafe = current.order !== undefined ? current.order : index;
    const targetOrderSafe = target.order !== undefined ? target.order : newIndex;

    let newCurrentOrder = targetOrderSafe;
    let newTargetOrder = currentOrderSafe;

    if (newCurrentOrder === newTargetOrder) {
      newCurrentOrder = index + direction;
      newTargetOrder = index;
    }

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crews', current.id), { order: newCurrentOrder });
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crews', target.id), { order: newTargetOrder });
  };

  const handleStartEditCrew = (crew) => {
    setEditingCrewId(crew.id);
    setInputCrewName(crew.name);
    setInputCrewRank(crew.rank);
  };

  const handleDeleteCrew = (id) => {
    if (!fbUser) return;
    setConfirmAction({
      isOpen: true,
      message: "Yakin ingin menghapus crew ini beserta semua sertifikatnya secara permanen?",
      action: async () => {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crews', id));
        const certsToDelete = certificates.filter((cert) => cert.crewId === id);
        for (const cert of certsToDelete) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', cert.id));
        }
        if (selectedCrewId === id) {
          setSelectedCrewId(null);
          setCurrentView("overview");
        }
        if (editingCrewId === id) {
          setEditingCrewId(null);
          setInputCrewName("");
          setInputCrewRank("");
        }
      }
    });
  };

  // Kalkulasi statistik global untuk Overview Dashboard
  const getGlobalStats = () => {
    let expired = 0;
    let critical = 0;
    let valid = 0;

    certificates.forEach(cert => {
      const status = getExpiryStatus(cert.expiryDate);
      if (status.days <= 0) expired++;
      else if (status.days <= 30) critical++;
      else valid++;
    });

    return { totalCrews: crews.length, expired, critical, valid };
  };
  const globalStats = getGlobalStats();

  const expiredCertsCount = crewCerts.filter(
    (c) => getExpiryStatus(c.expiryDate).days <= 0
  ).length;
  const criticalCertsCount = crewCerts.filter((c) => {
    const d = getExpiryStatus(c.expiryDate).days;
    return d > 0 && d <= 30;
  }).length;

  const handleSaveCert = async (cert) => {
    if (!fbUser) return;
    const certData = { ...cert };
    const certId = certData.id;
    delete certData.id;

    if (certId) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', certId), certData);
    } else {
      const newOrder = crewCerts.length > 0 ? Math.max(...crewCerts.map(c => c.order !== undefined ? c.order : 0)) + 1 : 0;
      certData.order = newOrder;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'certificates'), certData);
    }
    setIsModalOpen(false);
  };

  const handleMoveCert = async (index, direction) => {
    if (!fbUser) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sortedCrewCerts.length) return;

    const current = sortedCrewCerts[index];
    const target = sortedCrewCerts[newIndex];

    const currentOrderSafe = current.order !== undefined ? current.order : index;
    const targetOrderSafe = target.order !== undefined ? target.order : newIndex;

    let newCurrentOrder = targetOrderSafe;
    let newTargetOrder = currentOrderSafe;

    if (newCurrentOrder === newTargetOrder) {
      newCurrentOrder = index + direction;
      newTargetOrder = index;
    }

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', current.id), { order: newCurrentOrder });
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', target.id), { order: newTargetOrder });
  };

  const handleJumpCert = async (cert, target) => {
    if (!fbUser || sortedCrewCerts.length <= 1) return;
    let newOrder;
    if (target === "top") {
      newOrder = (sortedCrewCerts[0].order !== undefined ? sortedCrewCerts[0].order : 0) - 1;
    } else if (target === "bottom") {
      const lastItem = sortedCrewCerts[sortedCrewCerts.length - 1];
      newOrder = (lastItem.order !== undefined ? lastItem.order : sortedCrewCerts.length) + 1;
    }
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', cert.id), { order: newOrder });
  };

  const handleDeleteCert = (id) => {
    if (!fbUser) return;
    setConfirmAction({
      isOpen: true,
      message: "Yakin ingin menghapus sertifikat ini secara permanen?",
      action: async () => {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', id));
      }
    });
  };

  const executeConfirmAction = async () => {
    if (confirmAction.action) {
      await confirmAction.action();
    }
    setConfirmAction({ isOpen: false, message: "", action: null });
  };

  const exportToCSV = () => {
    const certKeys = Object.keys(CERT_DICTIONARY);
    
    // Menggunakan titik koma (;) sebagai separator utama
    let csvContent = "Nama Crew;Rank;Status;" + certKeys.map(k => CERT_DICTIONARY[k].replace(/;/g, "")).join(";") + "\n";

    filteredCrews.forEach(crew => {
      // Membungkus data dengan kutip dan dipisah titik koma
      let row = `"${crew.name}";"${crew.rank}";"${crew.status}"`;
      const crewDocs = certificates.filter(c => c.crewId === crew.id);

      certKeys.forEach(key => {
        const expectedName = CERT_DICTIONARY[key].toLowerCase();
        const foundCert = crewDocs.find(c => c.name.toLowerCase() === expectedName);
        if (foundCert) {
          const status = getExpiryStatus(foundCert.expiryDate);
          row += `;"${status.label} (${status.days > 0 ? status.days + ' Hari' : '0 Hari'})"`;
        } else {
          row += `;"-"`;
        }
      });
      csvContent += row + "\n";
    });

    // Proses Download menggunakan Blob murni browser
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Crew_Matrix_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Komponen Halaman Overview Dashboard
  const renderOverviewDashboard = () => {
    const { totalCrews, expired, critical, valid } = globalStats;
    const totalCerts = expired + critical + valid;
    
    // Perhitungan persentase untuk proporsi stroke pie chart (Total panjang stroke = 100)
    const validPct = totalCerts === 0 ? 0 : (valid / totalCerts) * 100;
    const criticalPct = totalCerts === 0 ? 0 : (critical / totalCerts) * 100;
    const expiredPct = totalCerts === 0 ? 0 : (expired / totalCerts) * 100;

    return (
      <div className="space-y-6 md:space-y-8 animate-fadeIn w-full max-w-6xl mx-auto">
        
        {/* Row 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`glass-panel p-5 rounded-xl border flex flex-col gap-2 relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${theme.borderSoft}`}>
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl ${theme.bgLight}`}></div>
            <div className={`flex items-center gap-3 ${theme.main}`}>
              <Icon name="Users" size={20} />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Total Crew</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{totalCrews}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Crew Aktif Onboard</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-green-500/30 flex flex-col gap-2 relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 text-green-400">
              <Icon name="CheckCircle" size={20} />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Dokumen Valid</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{valid}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Sisa Waktu &gt; 30 Hari</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-yellow-500/30 flex flex-col gap-2 relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 text-yellow-400">
              <Icon name="AlertTriangle" size={20} />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Dokumen Kritis</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{critical}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Sisa Waktu 1 - 30 Hari</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-red-500/30 flex flex-col gap-2 relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 text-red-400">
              <Icon name="XCircle" size={20} />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Kedaluwarsa</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{expired}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Sisa Waktu &le; 0 Hari</p>
          </div>
        </div>

        {/* Row 2: Visual Chart & Details */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="w-56 h-56 md:w-64 md:h-64 relative flex-shrink-0">
            {/* SVG Pie Chart */}
            <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90" style={{ filter: `drop-shadow(0 0 15px ${theme.hex}25)` }}>
              {/* Background Circle */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="5"></circle>
              {totalCerts > 0 && (
                <>
                  {/* Valid Segment */}
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4ade80" strokeWidth="5" strokeDasharray={`${validPct} ${100 - validPct}`} strokeDashoffset="0" className="transition-all duration-1000 ease-out"></circle>
                  {/* Critical Segment */}
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#facc15" strokeWidth="5" strokeDasharray={`${criticalPct} ${100 - criticalPct}`} strokeDashoffset={`-${validPct}`} className="transition-all duration-1000 ease-out"></circle>
                  {/* Expired Segment */}
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f87171" strokeWidth="5" strokeDasharray={`${expiredPct} ${100 - expiredPct}`} strokeDashoffset={`-${validPct + criticalPct}`} className="transition-all duration-1000 ease-out"></circle>
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Icon name="PieChart" className="mb-1" size={24} style={{ color: theme.hex, opacity: 0.5 }} />
              <span className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{totalCerts}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Total Sertifikat</span>
            </div>
          </div>

          <div className="flex-1 space-y-5 w-full">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Icon name="Activity" className={`${theme.main}`} size={20} /> Rasio Status Dokumen Global
              </h3>
              <p className="text-xs text-gray-400 mt-1">Distribusi kesehatan seluruh dokumen sertifikat awak kapal.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
                  <span className="text-sm font-semibold text-green-100">Status Valid (&gt; 30 Hari)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-green-400 font-mono">{validPct.toFixed(1)}%</span>
                  <span className="font-bold text-white text-lg w-8 text-right">{valid}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]"></div>
                  <span className="text-sm font-semibold text-yellow-100">Status Kritis (1 - 30 Hari)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-yellow-400 font-mono">{criticalPct.toFixed(1)}%</span>
                  <span className="font-bold text-white text-lg w-8 text-right">{critical}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]"></div>
                  <span className="text-sm font-semibold text-red-100">Kedaluwarsa (&le; 0 Hari)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-red-400 font-mono">{expiredPct.toFixed(1)}%</span>
                  <span className="font-bold text-white text-lg w-8 text-right">{expired}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Komponen Real Crew Matrix (2D Grid Table)
  const renderMatrixView = () => {
    // Mengambil keys dari CERT_DICTIONARY HANYA JIKA dokumennya dimiliki oleh minimal 1 crew di tabel
    const activeCertKeys = Object.keys(CERT_DICTIONARY).filter(key => {
      const expectedName = CERT_DICTIONARY[key].toLowerCase();
      return filteredCrews.some(crew => {
        const crewDocs = certificates.filter(c => c.crewId === crew.id);
        return crewDocs.some(c => c.name.toLowerCase() === expectedName);
      });
    });

    return (
      <div className="w-full h-full animate-fadeIn flex flex-col">
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden flex-1 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Icon name="Grid" className={`${theme.main}`} size={20} /> Real Crew Matrix
            </h3>
            <p className="text-xs text-gray-400 hidden sm:block">Status dokumen per kru secara keseluruhan</p>
          </div>
          
          <div className="overflow-x-auto flex-1 custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-30 bg-[#0A1128] border-b border-white/10 shadow-md">
                <tr>
                  <th className={`sticky left-0 top-0 z-40 bg-[#0A1128] p-3 md:p-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.3)] ${theme.main}`}>
                    Nama Crew & Rank
                  </th>
                  {activeCertKeys.map(key => (
                    <th 
                      key={key} 
                      className="p-3 text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap text-center border-x border-white/5"
                      title={CERT_DICTIONARY[key]}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCrews.map(crew => {
                  const crewDocs = certificates.filter(c => c.crewId === crew.id);
                  return (
                    <tr key={crew.id} className="hover:bg-white/5 transition-colors group">
                      <td className="sticky left-0 z-20 bg-[#050A15] p-3 md:p-4 border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.2)] group-hover:bg-[#0A1128] transition-colors">
                        <div className="font-semibold text-white text-xs md:text-sm whitespace-nowrap truncate max-w-[150px] md:max-w-[200px]" title={crew.name}>
                          {crew.name}
                        </div>
                        <div className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap mt-0.5">
                          {crew.rank}
                        </div>
                      </td>
                      {activeCertKeys.map(key => {
                        const expectedName = CERT_DICTIONARY[key];
                        // Pencocokan dokumen dari data kru dengan nama sertifikat lengkap
                        const foundCert = crewDocs.find(c => c.name.toLowerCase() === expectedName.toLowerCase());
                        
                        if (foundCert) {
                          const status = getExpiryStatus(foundCert.expiryDate);
                          return (
                            <td key={key} className="p-2 text-center border-x border-white/5 relative z-10">
                              <div 
                                title={`${expectedName}\nStatus: ${status.label}\nSisa: ${status.days > 0 ? status.days + ' Hari' : 'Kedaluwarsa'}`}
                                className={`mx-auto w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center cursor-help transition-all hover:scale-110 ${status.bg} border border-white/10`}
                              >
                                <div className="scale-75 md:scale-100">{status.icon}</div>
                              </div>
                            </td>
                          );
                        }
                        
                        // Jika tidak punya dokumen tersebut
                        return (
                          <td key={key} className="p-2 text-center border-x border-white/5 relative z-10">
                            <div 
                              title={`${expectedName} (Kosong)`}
                              className="mx-auto w-6 h-6 md:w-8 md:h-8 rounded bg-white/5 flex items-center justify-center"
                            >
                              <span className="text-gray-600/50 text-xs">-</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {filteredCrews.length === 0 && (
                  <tr>
                    <td colSpan={activeCertKeys.length + 1} className="p-8 text-center text-gray-500 text-sm">
                      {crews.length === 0 ? "Database kosong. Silakan tambah crew." : "Tidak ada crew yang sesuai filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#050A15]">
      {/* Overriding the neon-cyan CSS variable dynamically globally */}
      <style>{`:root { --neon-cyan: ${theme.hex}; }`}</style>
      
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out flex-shrink-0 bg-[#1c1d21] rounded-r-[30px] md:rounded-none md:border-r md:border-white/5 overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.5)] ${
          isSidebarOpen
            ? "translate-x-0 w-80 opacity-100"
            : "-translate-x-full w-80 md:w-0 md:opacity-0 border-none"
        }`}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden group cursor-default">
              {/* Ikon Box Logo Dinamis */}
              <div className={`relative flex items-center justify-center w-10 h-10 flex-shrink-0 bg-[#0A1128] ${theme.bgLight} border ${theme.borderSoft} rounded-xl ${theme.glow} group-hover:shadow-lg transition-all duration-300 overflow-hidden`}>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Icon
                  name="Ship"
                  size={20} 
                  className={`${theme.main} relative z-10 transform group-hover:scale-110 transition-transform duration-300`} 
                  strokeWidth={1.5}
                  style={{ filter: `drop-shadow(0 0 5px ${theme.hex}cc)` }}
                />
              </div>
              
              {/* Teks Logo Dinamis */}
              <div className="overflow-hidden flex-1">
                <h1 
                  className="text-sm font-black text-transparent bg-clip-text tracking-widest uppercase truncate drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                  style={{ backgroundImage: `linear-gradient(to right, ${theme.hex}, #60a5fa)` }}
                >
                  CREW MATRIX
                </h1>
                <p className="text-[9px] mt-0.5 uppercase tracking-[0.2em] font-semibold truncate" style={{ color: theme.hex, opacity: 0.7 }}>
                  Enterprise Edition
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-400 bg-white/5 rounded-lg flex-shrink-0 transition-colors"
                title="Logout"
              >
                <Icon name="LogOut" size={16} />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg md:hidden"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider pl-2">
              Main Menu
            </p>
            
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 pb-4">
              {/* Tombol Home / Overview */}
              <div
                onClick={() => {
                  setCurrentView("overview");
                  setSelectedCrewId(null);
                }}
                className={`w-full group/crew relative rounded-xl transition-all duration-300 overflow-hidden border cursor-pointer ${
                  currentView === "overview"
                    ? `bg-black/20 ${theme.borderSoft} ${theme.glow}`
                    : "bg-[#fefce8]/5 border-transparent hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 p-3 md:p-3.5">
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                      currentView === "overview"
                        ? `${theme.bgLight} ${theme.main} ${theme.glow}`
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    <Icon name="Home" size={18} />
                  </div>
                  <div className="flex-1 truncate">
                    <h3
                      className={`font-semibold text-xs md:text-sm truncate ${
                        currentView === "overview"
                          ? theme.main
                          : "text-gray-300"
                      }`}
                    >
                      Overview Dashboard
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-gray-500 truncate mt-0.5">
                      Ringkasan Status Global
                    </p>
                  </div>
                </div>
              </div>

              {/* Tombol Matrix View */}
              <div
                onClick={() => {
                  setCurrentView("matrix");
                  setSelectedCrewId(null);
                }}
                className={`w-full group/crew relative rounded-xl transition-all duration-300 overflow-hidden border mb-4 cursor-pointer ${
                  currentView === "matrix"
                    ? `bg-black/20 ${theme.borderSoft} ${theme.glow}`
                    : "bg-[#fefce8]/5 border-transparent hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 p-3 md:p-3.5">
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                      currentView === "matrix"
                        ? `${theme.bgLight} ${theme.main} ${theme.glow}`
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    <Icon name="Grid" size={18} />
                  </div>
                  <div className="flex-1 truncate">
                    <h3
                      className={`font-semibold text-xs md:text-sm truncate ${
                        currentView === "matrix"
                          ? theme.main
                          : "text-gray-300"
                      }`}
                    >
                      Matrix View
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-gray-500 truncate mt-0.5">
                      Tabel Grid Data Lengkap
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 mb-2">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider pl-2">
                  Active Crews
                </p>
                {/* Search & Sort Panel */}
                <div className="mb-3 space-y-2">
                  <div className="relative">
                    <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Cari crew..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="glass-input w-full pl-8 pr-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button 
                       onClick={() => setFilterStatus("all")}
                       className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${filterStatus === "all" ? `${theme.bgLight} ${theme.main} border ${theme.borderSoft}` : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"}`}
                    >
                      Semua
                    </button>
                    <button 
                       onClick={() => setFilterStatus("expired")}
                       className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${filterStatus === "expired" ? "bg-red-500/30 text-red-300 border border-red-500/50" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"}`}
                    >
                      Expired
                    </button>
                    <button 
                       onClick={() => setFilterStatus("critical")}
                       className={`flex-1 py-1 rounded text-[10px] font-semibold transition-colors ${filterStatus === "critical" ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"}`}
                    >
                      Kritis
                    </button>
                  </div>
                </div>
              </div>

              {filteredCrews.map((crew, index) => (
                <div
                  key={crew.id}
                  className={`w-full group/crew relative rounded-xl transition-all duration-300 overflow-hidden border ${
                    currentView === "crew" && selectedCrewId === crew.id
                      ? "bg-yellow-200 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                      : "bg-[#fefce8] border-transparent hover:bg-yellow-100"
                  }`}
                >
                  <div className="flex items-center justify-between p-3 md:p-4 relative">
                    <div
                      onClick={() => {
                        setSelectedCrewId(crew.id);
                        setCurrentView("crew");
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1 relative z-10"
                    >
                      <div
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                          currentView === "crew" && selectedCrewId === crew.id
                            ? "bg-slate-800 text-yellow-300"
                            : "bg-yellow-200 text-slate-700"
                        }`}
                      >
                        {crew.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 truncate">
                        <h3
                          className={`font-semibold text-xs md:text-sm truncate ${
                            currentView === "crew" && selectedCrewId === crew.id
                              ? "text-slate-900"
                              : "text-slate-800"
                          }`}
                        >
                          {crew.name}
                        </h3>
                        <p className="text-[10px] md:text-xs text-slate-600 truncate mt-0.5">
                          {crew.rank}
                        </p>
                      </div>
                    </div>
                    {isPip && (
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/crew:opacity-100 transition-opacity duration-200 relative z-20 bg-white/50 backdrop-blur-sm rounded-lg px-1 md:bg-transparent md:backdrop-blur-none pl-2">
                        <button
                          onClick={() => handleMoveCrew(index, -1)}
                          disabled={index === 0}
                          className={`p-1.5 md:p-1 transition-colors rounded ${index === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900'}`}
                          title="Naikkan"
                        >
                          <Icon name="ChevronUp" size={13} />
                        </button>
                        <button
                          onClick={() => handleMoveCrew(index, 1)}
                          disabled={index === filteredCrews.length - 1}
                          className={`p-1.5 md:p-1 transition-colors rounded ${index === filteredCrews.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900'}`}
                          title="Turunkan"
                        >
                          <Icon name="ChevronDown" size={13} />
                        </button>
                        <button
                          onClick={() => handleStartEditCrew(crew)}
                          className="p-1.5 md:p-1 text-slate-500 hover:text-blue-600 transition-colors rounded"
                          title="Edit"
                        >
                          <Icon name="Edit2" size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCrew(crew.id)}
                          className="p-1.5 md:p-1 text-slate-500 hover:text-red-600 transition-colors rounded"
                          title="Hapus"
                        >
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredCrews.length === 0 && (
                <div className="text-center p-4 text-slate-600 text-xs mt-4 border border-dashed border-slate-400/50 rounded-lg bg-white/5">
                  {crews.length === 0 ? "Database kosong. Silakan tambah crew." : "Tidak ada crew yang sesuai filter."}
                </div>
              )}
            </div>
          </div>
          {isPip && (
            <div className="p-4 border-t border-white/5 bg-black/20 pb-6 md:pb-4">
              <p className={`text-xs font-semibold mb-2 uppercase tracking-wider pl-1 flex items-center gap-1 ${theme.main}`}>
                <Icon name="UserPlus" size={12} />{" "}
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
                    className={`p-2.5 md:p-2 rounded-lg text-xs font-bold transition-all text-black hover:opacity-80`}
                    style={{ backgroundColor: theme.hex }}
                  >
                    <Icon name="Plus" size={16} />
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
                      <Icon name="X" size={16} />
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
        
        {/* EFEK SPOTLIGHT MOUSE */}
        <div
          className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${theme?.hex}15, transparent 40%)`
          }}
        />

        <header className="glass-panel !border-x-0 !border-t-0 !rounded-none px-4 md:px-8 py-4 md:py-6 z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 border-b border-white/5 shadow-md relative">
          <div className="flex items-start md:items-end gap-3 md:gap-5 w-full">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`mt-1 md:mb-1 p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all ${theme.glow} flex-shrink-0 ${theme.main}`}
            >
              <Icon name="Menu" size={20} className="md:w-6 md:h-6" />
            </button>
            <div className="flex-1 overflow-hidden">
              <h2 className="text-xl md:text-3xl font-light text-white mb-1 md:mb-2 truncate">
                {currentView === "overview" ? (
                  <>Dashboard <span className={`font-bold ${theme.main}`}>Overview</span></>
                ) : currentView === "matrix" ? (
                  <>Real Crew <span className={`font-bold ${theme.main}`}>Matrix</span></>
                ) : (
                  <>
                    Data Sertifikat:{" "}
                    <span className={`font-bold ${theme.main}`}>
                      {selectedCrew?.name || "Tidak ada data"}
                    </span>
                  </>
                )}
              </h2>
              
              {currentView === "overview" ? (
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                  <span className={`px-2 py-0.5 border rounded text-[10px] md:text-xs tracking-wider font-semibold ${theme.bgLight} ${theme.borderSoft} ${theme.main}`}>
                    Ringkasan Status Global
                  </span>
                  <span className="px-2 py-0.5 bg-gray-500/10 border border-gray-500/20 text-gray-300 rounded text-[10px] md:text-xs tracking-wider font-semibold">
                    Operator: <span className="text-white capitalize">{userName}</span>
                  </span>
                  {/* SWITCHER TEMA */}
                  <div className="flex items-center gap-2 ml-2 pl-2 md:ml-4 md:pl-4 border-l border-gray-600 z-50 pointer-events-auto">
                    <button onClick={() => setActiveTheme('cyan')} className={`w-3.5 h-3.5 rounded-full bg-cyan-400 ${activeTheme === 'cyan' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-cyan-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Neon Cyan"></button>
                    <button onClick={() => setActiveTheme('emerald')} className={`w-3.5 h-3.5 rounded-full bg-emerald-400 ${activeTheme === 'emerald' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-emerald-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Radar Green"></button>
                    <button onClick={() => setActiveTheme('amber')} className={`w-3.5 h-3.5 rounded-full bg-amber-400 ${activeTheme === 'amber' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-amber-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Night Amber"></button>
                  </div>
                </div>
              ) : currentView === "matrix" ? (
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                  <span className={`px-2 py-0.5 border rounded text-[10px] md:text-xs tracking-wider font-semibold ${theme.bgLight} ${theme.borderSoft} ${theme.main}`}>
                    Tabel Visualisasi Status
                  </span>
                  <span className="px-2 py-0.5 bg-gray-500/10 border border-gray-500/20 text-gray-300 rounded text-[10px] md:text-xs tracking-wider font-semibold">
                    Operator: <span className="text-white capitalize">{userName}</span>
                  </span>
                  {/* SWITCHER TEMA */}
                  <div className="flex items-center gap-2 ml-2 pl-2 md:ml-4 md:pl-4 border-l border-gray-600 z-50 pointer-events-auto">
                    <button onClick={() => setActiveTheme('cyan')} className={`w-3.5 h-3.5 rounded-full bg-cyan-400 ${activeTheme === 'cyan' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-cyan-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Neon Cyan"></button>
                    <button onClick={() => setActiveTheme('emerald')} className={`w-3.5 h-3.5 rounded-full bg-emerald-400 ${activeTheme === 'emerald' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-emerald-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Radar Green"></button>
                    <button onClick={() => setActiveTheme('amber')} className={`w-3.5 h-3.5 rounded-full bg-amber-400 ${activeTheme === 'amber' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-amber-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Night Amber"></button>
                  </div>
                </div>
              ) : (
                selectedCrew && (
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icon name="User" size={12} className="md:w-3.5 md:h-3.5" />{" "}
                      {selectedCrew.rank}
                    </span>
                    <span className="flex items-center gap-1 hidden sm:flex">
                      <Icon name="Users" size={12} className="md:w-3.5 md:h-3.5" /> Status:{" "}
                      {selectedCrew.status}
                    </span>
                    <span className={`px-2 py-0.5 border rounded text-[10px] md:text-xs tracking-wider font-semibold ${theme.bgLight} ${theme.borderSoft} ${theme.main}`}>
                      Operator:{" "}
                      <span className="text-white capitalize">{userName}</span>
                    </span>
                    {/* SWITCHER TEMA */}
                    <div className="flex items-center gap-2 ml-2 pl-2 md:ml-4 md:pl-4 border-l border-gray-600 z-50 pointer-events-auto">
                      <button onClick={() => setActiveTheme('cyan')} className={`w-3.5 h-3.5 rounded-full bg-cyan-400 ${activeTheme === 'cyan' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-cyan-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Neon Cyan"></button>
                      <button onClick={() => setActiveTheme('emerald')} className={`w-3.5 h-3.5 rounded-full bg-emerald-400 ${activeTheme === 'emerald' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-emerald-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Radar Green"></button>
                      <button onClick={() => setActiveTheme('amber')} className={`w-3.5 h-3.5 rounded-full bg-amber-400 ${activeTheme === 'amber' ? 'ring-2 ring-offset-2 ring-offset-[#0A1128] ring-amber-400' : 'opacity-50 hover:opacity-100'} transition-all`} title="Night Amber"></button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto mt-4 md:mt-0 relative z-40">
            <button
              onClick={exportToCSV}
              className="w-full md:w-auto flex justify-center items-center gap-2 px-5 py-3 md:py-2.5 bg-green-600/20 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500 hover:text-slate-900 transition-all font-semibold text-xs md:text-sm uppercase shadow-[0_0_15px_rgba(74,222,128,0.2)]"
            >
              <Icon name="Download" size={16} /> Export Data
            </button>

            {isPip && currentView === "crew" && selectedCrew && (
              <button
                onClick={() => {
                  setEditingCert(null);
                  setIsModalOpen(true);
                }}
                className={`w-full md:w-auto flex justify-center items-center gap-2 px-5 py-3 md:py-2.5 rounded-lg transition-all font-semibold text-xs md:text-sm uppercase ${theme.bgLight} ${theme.main} border ${theme.borderSoft} ${theme.glow} hover:bg-white/10`}
              >
                <Icon name="Plus" size={16} /> Add Certificate
              </button>
            )}
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 pb-20 md:pb-8 relative">
          
          {currentView === "overview" ? (
            renderOverviewDashboard()
          ) : currentView === "matrix" ? (
            renderMatrixView()
          ) : (
            <>
              {selectedCrew &&
                (expiredCertsCount > 0 || criticalCertsCount > 0) && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl border flex items-center gap-3 md:gap-4 bg-red-900/20 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] blink-red animate-pulse relative z-20">
                    <div className="p-2 md:p-3 bg-red-500/20 rounded-full flex-shrink-0">
                      <Icon name="Bell" size={20} className="text-red-400 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="text-red-400 font-bold text-xs md:text-sm tracking-wider uppercase">
                        Peringatan Sistem Dokumen
                      </h4>
                      <p className="text-gray-300 text-[10px] md:text-sm mt-0.5 leading-tight md:leading-normal">
                        Kru ini memiliki{" "}
                        <span className="font-bold text-white">
                          {expiredCertsCount} dokumen mati
                        </span>{" "}
                        dan{" "}
                        <span className="font-bold text-white">
                          {criticalCertsCount} dokumen kritis (&le; 30 Hari)
                        </span>
                        . Segera periksa!
                      </p>
                    </div>
                  </div>
                )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fadeIn relative z-20">
                {sortedCrewCerts.map((cert, index) => {
                  const status = getExpiryStatus(cert.expiryDate);
                  const isExpired = status.days <= 0;
                  return (
                    <div
                      key={cert.id}
                      className={`glass-panel rounded-xl p-4 md:p-5 border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${status.class}`}
                    >
                      {isExpired && (
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-600/50 transform -translate-y-1/2 -rotate-12 pointer-events-none z-20"></div>
                      )}
                      <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-2 md:p-2.5 bg-white/5 rounded-lg border border-white/10 flex-shrink-0">
                            <Icon name="FileText" size={18} className="text-gray-300 md:w-5 md:h-5" />
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
                          <div className="flex gap-1 md:gap-1.5 flex-shrink-0 z-40">
                            {/* TOMBOL SUSUN ULANG (KIRI, KANAN, ATAS, BAWAH) */}
                            <button
                              onClick={() => handleJumpCert(cert, "top")}
                              disabled={index === 0}
                              title="Pindah ke Paling Pertama"
                              className={`p-1.5 rounded-md ${index === 0 ? 'text-gray-600 cursor-not-allowed bg-transparent' : `text-gray-400 hover:${theme.main} bg-white/5 md:bg-black/20`}`}
                            >
                              <Icon name="ChevronsUp" size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveCert(index, -1)}
                              disabled={index === 0}
                              title="Geser Kiri"
                              className={`p-1.5 rounded-md ${index === 0 ? 'text-gray-600 cursor-not-allowed bg-transparent' : `text-gray-400 hover:${theme.main} bg-white/5 md:bg-black/20`}`}
                            >
                              <Icon name="ChevronLeft" size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveCert(index, 1)}
                              disabled={index === sortedCrewCerts.length - 1}
                              title="Geser Kanan"
                              className={`p-1.5 rounded-md ${index === sortedCrewCerts.length - 1 ? 'text-gray-600 cursor-not-allowed bg-transparent' : `text-gray-400 hover:${theme.main} bg-white/5 md:bg-black/20`}`}
                            >
                              <Icon name="ChevronRight" size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleJumpCert(cert, "bottom")}
                              disabled={index === sortedCrewCerts.length - 1}
                              title="Pindah ke Paling Akhir"
                              className={`p-1.5 rounded-md ${index === sortedCrewCerts.length - 1 ? 'text-gray-600 cursor-not-allowed bg-transparent' : `text-gray-400 hover:${theme.main} bg-white/5 md:bg-black/20`}`}
                            >
                              <Icon name="ChevronsDown" size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCert(cert);
                                setIsModalOpen(true);
                              }}
                              className={`p-1.5 text-gray-400 hover:${theme.main} bg-white/5 md:bg-black/20 rounded-md`}
                            >
                              <Icon name="Edit2" size={12} className="md:w-3.5 md:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCert(cert.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 md:bg-black/20 rounded-md"
                            >
                              <Icon name="Trash2" size={12} className="md:w-3.5 md:h-3.5" />
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

                      {/* AREA TEKS BERJALAN (POSISI BARU) */}
                      <div className="mt-2 w-full overflow-hidden marquee-container relative z-10">
                        <span className={`marquee-text font-mono text-[10px] md:text-xs font-bold tracking-wider opacity-90 ${status.color}`}>
                          {status.message}
                        </span>
                      </div>

                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10 relative z-10">
                        <div className="w-full h-1 md:h-1.5 bg-black/60 rounded-full mb-2 md:mb-3 overflow-hidden border border-white/5 relative">
                          <div
                            className={`absolute top-0 left-0 h-full ${status.bar} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`}
                            style={{ width: `${status.prog}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center w-full">
                          <div
                            className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md ${status.bg} border border-white/10 shadow-inner flex-shrink-0`}
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

                          <div className="flex flex-col items-end flex-shrink-0">
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
                  <div className="col-span-full flex flex-col items-center justify-center p-8 md:p-12 glass-panel rounded-xl border-dashed border-gray-600 relative z-20">
                    <Icon name="FileText" size={36} className="text-gray-600 mb-3 md:w-12 md:h-12 md:mb-4" />
                    <p className="text-gray-400 text-xs md:text-sm text-center">
                      Tidak ada sertifikat untuk crew ini.
                    </p>
                  </div>
                )}
                {crews.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 md:p-12 glass-panel rounded-xl border-dashed border-gray-600 relative z-20">
                    <Icon name="Users" size={36} className="text-gray-600 mb-3 md:w-12 md:h-12 md:mb-4" />
                    <p className="text-gray-400 text-xs md:text-sm text-center px-4">
                      Belum ada crew yang didaftarkan. <br className="hidden md:block" /> Silakan tambah crew baru di
                      menu.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCert}
          certData={editingCert}
          crewId={selectedCrewId}
        />
        <ConfirmModal
          isOpen={confirmAction.isOpen}
          message={confirmAction.message}
          onConfirm={executeConfirmAction}
          onCancel={() => setConfirmAction({ isOpen: false, message: "", action: null })}
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
      try {
        // eslint-disable-next-line no-undef
        if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
          // eslint-disable-next-line no-undef
          await signInWithCustomToken(authFirebase, __initial_auth_token);
        } else {
          await signInAnonymously(authFirebase);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
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
