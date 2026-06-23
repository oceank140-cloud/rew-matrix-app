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
  getDoc,
  setDoc,
} from "firebase/firestore";

// --- CUSTOM INLINE ICON COMPONENT ---
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
    Download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    Settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    Zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
    Check: <><polyline points="20 6 9 17 4 12"/></>,
    FileDown: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></>
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

const firebaseConfig = typeof __firebase_config !== "undefined"
  ? JSON.parse(__firebase_config)
  : defaultFirebaseConfig;

const app = initializeApp(firebaseConfig);
const authFirebase = getAuth(app);
const db = getFirestore(app);

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

// --- CUSTOM STYLES (ALL GLOBAL CSS) ---
const CustomStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    :root { --bg-dark: #050A15; --bg-navy: #0A1128; --panel-glass: rgba(255, 255, 255, 0.04); --neon-cyan: #00F0FF; }
    body { background-color: var(--bg-dark); color: #E2E8F0; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
    .glass-panel { background: var(--panel-glass); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); }
    
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
    
    /* ANIMASI MARQUEE */
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

    /* TRANSISI MENU DIGITAL SHARPNESS 2026 (ANTI-BLUR) */
    @keyframes crtGlitchWipe {
      0% { 
        opacity: 1; 
        transform: scaleY(1) scaleX(1); 
        filter: blur(0) contrast(1) brightness(1);
      }
      15% { 
        transform: scaleY(1) scaleX(1.08) skewX(15deg); 
        filter: contrast(3) brightness(2) hue-rotate(90deg);
        background: repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.1) 2px, transparent 2px, transparent 4px);
      }
      30% { 
        transform: scaleY(0.01) scaleX(1.3); 
        filter: blur(0px) brightness(3); 
        opacity: 0.8;
      }
      45% { 
        transform: scaleY(0) scaleX(0); 
        opacity: 0; 
      }
      65% { 
        transform: scaleY(0.005) scaleX(1.1); 
        opacity: 0.6; 
        filter: blur(0px) brightness(2) hue-rotate(-40deg); 
      }
      80% { 
        transform: scaleY(1) scaleX(0.98); 
        filter: blur(0px) contrast(1.2); 
      }
      100% { 
        opacity: 1; 
        transform: scaleY(1) scaleX(1); 
        filter: blur(0) contrast(1) brightness(1); 
      }
    }
    
    .anim-crt-wipe {
      animation: crtGlitchWipe 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    }
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
  
  const [loadingText, setLoadingText] = useState("OTORISASI AKSES");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setLoadingText("[ MEMBANGUN KONEKSI... ]");
    
    setTimeout(() => {
      setLoadingText("[ MEMECAHKAN SANDI... ]");
    }, 600);

    setTimeout(() => {
      setLoadingText("[ OTENTIKASI SISTEM... ]");
    }, 1200);

    setTimeout(async () => {
      const sanitizedUser = sanitizeInput(username);
      if (!sanitizedUser.trim()) {
        setError("Nama Operator tidak boleh kosong.");
        setLoading(false);
        setLoadingText("OTORISASI AKSES"); 
        return;
      }

      try {
        const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'passwords');
        const configSnap = await getDoc(configRef);
        
        let adminPass = "wahyu123";
        let crewPass = "kingocean123";

        if (configSnap.exists()) {
          adminPass = configSnap.data().adminPass || adminPass;
          crewPass = configSnap.data().crewPass || crewPass;
        } else {
          await setDoc(configRef, { adminPass, crewPass });
        }

        if (password === adminPass) {
          setLoadingText("[ AKSES DITERIMA ]");
          sessionStorage.setItem("jwt_token", "token_pip_dynamic_2026");
          sessionStorage.setItem("user_role", "pip");
          sessionStorage.setItem("user_name", sanitizedUser);
          setTimeout(() => {
            onLogin({ isAuthenticated: true, role: "pip", name: sanitizedUser });
          }, 500); 
        } else if (password === crewPass) {
          setLoadingText("[ AKSES DITERIMA ]");
          sessionStorage.setItem("jwt_token", "token_crew_dynamic_2026");
          sessionStorage.setItem("user_role", "crew");
          sessionStorage.setItem("user_name", sanitizedUser);
          setTimeout(() => {
            onLogin({ isAuthenticated: true, role: "crew", name: sanitizedUser });
          }, 500);
        } else {
          setError("Kredensial tidak valid. Akses Ditolak.");
          setLoading(false);
          setLoadingText("OTORISASI AKSES"); 
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setError("Gagal terhubung ke database otentikasi.");
        setLoading(false);
        setLoadingText("OTORISASI AKSES");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050A15] p-4">
      <style>{`
        @keyframes neon-pulse-cyan {
          0%, 100% { text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }
          50% { text-shadow: 0 0 15px rgba(0, 229, 255, 0.8), 0 0 25px rgba(0, 229, 255, 0.4); }
        }
        @keyframes neon-pulse-magenta {
          0%, 100% { text-shadow: 0 0 10px rgba(217, 70, 239, 0.4), 0 0 20px rgba(217, 70, 239, 0.2); }
          50% { text-shadow: 0 0 15px rgba(217, 70, 239, 0.8), 0 0 30px rgba(217, 70, 239, 0.5); }
        }
        @keyframes bracket-breathe-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes bracket-breathe-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-neon-cyan { animation: neon-pulse-cyan 3s ease-in-out infinite; }
        .animate-neon-magenta { animation: neon-pulse-magenta 3s ease-in-out infinite; }
        .animate-bracket-l { animation: bracket-breathe-left 4s ease-in-out infinite; }
        .animate-bracket-r { animation: bracket-breathe-right 4s ease-in-out infinite; }
        
        @keyframes cine-fly-left {
          0% { opacity: 0; transform: translateX(-80px) scale(1.1); filter: blur(8px); }
          100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes cine-fly-right {
          0% { opacity: 0; transform: translateX(80px) scale(1.1); filter: blur(8px); }
          100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes cine-fly-up {
          0% { opacity: 0; transform: translateY(40px); filter: blur(5px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }
        .anim-cine-title { animation: cine-fly-left 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .anim-cine-sub { animation: cine-fly-right 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s both; }
        .anim-cine-text { animation: cine-fly-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s both; }
        .anim-cine-btn { animation: cine-fly-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.9s both; }

        @keyframes scanner-sweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .input-biometric {
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
        }
        .input-biometric:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 15px rgba(0,229,255,0.2), inset 0 0 10px rgba(0,229,255,0.1);
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(0,229,255,0.15) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 200% 100%;
          animation: scanner-sweep 2s infinite linear;
          outline: none;
        }

        @keyframes terminal-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 15px rgba(0,229,255,0.4); border-color: #00e5ff; }
          50% { opacity: 0.8; box-shadow: 0 0 30px rgba(0,229,255,0.8); border-color: white; }
        }
        .btn-loading-state {
          animation: terminal-pulse 0.8s infinite;
          background: rgba(0, 229, 255, 0.1) !important;
          color: #00e5ff !important;
        }
      `}</style>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/20 rounded-full blur-[100px]"></div>
      
      <div className="glass-panel p-6 md:p-10 rounded-2xl w-full max-w-md relative z-10">
        
        <div className="flex flex-col items-center justify-center mb-8 relative z-10 cursor-default select-none overflow-hidden pb-2 pt-2">
          
          <div className="flex flex-col items-center justify-center mb-6 group">
            <span className="text-fuchsia-500 text-3xl font-light leading-none mb-1 animate-neon-magenta animate-bracket-l">[</span>
            <span className="text-white text-xl md:text-2xl font-black leading-none tracking-[0.15em] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">WHY</span>
            <span className="text-fuchsia-500 font-mono text-[9px] md:text-[10px] font-bold tracking-[0.3em] mt-1.5 opacity-80 animate-neon-cyan">1988</span>
            <span className="text-fuchsia-500 text-3xl font-light leading-none mt-1 animate-neon-magenta animate-bracket-r">]</span>
          </div>

          <h2 className="text-4xl md:text-[42px] font-bold uppercase tracking-[0.15em] anim-cine-title mb-1 bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-300 to-slate-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Crew Matrix
          </h2>
          
          <h3 className="text-sm md:text-base font-semibold tracking-[0.4em] text-[#d946ef] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase mb-3 anim-cine-sub">
            Sertifikat
          </h3>
          
          <p className="text-[#64748b] text-[9px] md:text-[10px] font-mono tracking-[0.3em] uppercase anim-cine-text">
            Enterprise Certificate System
          </p>

        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-xs md:text-sm flex items-center gap-2 anim-cine-text backdrop-blur-md">
            <Icon name="AlertTriangle" size={16} className="text-red-500 flex-shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 tracking-wider uppercase">
              NAMA OPERATOR / CREW
            </label>
            <div className="relative">
              <Icon name="User" className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${username ? 'text-[#00e5ff]' : 'text-gray-500'}`} size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-biometric w-full pl-10 pr-4 py-3 rounded-lg text-sm md:text-base text-white border border-white/10 anim-cine-text"
                placeholder="Ketik nama Anda..."
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 tracking-wider uppercase">
              ENCRYPTED KEY (PASSWORD)
            </label>
            <div className="relative">
              <Icon name="Lock" className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${password ? 'text-[#00e5ff]' : 'text-gray-500'}`} size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-biometric w-full pl-10 pr-4 py-3 rounded-lg text-sm md:text-base text-white border border-white/10 anim-cine-text placeholder-gray-600"
                placeholder="Ketik sandi keamanan..."
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white font-bold text-[11px] md:text-sm tracking-[0.2em] py-3.5 rounded-lg border border-[#334155] border-t-[#94a3b8] shadow-[0_10px_20px_rgba(0,0,0,0.6)] hover:from-[#334155] hover:to-[#1e293b] hover:border-t-white transition-all duration-300 uppercase mt-4 anim-cine-btn relative overflow-hidden group disabled:cursor-wait ${loading ? 'btn-loading-state font-mono' : ''}`}
          >
            <span className="relative z-10 drop-shadow-md">
              {loadingText}
            </span>
            
            {!loading && (
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out z-0"></div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- KOMPONEN PENGATURAN SISTEM (ENTERPRISE 2026) ---
const SettingsModal = ({ isOpen, onClose, onSave }) => {
  const [adminPass, setAdminPass] = useState("");
  const [crewPass, setCrewPass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        setLoading(true);
        try {
          const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'passwords');
          const snap = await getDoc(configRef);
          if (snap.exists()) {
            setAdminPass(snap.data().adminPass || "");
            setCrewPass(snap.data().crewPass || "");
          } else {
            setAdminPass("wahyu123");
            setCrewPass("kingocean123");
          }
        } catch (err) {
          console.error(err);
        }
        setLoading(false);
      };
      fetchConfig();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(adminPass, crewPass);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050A15]/80 backdrop-blur-md p-4 overflow-hidden">
      <div className="anim-holo-unfold w-full max-w-sm rounded-2xl p-6 md:p-8 border border-white/10 bg-[#0A1128]/80 relative overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-80"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              SYSTEM SETTINGS
            </h3>
            <p className="text-[10px] text-[#00e5ff] font-mono tracking-widest uppercase mt-1">
              Access Configuration
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-rose-500 transition-all duration-300 bg-white/5 hover:bg-rose-500/10 p-2 rounded-xl">
            <Icon name="X" size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-[#00e5ff] animate-spin"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                Password Master (PIP / Admin)
              </label>
              <input
                type="text"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg font-medium font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                Password Akses (Semua Crew)
              </label>
              <input
                type="text"
                value={crewPass}
                onChange={(e) => setCrewPass(e.target.value)}
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg font-medium font-mono"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 w-full mt-6 pt-5 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">
                Batal
              </button>
              <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#00e5ff]/10 to-transparent hover:bg-[#00e5ff]/20 text-white border rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.15)] group relative overflow-hidden" style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out z-0"></div>
                <span className="relative z-10">Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}
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

// --- KOMPONEN KONFIRMASI HAPUS (CRITICAL DANGER PROTOCOL 2026) ---
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    let timer;
    if (isHolding) {
      timer = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsHolding(false);
            onConfirm(); 
            return 100;
          }
          return prev + 2.5; 
        });
      }, 25);
    } else {
      setHoldProgress(0); 
    }
    return () => clearInterval(timer);
  }, [isHolding, onConfirm]);

  useEffect(() => {
    if (!isOpen) {
      setIsHolding(false);
      setHoldProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
      
      <style>{`
        .hazard-stripes {
          background: repeating-linear-gradient(
            -45deg,
            rgba(225, 29, 72, 0.08),
            rgba(225, 29, 72, 0.08) 15px,
            transparent 15px,
            transparent 30px
          );
        }
        
        @keyframes strobe-glitch {
          0%, 100% { opacity: 1; transform: translate(0) skewX(0); filter: drop-shadow(0 0 10px #e11d48); }
          20% { opacity: 0.8; transform: translate(-3px, 3px) skewX(5deg); filter: drop-shadow(0 0 20px #e11d48) hue-rotate(-10deg); }
          40% { opacity: 0.2; transform: translate(3px, -3px) skewX(-5deg); }
          60% { opacity: 0.9; transform: translate(0); filter: drop-shadow(0 0 30px #e11d48); }
          80% { opacity: 0.4; transform: translate(-1px, 1px) skewX(2deg); }
        }
        .anim-strobe-glitch {
          animation: strobe-glitch 0.2s infinite;
        }

        @keyframes modal-slam {
          0% { transform: scale(1.3); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        .anim-modal-slam {
          animation: modal-slam 0.3s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
      `}</style>

      <div className="anim-modal-slam w-full max-w-sm rounded-xl overflow-hidden border border-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.4)] relative bg-[#050A15]">
        <div className="absolute inset-0 hazard-stripes z-0 pointer-events-none"></div>
        <div className="bg-rose-600 text-white text-[9px] font-black tracking-[0.3em] uppercase text-center py-1.5 relative z-10 shadow-[0_0_15px_#e11d48]">
          [ CRITICAL DANGER PROTOCOL ]
        </div>

        <div className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-rose-950/80 rounded-full flex items-center justify-center mb-5 border border-rose-500 anim-strobe-glitch shadow-[0_0_20px_#e11d48]">
            <Icon name="AlertTriangle" size={32} className="text-rose-500" />
          </div>
          
          <h3 className="text-xl font-black text-rose-500 mb-2 tracking-[0.15em] uppercase drop-shadow-[0_0_8px_rgba(225,29,72,0.6)]">
            Peringatan Kritis
          </h3>
          
          <p className="text-xs text-rose-200/80 mb-8 font-mono leading-relaxed">
            {message}
            <br/><br/>
            <span className="text-rose-500 font-bold bg-rose-950/50 p-1.5 rounded border border-rose-900 block tracking-widest">
              TINDAKAN INI BERSIFAT PERMANEN.
            </span>
          </p>
          
          <div className="flex flex-col w-full gap-3 mt-2">
            <button
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onMouseLeave={() => setIsHolding(false)}
              onTouchStart={() => setIsHolding(true)}
              onTouchEnd={() => setIsHolding(false)}
              className="relative w-full py-3.5 bg-[#0a0000] border border-rose-600 text-white rounded-lg overflow-hidden group select-none active:scale-[0.98] transition-transform cursor-crosshair"
            >
              <div 
                className="absolute top-0 left-0 h-full bg-rose-600 transition-all duration-75 ease-linear z-0 shadow-[0_0_20px_#e11d48]"
                style={{ width: `${holdProgress}%` }}
              ></div>
              <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black tracking-[0.25em] uppercase drop-shadow-md">
                  {isHolding ? "PURGING DATA..." : "Execute Purge"}
                </span>
                <span className="text-[8.5px] font-mono text-rose-200 opacity-90 tracking-widest mt-1 uppercase">
                  {isHolding ? `[ LOADING: ${Math.floor(holdProgress)}% ]` : "[ Tahan Untuk Konfirmasi ]"}
                </span>
              </div>
            </button>

            <button
              onClick={onCancel}
              className="w-full py-3 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white rounded-lg transition-colors shadow-inner"
            >
              Abort Mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN MODAL SERTIFIKAT (ANTI-BLUR EDITION) ---
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

  const handleAutoCalculate = (years) => {
    if (!formData.issueDate) {
      setError("Silakan isi Tanggal Terbit terlebih dahulu untuk kalkulasi otomatis.");
      return;
    }
    const issueDateObj = new Date(formData.issueDate);
    issueDateObj.setFullYear(issueDateObj.getFullYear() + years);
    
    const yyyy = issueDateObj.getFullYear();
    const mm = String(issueDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(issueDateObj.getDate()).padStart(2, '0');
    
    setFormData(prev => ({ 
      ...prev, 
      expiryDate: `${yyyy}-${mm}-${dd}` 
    }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.number ||
      !formData.issueDate ||
      (!formData.expiryDate && formData.expiryDate !== "Unlimited")
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (formData.expiryDate !== "Unlimited" && new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050A15]/60 backdrop-blur-md p-4 overflow-hidden">
      
      <style>{`
        @keyframes holoUnfold {
          0% { transform: scaleY(0.005) scaleX(0); opacity: 0; filter: blur(5px); }
          40% { transform: scaleY(0.005) scaleX(1); opacity: 0.8; filter: blur(1px); }
          100% { transform: scaleY(1) scaleX(1); opacity: 1; filter: blur(0); }
        }
        .anim-holo-unfold {
          animation: holoUnfold 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center;
        }

        .glass-input-holo {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-input-holo:focus {
          background: rgba(0, 229, 255, 0.05);
          border-color: rgba(0, 229, 255, 0.5);
          border-bottom: 2px solid #00e5ff;
          outline: none;
        }
      `}</style>

      <div className="anim-holo-unfold w-full max-w-lg rounded-2xl p-6 md:p-8 border border-white/10 bg-[#0A1128]/60 relative overflow-visible shadow-2xl backdrop-blur-md">
        
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-80"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {certData ? "Update Cert" : "System Input"}
            </h3>
            <p className="text-[10px] text-[#00e5ff] font-mono tracking-widest uppercase mt-1">
              Data Entry Terminal
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-rose-500 hover:rotate-90 transition-all duration-300 bg-white/5 hover:bg-rose-500/10 p-2 rounded-xl">
            <Icon name="X" size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-5 text-rose-400 text-xs font-mono bg-rose-900/20 p-3 rounded-lg border border-rose-500/30 flex items-center gap-3">
            <Icon name="AlertTriangle" size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
              Nama Dokumen / Kode (Ketik Singkatan: BST)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={handleNameBlur}
              className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg placeholder-gray-600 font-medium"
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
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
              ID Registrasi / Nomor Sertifikat
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg placeholder-gray-600 font-medium font-mono"
              placeholder="Contoh: 62001123456"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                Tanggal Terbit (Issue)
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg [color-scheme:dark]"
              />
            </div>
            
            <div className="flex flex-col w-full">
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                Tanggal Kedaluwarsa (Expired)
              </label>
              <input
                type="date"
                value={formData.expiryDate === "Unlimited" ? "" : formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                disabled={formData.expiryDate === "Unlimited"}
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg [color-scheme:dark] disabled:opacity-20 disabled:cursor-not-allowed"
              />
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer group w-fit">
                <input
                  type="checkbox"
                  checked={formData.expiryDate === "Unlimited"}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.checked ? "Unlimited" : "" })}
                  className="rounded border-gray-600 text-[#00e5ff] focus:ring-[#00e5ff]/50 bg-[#1A1D24] cursor-pointer w-4 h-4 transition-all"
                />
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#00e5ff] transition-colors tracking-widest uppercase">
                  Berlaku Seumur Hidup
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-5 border-t border-white/10 relative z-10">
            <div className="flex items-center w-full sm:w-auto">
              <span className="text-[9px] text-[#64748b] font-mono tracking-widest uppercase mr-3 hidden lg:block">
                Auto Exp:
              </span>
              <div className="flex bg-black/40 rounded-lg border border-white/10 overflow-hidden w-full sm:w-auto shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <button
                  type="button"
                  onClick={() => handleAutoCalculate(1)}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-2 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:shadow-[inset_0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 border-r border-white/10"
                  title="MCU / Buku Pelaut (1 Tahun)"
                >
                  +1 Thn
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoCalculate(2)}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-2 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:shadow-[inset_0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 border-r border-white/10"
                  title="Buku Pelaut (2 Tahun)"
                >
                  +2 Thn
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoCalculate(5)}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-2 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:shadow-[inset_0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300"
                  title="Sertifikat Pelaut Umum (5 Tahun)"
                >
                  +5 Thn
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-gradient-to-r from-[#00e5ff]/10 to-transparent hover:bg-[#00e5ff]/20 text-white border rounded-lg text-xs font-bold tracking-widest uppercase w-full md:w-auto transition-all duration-300 hover:scale-105 active:scale-95 group relative overflow-hidden"
                style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', boxShadow: '0 0 15px rgba(0,229,255,0.15)' }}
              >
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out"></div>
                <span className="group-hover:drop-shadow-[0_0_8px_currentColor] transition-all relative z-10">
                  {certData ? "Simpan Data" : "Input System"}
                </span>
              </button>
            </div>
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

// --- KOMPONEN UTAMA DASHBOARD (MASTER STABLE & OPTIMIZED 2026) ---
const Dashboard = ({ onLogout, userRole, userName, fbUser }) => {
  const [activeTheme, setActiveTheme] = useState('cyan');
  const theme = MARINE_THEMES[activeTheme];

  // OPTIMASI KRUSIAL: Mencegah CPU/RAM Overload saat mouse digerakkan
  const glowRef = React.useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        // Manipulasi CSS langsung tanpa memicu re-render React
        glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, ${theme.hex}15, transparent 40%)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [theme.hex]);

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [confirmAction, setConfirmAction] = useState({ isOpen: false, message: "", action: null });
  const [toast, setToast] = useState(null); 

  // --- TACTICAL DRAG AND DROP STATES & FUNCTIONS ---
  const [draggedCrewId, setDraggedCrewId] = useState(null);
  const [dragOverCrewId, setDragOverCrewId] = useState(null);

  const handleDragStart = (e, id) => {
    if (userRole !== "pip") return;
    setDraggedCrewId(id);
    e.dataTransfer.effectAllowed = "move"; 
  };

  const handleDragOver = (e, id) => {
    e.preventDefault(); 
    if (userRole !== "pip" || draggedCrewId === id) return;
    setDragOverCrewId(id);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverCrewId(null);
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    setDragOverCrewId(null);

    if (userRole !== "pip" || !draggedCrewId || draggedCrewId === targetId || !fbUser) return;

    const draggedCrew = crews.find(c => c.id === draggedCrewId);
    const targetCrew = crews.find(c => c.id === targetId);
    if (!draggedCrew || !targetCrew) return;

    const order1 = draggedCrew.order !== undefined ? draggedCrew.order : 0;
    const order2 = targetCrew.order !== undefined ? targetCrew.order : 0;

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crews', draggedCrew.id), { order: order2 });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crews', targetCrew.id), { order: order1 });
      showToast("URUTAN DATABASE DISINKRONISASI");
    } catch (error) {
      console.error("Gagal mengubah urutan:", error);
    }
    setDraggedCrewId(null);
  };

  const showToast = (message, type = "success") => {
    setToast(null); 
    setTimeout(() => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    }, 10);
  };

  const handleUpdatePasswords = async (newAdminPass, newCrewPass) => {
    try {
      const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'passwords');
      await setDoc(configRef, { adminPass: newAdminPass, crewPass: newCrewPass }, { merge: true });
      setIsSettingsOpen(false);
      showToast("SISTEM KEAMANAN DIPERBARUI");
    } catch (error) {
      console.error("Error updating passwords:", error);
      showToast("GAGAL MENGUPDATE PASSWORD", "error");
    }
  };

  const sortedCrews = [...crews].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999;
    const orderB = b.order !== undefined ? b.order : 999999;
    return orderA - orderB;
  });

  const getExpiryStatus = (expiryDateStr) => {
    if (expiryDateStr === "Unlimited" || expiryDateStr === "" || !expiryDateStr) {
      return { 
        label: "VALID", days: Infinity, class: "border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] bg-green-950/20", 
        textClass: "text-emerald-400", icon: <Icon name="CheckCircle" size={16} className="text-emerald-400" />,
        prog: 100, color: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-400", action: "SEUMUR HIDUP", message: "SEUMUR HIDUP"
      };
    }

    const expDate = new Date(expiryDateStr);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Normalisasi waktu
    const diffDays = Math.ceil((expDate - todayDate) / (1000 * 60 * 60 * 24));
    const prog = Math.min(100, Math.max(0, (diffDays / 365) * 100));
    
    // LOGIKA FORMAT WAKTU PINTAR (SINGKATAN: SW / EXP)
    const absDays = Math.abs(diffDays);
    const yearsLeft = Math.floor(absDays / 365);
    const monthsLeft = Math.floor((absDays % 365) / 30);
    const daysLeft = (absDays % 365) % 30;

    let parts = [];
    if (yearsLeft > 0) parts.push(`${yearsLeft} Thn`);
    if (monthsLeft > 0) parts.push(`${monthsLeft} Bln`);
    if (daysLeft > 0 || (yearsLeft === 0 && monthsLeft === 0)) parts.push(`${daysLeft} Hr`);
    
    const detailTime = parts.join(" ");
    let message = diffDays <= 0 
      ? `EXP: -${detailTime}` 
      : `SW: ${detailTime}`;

    if (diffDays <= 0) return { label: "EXPIRED", class: "cert-expired", icon: <Icon name="XCircle" size={16} className="text-red-500" />, days: diffDays, prog: 0, color: "text-red-500", bg: "bg-red-500/20", bar: "bg-red-500", action: "DOKUMEN MATI", message };
    if (diffDays <= 10) return { label: "CRITICAL", class: "blink-red bg-red-950/30", icon: <Icon name="AlertTriangle" size={16} className="text-red-400" />, days: diffDays, prog, color: "text-red-400", bg: "bg-red-500/20", bar: "bg-red-400", action: "PERPANJANG SEGERA", message };
    if (diffDays <= 20) return { label: "WARNING", class: "pulse-orange bg-orange-950/30", icon: <Icon name="Clock" size={16} className="text-orange-400" />, days: diffDays, prog, color: "text-orange-400", bg: "bg-orange-500/20", bar: "bg-orange-400", action: "PROSES SEKARANG", message };
    if (diffDays <= 30) return { label: "ATTENTION", class: "glow-yellow bg-yellow-950/20", icon: <Icon name="Clock" size={16} className="text-yellow-400" />, days: diffDays, prog, color: "text-yellow-400", bg: "bg-yellow-500/20", bar: "bg-yellow-400", action: "SIAPKAN DOKUMEN", message };
    return { label: "VALID", class: "border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] bg-green-950/20", icon: <Icon name="CheckCircle" size={16} className="text-green-400" />, days: diffDays, prog, color: "text-green-400", bg: "bg-green-500/10", bar: "bg-green-400", action: "STATUS AMAN", message };
  };

  // --- SMART TIME FORMATTER 2026 ---
  const formatSisaWaktu = (days) => {
    if (days < 0) return `${days} HARI`; // Menampilkan minus untuk yang sudah expired
    if (days === 0) return "HARI INI";
    if (days < 30) return `${days} HARI`;
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = (days % 365) % 30;

    if (months === 12) return `${years + 1} THN`; // Edge case pembulatan

    if (years > 0) {
      return `${years} THN ${months > 0 ? months + ' BLN' : ''}`.trim();
    } else {
      return `${months} BLN ${remainingDays > 0 ? remainingDays + ' HR' : ''}`.trim();
    }
  };

  const filteredCrews = sortedCrews.filter((crew) => {
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === "all") return true;

    const crewCertsForFilter = certificates.filter((c) => c.crewId === crew.id);
    if (filterStatus === "expired") return crewCertsForFilter.some((cert) => getExpiryStatus(cert.expiryDate).days <= 0);
    if (filterStatus === "critical") return crewCertsForFilter.some((cert) => {
      const days = getExpiryStatus(cert.expiryDate).days;
      return days > 0 && days <= 30; 
    });
    return true;
  });

  useEffect(() => {
    if (!fbUser) return;
    const crewsRef = collection(db, 'artifacts', appId, 'public', 'data', 'crews');
    const unsubCrews = onSnapshot(crewsRef, (snapshot) => setCrews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), (error) => console.error("Error fetching crews:", error));
    const certsRef = collection(db, 'artifacts', appId, 'public', 'data', 'certificates');
    const unsubCerts = onSnapshot(certsRef, (snapshot) => setCertificates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), (error) => console.error("Error fetching certs:", error));
    return () => { unsubCrews(); unsubCerts(); };
  }, [fbUser]);
  
  useEffect(() => {
    if (currentView === "crew" && !selectedCrewId && crews.length > 0) setSelectedCrewId(crews[0].id);
  }, [crews, selectedCrewId, currentView]);

  const selectedCrew = crews.find((c) => c.id === selectedCrewId);
  const crewCerts = selectedCrewId ? certificates.filter((c) => c.crewId === selectedCrew?.id) : [];
  const sortedCrewCerts = [...crewCerts].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999;
    const orderB = b.order !== undefined ? b.order : 999999;
    return orderA - orderB;
  });
  const isPip = userRole === "pip";

  const totalSertifikatInti = sortedCrewCerts.filter(cert => {
    if (!cert.name) return false;
    const namaDokumen = cert.name.toLowerCase();
    const isMCU = namaDokumen.includes("mcu") || namaDokumen.includes("medical");
    const isBukuPelaut = namaDokumen.includes("seaman") || namaDokumen.includes("pelaut");
    return !isMCU && !isBukuPelaut;
  }).length;

  // INI ADALAH VARIABEL YANG HILANG SEBELUMNYA, SEKARANG SUDAH AMAN!
  const displayCerts = sortedCrewCerts.filter(cert => {
    if (filterStatus === "all") return true;
    let diffDays = Infinity;
    if (cert.expiryDate && cert.expiryDate !== "Unlimited") {
      diffDays = Math.ceil((new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    }
    if (filterStatus === "expired") return diffDays <= 0;
    if (filterStatus === "critical") return diffDays > 0 && diffDays <= 30;
    return true;
  });

  // --- TACTICAL DRAG AND DROP UNTUK KARTU SERTIFIKAT ---
  const [draggedCertId, setDraggedCertId] = useState(null);
  const [dragOverCertId, setDragOverCertId] = useState(null);

  const handleCertDragStart = (e, id) => {
    if (!isPip) return;
    setDraggedCertId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCertDragOver = (e, id) => {
    e.preventDefault();
    if (!isPip || draggedCertId === id) return;
    setDragOverCertId(id);
  };

  const handleCertDragLeave = (e) => {
    e.preventDefault();
    setDragOverCertId(null);
  };

  const handleCertDrop = async (e, targetId) => {
    e.preventDefault();
    setDragOverCertId(null);

    if (!isPip || !draggedCertId || draggedCertId === targetId || !fbUser) return;

    const draggedCert = displayCerts.find(c => c.id === draggedCertId);
    const targetCert = displayCerts.find(c => c.id === targetId);
    if (!draggedCert || !targetCert) return;

    const order1 = draggedCert.order !== undefined ? draggedCert.order : 0;
    const order2 = targetCert.order !== undefined ? targetCert.order : 0;

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', draggedCert.id), { order: order2 });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', targetCert.id), { order: order1 });
      showToast("POSISI DOKUMEN DISINKRONISASI");
    } catch (error) {
      console.error("Gagal mengubah urutan dokumen:", error);
    }
    setDraggedCertId(null);
  };

  const handleSaveCrew = async (e) => {
    e.preventDefault();
    if (!inputCrewName.trim() || !inputCrewRank.trim() || !fbUser) return;
    const newOrder = crews.length > 0 ? Math.max(...crews.map(c => c.order !== undefined ? c.order : 0)) + 1 : 0;
    const crewData = { name: sanitizeInput(inputCrewName), rank: sanitizeInput(inputCrewRank), status: "Onboard", order: newOrder };

    if (editingCrewId) {
      const existingCrew = crews.find(c => c.id === editingCrewId);
      if (existingCrew && existingCrew.order !== undefined) crewData.order = existingCrew.order;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'crews', editingCrewId), crewData);
      showToast("DATA CREW BERHASIL DIUPDATE");
      setEditingCrewId(null);
    } else {
      const newDocRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'crews'), crewData);
      setSelectedCrewId(newDocRef.id);
      setCurrentView("crew");
      showToast("CREW BARU DITAMBAHKAN");
    }
    setInputCrewName("");
    setInputCrewRank("");
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
        for (const cert of certsToDelete) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', cert.id));
        if (selectedCrewId === id) { setSelectedCrewId(null); setCurrentView("overview"); }
        if (editingCrewId === id) { setEditingCrewId(null); setInputCrewName(""); setInputCrewRank(""); }
        showToast("SELURUH DATA CREW DIHAPUS", "success");
      }
    });
  };

  const globalStats = {
    totalCrews: crews.length,
    expired: certificates.filter(c => getExpiryStatus(c.expiryDate).days <= 0).length,
    critical: certificates.filter(c => { const d = getExpiryStatus(c.expiryDate).days; return d > 0 && d <= 30; }).length,
    valid: certificates.filter(c => getExpiryStatus(c.expiryDate).days > 30).length,
  };

  const expiredDocsCount = sortedCrewCerts.filter(cert => cert.expiryDate && cert.expiryDate !== "Unlimited" && Math.ceil((new Date(cert.expiryDate) - new Date()) / 86400000) <= 0).length;
  const criticalDocsCount = sortedCrewCerts.filter(cert => cert.expiryDate && cert.expiryDate !== "Unlimited" && Math.ceil((new Date(cert.expiryDate) - new Date()) / 86400000) > 0 && Math.ceil((new Date(cert.expiryDate) - new Date()) / 86400000) <= 30).length;
  const isSystemAlertActive = expiredDocsCount > 0 || criticalDocsCount > 0;

  const handleSaveCert = async (cert) => {
    if (!fbUser) return;
    const certData = { ...cert };
    const certId = certData.id;
    delete certData.id;

    if (certId) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'certificates', certId), certData);
      showToast("DOKUMEN BERHASIL DIUPDATE");
    } else {
      certData.order = crewCerts.length > 0 ? Math.max(...crewCerts.map(c => c.order !== undefined ? c.order : 0)) + 1 : 0;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'certificates'), certData);
      showToast("DOKUMEN BARU DITAMBAHKAN");
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
        showToast("DOKUMEN DIHAPUS PERMANEN", "success");
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
    let csvContent = "Nama Crew,Rank,Status," + certKeys.map(k => CERT_DICTIONARY[k].replace(/,/g, "")).join(",") + "\n";

    filteredCrews.forEach(crew => {
      let row = `"${crew.name}","${crew.rank}","${crew.status}"`;
      const crewDocs = certificates.filter(c => c.crewId === crew.id);

      certKeys.forEach(key => {
        const expectedName = CERT_DICTIONARY[key].toLowerCase();
        const foundCert = crewDocs.find(c => c.name.toLowerCase() === expectedName);
        if (foundCert) {
          const status = getExpiryStatus(foundCert.expiryDate);
          row += `,"${status.label} (${status.days > 0 ? status.days + ' Hari' : 'Expired'})"`;
        } else {
          row += `,"-"`;
        }
      });
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Crew_Matrix_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    showToast("PREPARING PDF MANIFEST...", "success");

    try {
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      if (!window.jspdf.jsPDF.API.autoTable) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      
      const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
      const certKeys = Object.keys(CERT_DICTIONARY);
      
      const head = [["Nama Crew", "Rank", "Status", ...certKeys.map(k => k.toUpperCase())]];
      
      const body = filteredCrews.map(crew => {
        const row = [crew.name, crew.rank, crew.status];
        const crewDocs = certificates.filter(c => c.crewId === crew.id);
        
        certKeys.forEach(key => {
          const expectedName = CERT_DICTIONARY[key].toLowerCase();
          const foundCert = crewDocs.find(c => c.name.toLowerCase() === expectedName);
          
          if (foundCert) {
            const status = getExpiryStatus(foundCert.expiryDate);
            if (status.days <= 0) {
              row.push("✖ EXPIRED");
            } else if (status.days <= 30) {
              row.push("⚠ WARNING");
            } else {
              row.push("✔ VALID");
            }
          } else {
            row.push("-");
          }
        });
        return row;
      });

      doc.setFontSize(16);
      doc.setTextColor(10, 25, 47);
      doc.text("CREW MATRIX - SHIP MANIFEST", 14, 15);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated by: ${userName || 'System'} | Date: ${new Date().toLocaleString()}`, 14, 22);

      doc.autoTable({
        startY: 28,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255], 
          fontStyle: 'bold', 
          fontSize: 6, 
          halign: 'center' 
        },
        bodyStyles: { 
          textColor: [15, 23, 42], 
          fontSize: 6, 
          halign: 'center' 
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 30 },
          1: { cellWidth: 15 },
          2: { cellWidth: 18 }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: function(data) {
           if (data.section === 'body') {
             const text = data.cell.raw;
             
             if (text === "✔ VALID") {
               data.cell.styles.textColor = [22, 163, 74];
               data.cell.styles.fontStyle = 'bold';
             } else if (text === "⚠ WARNING") {
               data.cell.styles.textColor = [217, 119, 6];
               data.cell.styles.fontStyle = 'bold';
             } else if (text === "✖ EXPIRED") {
               data.cell.styles.textColor = [220, 38, 38];
               data.cell.styles.fontStyle = 'bold';
             }
           }
        },
        styles: { cellPadding: 1.5, overflow: 'linebreak', lineWidth: 0.1, lineColor: [203, 213, 225] },
      });

      doc.save("Ship_Manifest_2026.pdf");
      showToast("PDF MANIFEST BERHASIL DIUNDUH", "success");
      
    } catch (err) {
      console.error("PDF Generation Error:", err);
      showToast("GAGAL MEMBUAT PDF MANIFEST", "error");
    }
  };

  const renderOverviewDashboard = () => {
    const { totalCrews, expired, critical, valid } = globalStats;
    const totalCerts = expired + critical + valid;
    
    const validPct = totalCerts === 0 ? 0 : (valid / totalCerts) * 100;
    const criticalPct = totalCerts === 0 ? 0 : (critical / totalCerts) * 100;
    const expiredPct = totalCerts === 0 ? 0 : (expired / totalCerts) * 100;

    return (
      <div className="space-y-6 md:space-y-8 animate-fadeIn w-full max-w-6xl mx-auto">
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

        <div className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="w-56 h-56 md:w-64 md:h-64 relative flex-shrink-0">
            <style>{`
              @keyframes drawValid {
                0% { stroke-dasharray: 0 100; }
                100% { stroke-dasharray: ${validPct} ${100 - validPct}; }
              }
              @keyframes drawCritical {
                0% { stroke-dasharray: 0 100; }
                100% { stroke-dasharray: ${criticalPct} ${100 - criticalPct}; }
              }
              @keyframes drawExpired {
                0% { stroke-dasharray: 0 100; }
                100% { stroke-dasharray: ${expiredPct} ${100 - expiredPct}; }
              }
              @keyframes revealCounter {
                0% { opacity: 0; transform: scale(0.3); filter: blur(10px); }
                100% { opacity: 1; transform: scale(1); filter: blur(0); }
              }
              .anim-stroke-valid { animation: drawValid 1.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
              .anim-stroke-critical { animation: drawCritical 1.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
              .anim-stroke-expired { animation: drawExpired 1.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
              .anim-counter-reveal { animation: revealCounter 1.5s cubic-bezier(0.1, 0.9, 0.2, 1) 0.5s forwards; opacity: 0; }
            `}</style>

            <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90" style={{ filter: `drop-shadow(0 0 15px ${theme.hex}25)` }}>
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="5"></circle>
              {totalCerts > 0 && (
                <>
                  <circle 
                    cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4ade80" strokeWidth="5" 
                    strokeDashoffset="0" strokeLinecap="round" 
                    className="anim-stroke-valid"
                  ></circle>
                  <circle 
                    cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#facc15" strokeWidth="5" 
                    strokeDashoffset={`-${validPct}`} strokeLinecap="round" 
                    className="anim-stroke-critical"
                  ></circle>
                  <circle 
                    cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f87171" strokeWidth="5" 
                    strokeDashoffset={`-${validPct + criticalPct}`} strokeLinecap="round" 
                    className="anim-stroke-expired"
                  ></circle>
                </>
              )}
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center anim-counter-reveal">
              <Icon name="PieChart" className="mb-1 transition-colors duration-500" size={24} style={{ color: theme.hex, opacity: 0.5 }} />
              <span className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] tracking-tighter">
                {totalCerts}
              </span>
              <span className="text-[9px] text-[#64748b] uppercase tracking-[0.3em] font-bold mt-1.5">
                Total_Certs
              </span>
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

  const renderMatrixView = () => {
    const activeCertKeys = Object.keys(CERT_DICTIONARY).filter(key => {
      const expectedName = CERT_DICTIONARY[key].toLowerCase();
      return filteredCrews.some(crew => {
        const crewDocs = certificates.filter(c => c.crewId === crew.id);
        return crewDocs.some(c => c.name.toLowerCase() === expectedName);
      });
    });

    return (
      <div className="w-full h-full flex flex-col relative z-20">
        <style>{`
          @keyframes gridSlideUp {
            0% { opacity: 0; transform: translateY(100px); filter: blur(10px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
          .anim-grid-reveal {
            animation: gridSlideUp 1.2s cubic-bezier(0.05, 0.95, 0.05, 1) forwards;
          }
          .row-hover-neon:hover td:first-child::before {
            content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
            background: var(--neon-cyan);
            box-shadow: 0 0 10px var(--neon-cyan);
            z-index: 50;
          }
        `}</style>

        <div className="anim-grid-reveal glass-panel rounded-xl border border-white/10 overflow-hidden flex-1 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative bg-[#050A15]/80">
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-white/5 to-transparent">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff]/50 to-transparent"></div>
            
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-3 relative z-10">
              <Icon name="Grid" className={`${theme.main}`} size={20} /> 
              <span className="uppercase tracking-[0.2em] font-light">
                Matrix <b className="font-black">View</b>
              </span>
            </h3>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-black/40 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse shadow-[0_0_5px_#00e5ff]"></div>
              <span className="text-[9px] font-mono text-[#00e5ff] tracking-widest uppercase">Live_Sync: Active</span>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1 custom-scrollbar pb-4 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-30 bg-[#0A1128]/95 backdrop-blur-md border-b border-white/10 shadow-md">
                <tr>
                  <th className={`sticky left-0 top-0 z-40 bg-[#0A1128]/95 backdrop-blur-md p-3 md:p-4 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.3)] ${theme.main}`}>
                    <div className="flex items-center gap-2">
                      <Icon name="Users" size={14} /> Identity / Rank
                    </div>
                  </th>
                  {activeCertKeys.map(key => (
                    <th 
                      key={key} 
                      className="p-3 text-[9px] md:text-[10px] font-mono text-gray-400 uppercase tracking-[0.1em] whitespace-nowrap text-center border-x border-white/5 hover:text-white hover:bg-white/5 transition-colors cursor-default"
                      title={CERT_DICTIONARY[key]}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCrews.map((crew, index) => {
                  const crewDocs = certificates.filter(c => c.crewId === crew.id);
                  return (
                    <tr 
                      key={crew.id} 
                      className="row-hover-neon hover:bg-white/[0.02] transition-all duration-300 group relative"
                      style={{ animationDelay: `${index * 0.05}s` }} 
                    >
                      <td className="sticky left-0 z-20 bg-[#050A15] p-3 md:p-4 border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.2)] group-hover:bg-[#0A1128] transition-colors relative">
                        <div className="flex items-center gap-3">
                          <div className={`font-semibold text-white text-xs md:text-sm whitespace-nowrap truncate max-w-[150px] md:max-w-[180px] transition-colors drop-shadow-md group-hover:${theme.main}`} title={crew.name}>
                            {crew.name}
                          </div>
                        </div>
                        <div className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-500 whitespace-nowrap mt-1">
                          {crew.rank}
                        </div>
                      </td>
                      
                      {activeCertKeys.map(key => {
                        const expectedName = CERT_DICTIONARY[key];
                        const foundCert = crewDocs.find(c => c.name.toLowerCase() === expectedName.toLowerCase());
                        
                        if (foundCert) {
                          const status = getExpiryStatus(foundCert.expiryDate);
                          return (
                            <td key={key} className="p-2 border-x border-white/5 relative z-10 transition-colors group-hover:border-white/10">
                              <div 
                                title={`${expectedName}\nStatus: ${status.label}\nSisa: ${status.days > 0 ? status.days + ' Hari' : 'Kedaluwarsa'}`}
                                className={`mx-auto w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center cursor-help transition-all duration-300 group-hover:scale-110 ${status.bg} border border-white/10 relative overflow-hidden`}
                              >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-white/20 to-transparent transition-opacity duration-300"></div>
                                <div className="scale-75 md:scale-100 relative z-10">{status.icon}</div>
                              </div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={key} className="p-2 text-center border-x border-white/5 relative z-10">
                            <div 
                              title={`${expectedName} (Kosong)`}
                              className="mx-auto w-7 h-7 md:w-8 md:h-8 rounded-md bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center transition-colors group-hover:border-white/20 group-hover:bg-white/5"
                            >
                              <span className="text-gray-600/50 text-[10px] font-mono group-hover:text-gray-400 transition-colors">-</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                
                {filteredCrews.length === 0 && (
                  <tr>
                    <td colSpan={activeCertKeys.length + 1} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <Icon name="Activity" size={40} className={`mb-4 animate-pulse ${theme.main}`} />
                        <p className={`text-xs font-mono tracking-widest uppercase mb-1 ${theme.main}`}>Grid Empty</p>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                          {crews.length === 0 ? "Database kosong. Silakan tambah crew." : "Tidak ada crew yang sesuai filter."}
                        </p>
                      </div>
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
            <div className="flex items-center justify-center overflow-hidden relative py-1 md:py-2">
              <style>{`
                @keyframes descendZoom {
                  0% { opacity: 0; transform: translateY(-30px) scale(1.15); filter: blur(8px); }
                  30% { opacity: 0.8; filter: blur(2px); }
                  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }
                .anim-descend-zoom { animation: descendZoom 2.5s cubic-bezier(0.05, 0.9, 0.1, 1) forwards; }
              `}</style>
              <div className="anim-descend-zoom flex items-center justify-center">
                <h1 className="font-light text-xl md:text-2xl tracking-[0.25em] uppercase m-0 leading-none text-white drop-shadow-lg flex items-center">
                  CREW 
                  <b className="font-black text-white ml-2 md:ml-2.5 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    MATRIX
                  </b>
                </h1>
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
            <div className="overflow-y-auto flex-1 pr-2 pb-4">
              <div className="mb-8 px-1">
                <p className="text-[8px] text-[#475569] font-bold tracking-[0.3em] uppercase mb-4 ml-1">
                  Main Menu
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCurrentView("overview");
                      setSelectedCrewId(null);
                    }}
                    className={`relative flex flex-col items-start p-3.5 border rounded-xl active:scale-105 transition-all duration-300 group cursor-pointer text-left overflow-hidden ${
                      currentView === "overview"
                        ? `bg-gradient-to-br ${theme.bgLight} to-transparent ${theme.borderSoft}`
                        : "bg-[#0a0d14] border-white/5 hover:border-white/20 hover:bg-white/[0.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                    }`}
                    style={currentView === "overview" ? { boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 15px ${theme.hex}25` } : {}}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors duration-300 ${
                      currentView === "overview" ? `${theme.bgLight} ${theme.main}` : "bg-white/5 text-[#64748b] group-hover:text-white"
                    }`}>
                      <Icon name="Home" size={16} />
                    </div>
                    <span className={`text-[9.5px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${
                      currentView === "overview" ? theme.main : "text-gray-400 group-hover:text-white"
                    }`} style={currentView === "overview" ? { filter: `drop-shadow(0 0 5px ${theme.hex}80)` } : {}}>
                      Overview
                    </span>
                    <span className="text-[#64748b] text-[6.5px] font-mono uppercase tracking-[0.2em] leading-tight">
                      Global_Status
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView("matrix");
                      setSelectedCrewId(null);
                    }}
                    className={`relative flex flex-col items-start p-3.5 border rounded-xl active:scale-105 transition-all duration-300 group cursor-pointer text-left overflow-hidden ${
                      currentView === "matrix"
                        ? `bg-gradient-to-br ${theme.bgLight} to-transparent ${theme.borderSoft}`
                        : "bg-[#0a0d14] border-white/5 hover:border-white/20 hover:bg-white/[0.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                    }`}
                    style={currentView === "matrix" ? { boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 15px ${theme.hex}25` } : {}}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors duration-300 ${
                      currentView === "matrix" ? `${theme.bgLight} ${theme.main}` : "bg-white/5 text-[#64748b] group-hover:text-white"
                    }`}>
                      <Icon name="Grid" size={16} />
                    </div>
                    <span className={`text-[9.5px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 ${
                      currentView === "matrix" ? theme.main : "text-gray-400 group-hover:text-white"
                    }`} style={currentView === "matrix" ? { filter: `drop-shadow(0 0 5px ${theme.hex}80)` } : {}}>
                      Matrix
                    </span>
                    <span className="text-[#64748b] text-[6.5px] font-mono uppercase tracking-[0.2em] leading-tight">
                      Full_Grid
                    </span>
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mb-3 px-1">
                
                <p className={`text-[8.5px] font-mono tracking-[0.25em] uppercase mb-3 ml-1 flex items-center gap-2 ${theme.main}`}>
                  <span className="w-1 h-1 rounded-full bg-current animate-pulse shadow-[0_0_6px_currentColor]"></span>
                  [ DATABASE_NAVIGATION ]
                </p>
                
                <div className="mb-4 space-y-2.5">
                  <div className="relative group">
                    <Icon 
                      name="Search" 
                      size={13} 
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 z-10 ${
                        searchQuery ? 'text-[#00e5ff] drop-shadow-[0_0_5px_#00e5ff]' : 'text-slate-500 group-hover:text-slate-400'
                      }`} 
                    />
                    
                    <input 
                      type="text"
                      placeholder="SCAN IDENTITY QUERY..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 px-3 pl-9 py-2 text-xs font-mono text-slate-200 rounded-md focus:outline-none focus:bg-[#00e5ff]/5 focus:border-[#00e5ff]/20 transition-all placeholder-gray-600 shadow-inner"
                    />
                    
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-focus-within:border-[#00e5ff]/50 transition-colors duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/10 group-focus-within:border-[#00e5ff]/50 transition-colors duration-300"></div>
                  </div>
                  
                  <div className="flex bg-black/50 p-1 rounded-lg border border-white/5 relative overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
                    <button 
                      type="button"
                      onClick={() => setFilterStatus("all")}
                      className={`flex-1 py-1.5 rounded-md text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 focus:outline-none ${
                        filterStatus === "all" 
                          ? `text-white bg-[#00e5ff]/10 border border-[#00e5ff]/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]` 
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                    >
                      {filterStatus === "all" && (
                        <span className="w-1 h-1 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff] animate-pulse"></span>
                      )}
                      Semua
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setFilterStatus("expired")}
                      className={`flex-1 py-1.5 rounded-md text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 focus:outline-none ${
                        filterStatus === "expired" 
                          ? "text-white bg-rose-500/10 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]" 
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                    >
                      {filterStatus === "expired" && (
                        <span className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse"></span>
                      )}
                      Expired
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setFilterStatus("critical")}
                      className={`flex-1 py-1.5 rounded-md text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 focus:outline-none ${
                        filterStatus === "critical" 
                          ? "text-white bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]" 
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                    >
                      {filterStatus === "critical" && (
                        <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse"></span>
                      )}
                      Kritis
                    </button>
                  </div>
                </div>
              </div>

              <style>{`
                @supports (animation-timeline: view()) {
                  @keyframes cinematic-scroll {
                    0% { opacity: 0; transform: translateY(30px) scale(0.85); filter: blur(8px); }
                    15% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
                    85% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
                    100% { opacity: 0; transform: translateY(-30px) scale(0.85); filter: blur(8px); }
                  }
                  .scroll-fx-2026 {
                    animation: cinematic-scroll linear both;
                    animation-timeline: view();
                    animation-range: cover 0% cover 100%;
                    will-change: transform, opacity, filter;
                  }
                }
              `}</style>

              {filteredCrews.map((crew) => {
                const crewDocs = certificates.filter(c => c.crewId === crew.id);
                let dotColor = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]";

                const hasExpired = crewDocs.some(c => {
                  if (c.expiryDate === "Unlimited" || !c.expiryDate) return false;
                  const diffDays = Math.ceil((new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return diffDays <= 0;
                });
                const hasCritical = crewDocs.some(c => {
                  if (c.expiryDate === "Unlimited" || !c.expiryDate) return false;
                  const diffDays = Math.ceil((new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return diffDays > 0 && diffDays <= 30;
                });

                if (hasExpired) dotColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
                else if (hasCritical) dotColor = "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]";

                const isActive = currentView === "crew" && selectedCrewId === crew.id;
                
                const isDraggingCert = draggedCertId === cert.id;
                const isDragOverCert = dragOverCertId === cert.id;

                // Logika Pencarian Singkatan untuk Mobile (Prioritas Teks Dalam Kurung)
                let shortCertName = cert.name;
                const match = cert.name.match(/\(([^)]+)\)/); // Melacak teks di dalam kurung (...)
                
                if (match) {
                  shortCertName = match[1].toUpperCase(); // Hasil: "BUKU PELAUT", "BST", "MCU"
                } else {
                  // Fallback jika tidak ada kurung: ambil dari key dictionary
                  const dictKey = Object.keys(CERT_DICTIONARY).find(key => CERT_DICTIONARY[key].toLowerCase() === cert.name.toLowerCase());
                  if (dictKey) shortCertName = dictKey.toUpperCase();
                }

                return (
                  <div
                    key={cert.id}
                  >
                    <div className="flex items-center flex-1 truncate pointer-events-none">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all duration-300 border border-white/20 group-hover/crew:border-white/50 shadow-inner
                        ${isActive ? `bg-white/20 text-[#00e5ff] shadow-[0_0_15px_#00e5ff]` : `bg-[#0B0D10] text-[#E2E8F0]`}
                        ${isDragOver ? 'border-[#00e5ff] shadow-[0_0_15px_#00e5ff] text-[#00e5ff]' : ''}
                      `}>
                        {crew.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col ml-3 truncate flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xs tracking-[0.15em] font-semibold uppercase truncate transition-colors duration-300 ${isActive || isDragOver ? 'text-white' : 'text-[#e2e8f0] group-hover/crew:text-white'}`}>
                            {crew.name}
                          </h3>
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse ${dotColor}`}></div>
                        </div>
                        <span className={`font-mono text-[9px] tracking-widest truncate ${theme.main}`}>
                          {crew.rank}
                        </span>
                      </div>
                    </div>

                    {isPip && (
                      <div className={`flex items-center gap-1.5 transition-opacity duration-300 flex-shrink-0 relative z-10 pr-2 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="p-1 text-slate-600 hover:text-white transition-colors cursor-grab active:cursor-grabbing mr-1" title="Tahan & Geser (Drag)">
                          <Icon name="Menu" size={12} />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleStartEditCrew(crew); }} className={`p-1.5 text-slate-500 hover:${theme.main} hover:bg-white/10 transition-colors rounded-md shadow-inner`} title="Edit">
                          <Icon name="Edit2" size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCrew(crew.id); }} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-white/10 transition-colors rounded-md shadow-inner" title="Hapus">
                          <Icon name="Trash2" size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredCrews.length === 0 && (
                <div className="text-center p-4 text-slate-600 text-xs mt-4 border border-dashed border-slate-400/50 rounded-lg bg-white/5">
                  {crews.length === 0 ? "Database kosong. Silakan tambah crew." : "Tidak ada crew yang sesuai filter."}
                </div>
              )}
            </div>
          </div>
          
          {isPip && (
            <div className="p-4 border-t border-white/5 bg-black/20 pb-6 md:pb-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff]/20 to-transparent"></div>
              <p className={`text-[8.5px] font-mono mb-2.5 uppercase tracking-[0.2em] flex items-center gap-2 ${theme.main}`}>
                <Icon name="UserPlus" size={11} className="opacity-70" /> 
                {editingCrewId ? "[ override_data ]" : "[ register_new_crew ]"}
              </p>
              <form onSubmit={handleSaveCrew} className="space-y-2">
                <div className="relative group">
                  <input type="text" value={inputCrewName} onChange={(e) => setInputCrewName(e.target.value)} placeholder="input identity..." className="w-full bg-black/30 border border-white/5 border-b-white/10 px-3 py-2 text-xs font-mono font-medium text-slate-200 rounded-md focus:outline-none focus:bg-[#00e5ff]/5 focus:border-[#00e5ff]/30 transition-all placeholder-gray-750" required />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] transition-all duration-500 group-focus-within:w-full z-10"></div>
                </div>
                <div className="flex gap-2">
                  <div className="relative group flex-1">
                    <input type="text" value={inputCrewRank} onChange={(e) => setInputCrewRank(e.target.value)} placeholder="input rank..." className="w-full bg-black/30 border border-white/5 border-b-white/10 px-3 py-2 text-xs font-mono font-medium text-slate-200 rounded-md focus:outline-none focus:bg-[#00e5ff]/5 focus:border-[#00e5ff]/30 transition-all placeholder-gray-750" required />
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] transition-all duration-500 group-focus-within:w-full z-10"></div>
                  </div>
                  <button type="submit" className="px-3 rounded-md border border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/5 hover:bg-[#00e5ff]/20 hover:text-white hover:border-[#00e5ff] transition-all duration-300 font-mono text-[9px] font-bold tracking-widest flex items-center justify-center relative overflow-hidden group min-w-[65px]" title={editingCrewId ? "SIMPAN OVERRIDE" : "EKSEKUSI PENAMBAHAN"}>
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-500"></div>
                    {editingCrewId ? "UPDT" : "EXEC"}
                  </button>
                  {editingCrewId && (
                    <button type="button" onClick={() => { setEditingCrewId(null); setInputCrewName(""); setInputCrewRank(""); }} className="px-2 bg-rose-950/30 text-rose-500 border border-rose-500/20 rounded-md hover:bg-rose-900/50 transition-colors flex items-center justify-center">
                      <Icon name="X" size={12} />
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
        <div ref={glowRef} className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300" style={{ background: `radial-gradient(600px circle at 0px 0px, ${theme?.hex}15, transparent 40%)` }} />

        <header className="glass-panel !border-x-0 !border-t-0 !rounded-none px-4 md:px-8 py-4 md:py-6 z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 lg:gap-0 border-b border-white/5 shadow-md relative">
          <div className="flex items-center gap-4 md:gap-7 w-full min-w-0 overflow-hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl hover:bg-white/10 transition-all duration-300 z-10 relative ${theme.main}`} style={{ boxShadow: `0 0 15px ${theme.hex}33` }}>≡</button>

            <div className="flex flex-col justify-center overflow-hidden h-full flex-1">
              <style>{`
                @keyframes openBracketLeft { 0% { transform: translateX(35px); opacity: 0; text-shadow: 0 0 25px #d946ef; filter: blur(4px); } 15% { opacity: 1; filter: blur(0); text-shadow: 0 0 15px #d946ef; } 100% { transform: translateX(0); opacity: 1; text-shadow: 0 0 5px rgba(217,70,239,0.5); } }
                @keyframes openBracketRight { 0% { transform: translateX(-35px); opacity: 0; text-shadow: 0 0 25px #d946ef; filter: blur(4px); } 15% { opacity: 1; filter: blur(0); text-shadow: 0 0 15px #d946ef; } 100% { transform: translateX(0); opacity: 1; text-shadow: 0 0 5px rgba(217,70,239,0.5); } }
                @keyframes holoRevealBreath { 0% { opacity: 0; filter: blur(20px); transform: scale(0.85); letter-spacing: -4px; text-shadow: 0 0 40px var(--neon-cyan); } 25% { opacity: 0.9; filter: blur(2px); transform: scale(1.02); letter-spacing: 4px; text-shadow: 0 0 20px var(--neon-cyan); } 100% { opacity: 1; filter: blur(0); transform: scale(1); letter-spacing: normal; text-shadow: 0 0 10px rgba(255,255,255,0.2); } }
                @keyframes systemBootUp { 0% { opacity: 0; transform: translateY(15px); filter: saturate(0) brightness(0.5); } 100% { opacity: 1; transform: translateY(0); filter: saturate(1) brightness(1); } }
                .anim-bracket-l { animation: openBracketLeft 2.5s cubic-bezier(0.02, 0.98, 0.02, 1) 0.4s forwards; }
                .anim-bracket-r { animation: openBracketRight 2.5s cubic-bezier(0.02, 0.98, 0.02, 1) 0.4s forwards; }
                .anim-hero-text { animation: holoRevealBreath 4s cubic-bezier(0.05, 0.95, 0.05, 1) 0.6s forwards; }
                .anim-metadata  { animation: systemBootUp 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 1.2s forwards; }
              `}</style>
              <div key={currentView + (selectedCrewId || 'default')} className="flex items-center mt-1 w-fit max-w-full">
                <span className="anim-bracket-l opacity-0 text-fuchsia-500 text-2xl md:text-3xl font-light flex-shrink-0">[</span>
                <div className="anim-hero-text opacity-0 flex items-center px-3 md:px-4 min-w-0 truncate">
                  <div className="hidden sm:flex items-center mr-3 bg-black/40 border border-white/10 px-2.5 py-1 rounded-md shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full mr-2 animate-pulse" style={{ backgroundColor: theme.hex, boxShadow: `0 0 8px ${theme.hex}` }}></div>
                    <span className="text-gray-300 text-[9px] md:text-[10px] font-mono tracking-[0.2em] uppercase whitespace-nowrap">{currentView === "overview" ? "SYS_DASHBOARD" : currentView === "matrix" ? "GRID_MATRIX" : "CREW_DATA"}</span>
                  </div>
                  <span className="hidden sm:inline-block mr-3 font-mono text-sm md:text-base font-bold opacity-80" style={{ color: theme.hex, textShadow: `0 0 10px ${theme.hex}` }}>//</span>
                  <h4 className="font-black text-white text-lg md:text-xl uppercase m-0 leading-none truncate transition-all drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] tracking-[0.1em]">{currentView === "overview" ? "OVERVIEW" : currentView === "matrix" ? "FULL_GRID" : (selectedCrew?.name || "UNKNOWN")}</h4>
                </div>
                <span className="anim-bracket-r opacity-0 text-fuchsia-500 text-2xl md:text-3xl font-light flex-shrink-0">]</span>
              </div>
              <div className="anim-metadata opacity-0 flex flex-wrap items-center gap-4 mt-2.5 pl-3 md:pl-4 w-full select-none text-[10px] font-mono tracking-wider">
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-md shadow-inner group hover:border-[#00e5ff]/20 transition-colors">
                  <Icon name="Activity" size={11} className={`${theme.main} animate-pulse drop-shadow-[0_0_4px_currentColor]`} />
                  <span className="text-slate-500 uppercase tracking-[0.15em]">NODE //</span>
                  <span className={`${theme.main} font-bold uppercase tracking-[0.1em] drop-shadow-[0_0_8px_currentColor]`}>{currentView === "overview" ? "GLOBAL_STATS" : currentView === "matrix" ? "MATRIX_GRID" : "CREW_PROFILE"}</span>
                </div>
                <span className="text-slate-700 font-light scale-y-125 select-none hidden sm:inline">/</span>
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-md shadow-inner group hover:border-fuchsia-500/20 transition-colors">
                  <Icon name="User" size={11} className="text-slate-400 group-hover:text-fuchsia-400 transition-colors" />
                  <span className="text-slate-500 uppercase tracking-[0.15em]">OP //</span>
                  <span className="text-slate-200 font-bold uppercase tracking-[0.1em]">{userName || "GUEST_OP"}</span>
                </div>
                <div className="hidden sm:block h-4 w-[1px] bg-gradient-to-b from-slate-700 via-slate-500 to-slate-700 mx-1"></div>
                <div className="flex items-center gap-2.5 bg-black/40 border border-white/10 px-3 py-1 rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] ml-auto relative group overflow-hidden">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] pr-1 border-r border-white/10 leading-none">SYS_THEME</span>
                  <div className="flex items-center gap-2 z-10 relative">
                    <button onClick={() => setActiveTheme("cyan")} className={`w-3.5 h-3.5 rounded-full relative flex items-center justify-center transition-all duration-300 focus:outline-none ${activeTheme === "cyan" ? "bg-cyan-400 scale-110 shadow-[0_0_10px_#22d3ee]" : "bg-cyan-500/60 hover:bg-cyan-400 hover:scale-110 shadow-[0_0_5px_rgba(34,211,238,0.3)]"}`}>{activeTheme === "cyan" && <div className="absolute -inset-[3px] rounded-full border border-cyan-400/50 animate-spin" style={{ animationDuration: '6s' }}></div>}</button>
                    <button onClick={() => setActiveTheme("emerald")} className={`w-3.5 h-3.5 rounded-full relative flex items-center justify-center transition-all duration-300 focus:outline-none ${activeTheme === "emerald" ? "bg-emerald-400 scale-110 shadow-[0_0_10px_#34d399]" : "bg-emerald-500/60 hover:bg-emerald-400 hover:scale-110 shadow-[0_0_5px_rgba(52,211,153,0.3)]"}`}>{activeTheme === "emerald" && <div className="absolute -inset-[3px] rounded-full border border-emerald-400/50 animate-spin" style={{ animationDuration: '6s' }}></div>}</button>
                    <button onClick={() => setActiveTheme("amber")} className={`w-3.5 h-3.5 rounded-full relative flex items-center justify-center transition-all duration-300 focus:outline-none ${activeTheme === "amber" ? "bg-amber-400 scale-110 shadow-[0_0_10px_#fbbf24]" : "bg-amber-500/60 hover:bg-amber-400 hover:scale-110 shadow-[0_0_5px_rgba(251,191,36,0.3)]"}`}>{activeTheme === "amber" && <div className="absolute -inset-[3px] rounded-full border border-amber-400/50 animate-spin" style={{ animationDuration: '6s' }}></div>}</button>
                  </div>
                  <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-out z-0 pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* AREA TOMBOL KANAN ATAS (SETTINGS, EXPORT, ADD CERT) */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full lg:w-auto mt-4 lg:mt-0 relative z-40">
            
            {/* SEMUA TOMBOL INI HANYA MUNCUL JIKA USER ADALAH ADMIN (PIP) */}
            {isPip && (
              <>
                <button onClick={() => setIsSettingsOpen(true)} className="w-full md:w-auto h-[38px] px-4 flex items-center justify-center text-gray-400 bg-white/[0.02] border border-white/10 rounded-full hover:bg-white/10 hover:text-[#00e5ff] hover:border-[#00e5ff]/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] active:scale-95 transition-all duration-300 backdrop-blur-md cursor-pointer" title="System Settings">
                  <Icon name="Settings" size={16} />
                </button>
                
                <button onClick={exportToCSV} className="w-full md:w-auto h-[38px] px-6 flex items-center justify-center gap-2.5 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-[#00e5ff]/70 bg-gradient-to-r from-[#00e5ff]/5 to-transparent border border-[#00e5ff]/30 rounded-full hover:bg-[#00e5ff]/15 hover:text-white hover:border-[#00e5ff] hover:shadow-[0_0_20px_rgba(0,229,255,0.4),inset_0_0_10px_rgba(0,229,255,0.2)] active:scale-95 transition-all duration-300 backdrop-blur-md group overflow-hidden relative cursor-pointer">
                  <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out z-0"></div>
                  <div className="relative z-10 group-hover:-translate-y-0.5 group-hover:text-[#00e5ff] transition-transform duration-300"><Icon name="Download" size={14} /></div>
                  <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_#00e5ff] transition-all">CSV</span>
                </button>
                
                <button onClick={exportToPDF} className="w-full md:w-auto h-[38px] px-6 flex items-center justify-center gap-2.5 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-fuchsia-400 bg-gradient-to-r from-fuchsia-500/5 to-transparent border border-fuchsia-500/30 rounded-full hover:bg-fuchsia-500/15 hover:text-white hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.4),inset_0_0_10px_rgba(217,70,239,0.2)] active:scale-95 transition-all duration-300 backdrop-blur-md group overflow-hidden relative cursor-pointer">
                  <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out z-0"></div>
                  <div className="relative z-10 group-hover:-translate-y-0.5 group-hover:text-fuchsia-400 transition-transform duration-300"><Icon name="FileDown" size={14} /></div>
                  <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_#d946ef] transition-all whitespace-nowrap">PDF MANIFEST</span>
                </button>
              </>
            )}

            {/* TOMBOL ADD CERTIFICATE (Juga Hanya Untuk PIP) */}
            {isPip && currentView === "crew" && selectedCrew && (
              <button onClick={() => { setEditingCert(null); setIsModalOpen(true); }} className="w-full md:w-auto h-[38px] relative group rounded-full p-[1.5px] bg-gradient-to-r from-fuchsia-500 to-[#00e5ff] shadow-[0_0_20px_rgba(217,70,239,0.25)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] active:scale-95 active:shadow-[0_0_40px_rgba(0,229,255,0.7)] transition-all duration-300 cursor-pointer">
                <div className="relative h-full w-full bg-[#05070a] px-6 rounded-full transition-colors duration-300 group-hover:bg-[#0b111a] group-active:bg-[#00e5ff]/10 flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white group-hover:from-fuchsia-400 group-hover:to-[#00e5ff] text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 drop-shadow-sm flex items-center whitespace-nowrap">
                    Add Certificate <span className="text-[#00e5ff] group-hover:text-white transition-colors duration-300 ml-1">+</span>
                  </span>
                </div>
              </button>
            )}
          </div>
        </header>

        <div key={currentView + (selectedCrewId || '')} className="flex-1 overflow-y-auto p-4 md:p-8 z-10 pb-20 md:pb-8 relative anim-crt-wipe custom-scrollbar">
          {currentView === "overview" ? renderOverviewDashboard() : currentView === "matrix" ? renderMatrixView() : (
            <>
              {selectedCrew && (
                <>
                  <div className="w-full mb-6 pt-5 px-2 relative z-20 group select-none">
                    <style>{`
                      @keyframes sweepLeft { 0% { transform: translateX(-100%); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(200%); opacity: 0; } }
                      @keyframes traceCartridge { 0% { stroke-dashoffset: 400; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
                      .anim-laser-sweep { animation: sweepLeft 3s infinite cubic-bezier(0.4, 0, 0.2, 1); }
                      .anim-laser-trace { stroke-dasharray: 80 400; animation: traceCartridge 3s infinite cubic-bezier(0.4, 0, 0.2, 1); }
                    `}</style>
                    <div className="relative w-full h-[40px] mb-4">
                      <div className="absolute left-0 bottom-[10px] h-[1.5px] w-[calc(100%-220px)]" style={{ backgroundColor: `rgba(${isSystemAlertActive ? '244,63,94' : '0,229,255'}, 0.2)` }}>
                        <h4 className="absolute bottom-1.5 left-0 font-light text-lg md:text-xl tracking-[0.25em] uppercase m-0 leading-none transition-colors duration-700" style={{ color: isSystemAlertActive ? '#f43f5e' : '#00e5ff', textShadow: `0 0 8px rgba(${isSystemAlertActive ? '244,63,94' : '0,229,255'}, 0.4)` }}>SYSTEM <b className="font-black">ALERT</b></h4>
                        <div className="absolute top-0 left-0 w-1/2 h-full anim-laser-sweep" style={{ background: `linear-gradient(90deg, transparent, ${isSystemAlertActive ? '#f43f5e' : '#00e5ff'}, transparent)`, boxShadow: `0 0 10px ${isSystemAlertActive ? '#f43f5e' : '#00e5ff'}` }}></div>
                      </div>
                      <div className="absolute right-0 bottom-0 w-[220px] h-[40px]">
                        <svg viewBox="0 0 220 40" className="absolute inset-0 w-full h-full pointer-events-none z-20">
                          <path d="M 0 30 L 10 30 L 16 18 L 26 38 L 32 30 L 50 30 L 65 5 L 219 5" fill="none" stroke={isSystemAlertActive ? "rgba(244,63,94,0.3)" : "rgba(0,229,255,0.3)"} strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M 0 30 L 10 30 L 16 18 L 26 38 L 32 30 L 50 30 L 65 5 L 219 5" fill="none" stroke={isSystemAlertActive ? "#f43f5e" : "#00e5ff"} strokeWidth="2" strokeLinejoin="round" className="anim-laser-trace" style={{ filter: `drop-shadow(0 0 6px ${isSystemAlertActive ? '#f43f5e' : '#00e5ff'})` }} />
                        </svg>
                        <div className="absolute right-[2px] bottom-[10px] w-[170px] h-[25px] bg-black/60 backdrop-blur-md z-10 flex items-center justify-end px-3 transition-colors duration-700" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% 100%, 0 100%)', borderBottom: `1.5px solid rgba(${isSystemAlertActive ? '244,63,94' : '0,229,255'}, 0.4)` }}>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]">Sertifikat</span>
                            <span className="text-xs opacity-70 font-bold -mt-0.5" style={{ color: isSystemAlertActive ? '#f43f5e' : '#00e5ff' }}>:</span>
                            <span className="text-base md:text-lg font-black font-mono leading-none tracking-widest transition-colors" style={{ color: isSystemAlertActive ? '#f43f5e' : '#00e5ff', textShadow: `0 0 8px ${isSystemAlertActive ? '#f43f5e' : '#00e5ff'}` }}>{totalSertifikatInti < 10 ? `0${totalSertifikatInti}` : totalSertifikatInti}</span>
                          </div>
                        </div>
                        <div className="absolute right-0 bottom-[10px] w-[2.5px] h-[25px] z-20 transition-colors duration-700" style={{ backgroundColor: isSystemAlertActive ? '#f43f5e' : '#00e5ff', boxShadow: `0 0 10px ${isSystemAlertActive ? '#f43f5e' : '#00e5ff'}` }}></div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-8 md:gap-16 items-start pl-1 mt-1">
                      {isSystemAlertActive ? (
                        <>
                          {expiredDocsCount > 0 && (
                            <div className="flex flex-row items-center gap-3">
                              <span className="text-3xl md:text-4xl font-black text-rose-500 leading-none">{expiredDocsCount}</span>
                              <div className="flex flex-col mt-1"><span className="text-slate-400 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium leading-tight">Dokumen</span><span className="text-rose-500 text-[10px] tracking-widest uppercase font-bold leading-tight">Expired</span></div>
                            </div>
                          )}
                          {criticalDocsCount > 0 && (
                            <div className="flex flex-row items-center gap-3">
                              <span className="text-3xl md:text-4xl font-black text-amber-400 leading-none">{criticalDocsCount}</span>
                              <div className="flex flex-col mt-1"><span className="text-slate-400 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium leading-tight">Dokumen</span><span className="text-amber-500 text-[10px] tracking-widest uppercase font-bold leading-tight">Kritis (&le; 30 Hr)</span></div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse shadow-[0_0_6px_#00e5ff]"></div>
                          <span className="text-[#64748b] text-[9px] md:text-[10px] tracking-[0.25em] uppercase font-mono mt-0.5">Semua dokumen <span className="text-[#00e5ff] font-bold">Valid & Aman</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <style>{`
                @keyframes acrylic-glare { 0% { left: -100%; opacity: 0; } 20% { opacity: 0.3; } 100% { left: 200%; opacity: 0; } }
                @keyframes liquid-flow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .anim-acrylic-glare:hover::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); transform: skewX(-25deg); animation: acrylic-glare 1s ease-out; z-index: 50; pointer-events: none; }
                .anim-liquid-neon { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: liquid-flow 1.5s linear infinite; }
                @supports (animation-timeline: view()) {
                  @keyframes holographic-grid { 0% { opacity: 0; transform: perspective(1000px) rotateX(-15deg) translateY(60px) scale(0.85); filter: blur(10px); } 15% { opacity: 1; transform: perspective(1000px) rotateX(0deg) translateY(0) scale(1); filter: blur(0px); } 85% { opacity: 1; transform: perspective(1000px) rotateX(0deg) translateY(0) scale(1); filter: blur(0px); } 100% { opacity: 0; transform: perspective(1000px) rotateX(15deg) translateY(-60px) scale(0.85); filter: blur(10px); } }
                  .scroll-grid-2026 { animation: holographic-grid linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; will-change: transform, opacity, filter; }
                }
              `}</style>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 animate-fadeIn relative z-20">
                {displayCerts.length > 0 ? (
                  displayCerts.map((cert, index) => {
                    const status = getExpiryStatus(cert.expiryDate);
                    const isExpired = status.days <= 0;
                    
                    const isDraggingCert = draggedCertId === cert.id;
                    const isDragOverCert = dragOverCertId === cert.id;

                    return (
                      <div 
                        key={cert.id} 
                        draggable={isPip}
                        onDragStart={(e) => handleCertDragStart(e, cert.id)}
                        onDragOver={(e) => handleCertDragOver(e, cert.id)}
                        onDragLeave={handleCertDragLeave}
                        onDrop={(e) => handleCertDrop(e, cert.id)}
                        onDragEnd={() => { setDraggedCertId(null); setDragOverCertId(null); }}
                        className={`scroll-grid-2026 anim-acrylic-glare rounded-xl p-4 md:p-5 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group cursor-default bg-[#050A15]/80 backdrop-blur-xl border shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_15px_30px_rgba(0,0,0,0.8)]
                          ${isPip ? 'active:cursor-grabbing' : ''}
                          ${isDraggingCert ? 'opacity-40 scale-90 blur-[2px] border-dashed border-[#00e5ff]/50' : 'border-white/10 hover:border-[currentColor] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_15px_currentColor]'}
                          ${isDragOverCert ? 'border-[2px] border-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.6)] scale-[1.05] z-50 bg-[#00e5ff]/10' : ''}
                        `} 
                        style={{ color: status.hex || (isExpired ? '#f43f5e' : status.days <= 30 ? '#fbbf24' : '#00e5ff') }}
                      >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_10px_currentColor]"></div>
                        {isExpired && <div className="absolute top-1/2 left-0 w-full h-[1px] bg-rose-500/80 transform -translate-y-1/2 -rotate-12 pointer-events-none z-20 shadow-[0_0_10px_#e11d48]"></div>}
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-300 shadow-inner ${isExpired ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-white/5 border-white/10 text-gray-300 group-hover:bg-[currentColor]/10 group-hover:border-[currentColor]/30 group-hover:text-white'}`}><Icon name="FileText" size={18} /></div>
                            <div className="min-w-0 flex-1 pr-2">
                              <h4 className="font-bold text-white text-sm md:text-base leading-tight truncate drop-shadow-md" title={cert.name}>
                                {/* Nama Lengkap untuk Desktop (Layar Menengah ke Atas) */}
                                <span className="hidden md:inline">{cert.name}</span>
                                {/* Nama Singkat/Kode untuk HP (Layar Kecil) */}
                                <span className="inline md:hidden tracking-widest text-[#00e5ff]">{shortCertName}</span>
                              </h4>
                              <p className="text-[10px] md:text-xs text-gray-400 font-mono mt-0.5 truncate tracking-wider group-hover:text-gray-300 transition-colors">ID: {cert.number}</p>
                            </div>
                          </div>
                          
                          {/* AREA TOMBOL AKSI SERTIFIKAT (BERSIH DARI PANAH) */}
                          {isPip && (
                            <div className={`flex flex-col gap-1.5 flex-shrink-0 z-40 transition-all duration-300 transform 
                              ${isDraggingCert || isDragOverCert ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}
                            `}>
                              <div className="flex gap-1.5 justify-end">
                                
                                {/* 1. Grip Drag & Drop Indicator */}
                                <div className="p-1.5 rounded-md bg-white/5 text-slate-500 hover:text-white hover:bg-white/20 transition-colors cursor-grab active:cursor-grabbing shadow-inner border border-transparent" title="Tahan & Geser (Drag)">
                                  <Icon name="Menu" size={13} />
                                </div>
                                
                                {/* 2. Tombol Edit */}
                                <button onClick={() => { setEditingCert(cert); setIsModalOpen(true); }} title="Edit Dokumen" className="p-1.5 rounded-md bg-white/5 text-gray-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/20 transition-all shadow-inner border border-transparent hover:border-[#00e5ff]/30">
                                  <Icon name="Edit2" size={13} />
                                </button>
                                
                                {/* 3. Tombol Hapus */}
                                <button onClick={() => handleDeleteCert(cert.id)} title="Hapus Dokumen" className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                                  <Icon name="Trash2" size={13} />
                                </button>
                                
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 mt-3 text-[9.5px] md:text-[10.5px] font-mono relative z-10 bg-black/30 p-2.5 rounded-lg border border-white/5 shadow-inner group-hover:border-white/10 transition-colors pointer-events-none">
                          <div className="flex justify-between items-center"><span className="text-gray-500 uppercase tracking-widest">Terbit</span><span className="text-gray-300 font-bold">{cert.issueDate}</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-500 uppercase tracking-widest">Kedaluwarsa</span><span className={`font-bold ${isExpired && cert.expiryDate !== "Unlimited" ? "text-rose-500 drop-shadow-[0_0_5px_#e11d48]" : "text-white"}`}>{cert.expiryDate === "Unlimited" ? "SEUMUR HIDUP" : cert.expiryDate}</span></div>
                        </div>

                        {/* ANIMASI PINTU RAHASIA: Kurung Terbuka Saat Hover (SECURE VAULT DOOR) */}
                        <div className="mt-3.5 w-full flex justify-center items-center relative z-10 pointer-events-none h-[22px]">
                          <style>{`
                            /* Animasi Idle: Kurung merapat dan menyala halus (pulse) */
                            @keyframes vault-pulse { 
                              0%, 100% { opacity: 0.6; text-shadow: 0 0 5px #d946ef; } 
                              50% { opacity: 1; text-shadow: 0 0 15px #d946ef, 0 0 25px rgba(217,70,239,0.5); } 
                            }
                            .vault-bracket { 
                              animation: vault-pulse 2.5s ease-in-out infinite; 
                            }

                            /* Transisi Teks: Dari lebar 0 menjadi memanjang */
                            .vault-text-wrapper {
                              max-width: 0px; /* Tersembunyi sempurna saat tidak disentuh */
                              opacity: 0;
                              overflow: hidden;
                              white-space: nowrap;
                              transition: max-width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-in-out 0.1s;
                            }

                            /* Saat Kartu Disentuh (Hover), teks meluas, mendorong kurung ke samping! */
                            .group:hover .vault-text-wrapper {
                              max-width: 250px; /* Teks terbuka perlahan membelah kurung */
                              opacity: 1;
                            }
                            .group:hover .vault-bracket {
                              animation: none; /* Matikan kedipan saat pintu terbuka */
                              opacity: 1;
                              color: #e879f9;
                            }
                          `}</style>

                          <div className="flex items-center justify-center font-mono text-[9.5px] md:text-[10.5px] font-bold tracking-[0.2em] uppercase relative">
                            {/* Kurung Kiri (Warna Fuchsia Elegan) */}
                            <span className="text-[#d946ef] vault-bracket transition-colors duration-500 mr-1">[</span>
                            
                            {/* Teks Waktu (Mulai dari 0px, perlahan meluas ke kiri-kanan) */}
                            <div className="vault-text-wrapper flex justify-center items-center">
                              <span className={`${status.color} drop-shadow-[0_0_6px_currentColor] px-1.5`}>
                                {status.message}
                              </span>
                            </div>
                            
                            {/* Kurung Kanan (Warna Fuchsia Elegan) */}
                            <span className="text-[#d946ef] vault-bracket transition-colors duration-500 ml-1">]</span>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-3 border-t border-white/10 relative z-10 pointer-events-none">
                          <div className="w-full h-[3.5px] bg-black/80 rounded-full mb-2 overflow-hidden border border-white/5 relative shadow-inner">
                            <div className={`absolute top-0 left-0 h-full ${status.bar} transition-all duration-1000 ease-out overflow-hidden`} style={{ width: `${status.prog}%`, boxShadow: `0 0 10px currentColor` }}>
                              {status.prog > 0 && status.prog < 100 && <div className="anim-liquid-neon"></div>}
                              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-[1px] shadow-[0_0_8px_2px_currentColor]"></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-end w-full">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/10 shadow-inner flex-shrink-0 group-hover:border-[currentColor]/30 transition-colors`}>
                              <div className="scale-[0.8] drop-shadow-[0_0_5px_currentColor]">{status.icon}</div>
                              <span className={`text-[8.5px] md:text-[9.5px] font-black tracking-widest uppercase drop-shadow-[0_0_5px_currentColor] ${status.color}`}>{status.label}</span>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0 leading-none">
                              <span className={`text-xs md:text-sm font-mono font-black tracking-wider drop-shadow-[0_0_5px_currentColor] ${status.textClass || (isExpired ? "text-rose-500" : "text-white")}`}>
                                {cert.expiryDate === "Unlimited" ? "UNLIMITED" : formatSisaWaktu(status.days)}
                              </span>
                              <span className={`text-[7px] md:text-[8px] uppercase tracking-widest font-bold ${status.color} opacity-70 mt-1`}>{status.action}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-50 relative z-20 glass-panel rounded-2xl border border-dashed border-gray-600">
                    <div className="w-16 h-16 rounded-full border border-gray-500 flex items-center justify-center mb-4 relative"><Icon name="Activity" size={24} className="text-gray-400" /><div className="absolute inset-0 rounded-full border-t-2 border-[#00e5ff] animate-spin"></div></div>
                    <p className="text-[#00e5ff] font-mono tracking-widest uppercase text-[10px] font-bold">Awaiting Data Input</p>
                    <p className="text-gray-500 text-[9px] uppercase tracking-wider mt-1">Tidak ada dokumen {filterStatus === "all" ? "tersedia" : filterStatus}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <CertificateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCert} certData={editingCert} crewId={selectedCrewId} />
        <ConfirmModal isOpen={confirmAction.isOpen} message={confirmAction.message} onConfirm={executeConfirmAction} onCancel={() => setConfirmAction({ isOpen: false, message: "", action: null })} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleUpdatePasswords} />

        {toast && (
          <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] animate-slide-up">
            <style>{`
              @keyframes tacticalSlideUp { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
              @keyframes toastSweepLeft { 0% { transform: translateX(-100%); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(200%); opacity: 0; } }
              .animate-slide-up { animation: tacticalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
              .animate-toast-sweep { animation: toastSweepLeft 2s infinite; }
            `}</style>
            <div className="flex items-center gap-3.5 px-4 py-3 md:px-5 md:py-3.5 bg-[#02040a]/90 backdrop-blur-xl border border-white/10 rounded-r-lg rounded-l-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden group">
              <div className={`absolute left-0 top-0 w-1 h-full shadow-[0_0_12px_currentColor] ${toast.type === 'error' ? 'bg-rose-500 text-rose-500' : 'bg-[#00e5ff] text-[#00e5ff]'}`}></div>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-toast-sweep"></div>
              <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border ${toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#00e5ff]/10 border-[#00e5ff]/30'}`}>
                <Icon name={toast.type === 'error' ? 'AlertTriangle' : 'Check'} size={12} className={toast.type === 'error' ? 'text-rose-500 drop-shadow-[0_0_5px_#f43f5e]' : 'text-[#00e5ff] drop-shadow-[0_0_5px_#00e5ff]'} />
              </div>
              <div className="flex flex-col relative z-10">
                <span className={`text-[8px] md:text-[9px] font-mono tracking-[0.25em] uppercase mb-0.5 opacity-80 ${toast.type === 'error' ? 'text-rose-500' : 'text-[#00e5ff]'}`}>
                  {toast.type === 'error' ? 'System Error Log' : 'System Update Log'}
                </span>
                <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {toast.message}
                </span>
              </div>
            </div>
          </div>
        )}
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
        if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
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
