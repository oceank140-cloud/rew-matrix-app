import React, { useState, useEffect, useRef } from "react";
import { Anchor, Fingerprint, Lock as LucideLock, User as LucideUser } from 'lucide-react';
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

const Icon = ({ name, size = 24, className = "", strokeWidth = 2, title }) => {
  const icons = {
    Lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    User: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    Users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    FileText: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></>,
    AlertTriangle: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    Plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    Edit2: <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>,
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
    Settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    Zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
    Check: <><polyline points="20 6 9 17 4 12"/></>,
    FileDown: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></>,
    RefreshCw: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    ShipWheel: <><circle cx="12" cy="12" r="8"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></>,
    Anchor: <><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></>,
    UserCheck: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></>,
    GripVertical: <><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></>,
    Pencil: <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>
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

const CustomStyles = () => (
  <>
    <style
      dangerouslySetInnerHTML={{
        __html: `
    @import url('https://fonts.googleapis.com/css2?family=Michroma&display=swap');
    
    :root { --bg-dark: #050A15; --bg-navy: #0A1128; --panel-glass: rgba(255, 255, 255, 0.04); --neon-cyan: #00F0FF; }
    
    /* Global reset untuk font agar seragam */
    body { background-color: var(--bg-dark); color: #E2E8F0; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
    
    /* Hanya gunakan Michroma jika dipanggil lewat class */
    .font-michroma {
      font-family: 'Michroma', sans-serif;
    }
    
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

    @keyframes plasmaPingPong {
      0% { left: 0%; transform: translateX(-100%); }
      100% { left: 100%; transform: translateX(0%); }
    }
    .anim-plasma-normal { animation: plasmaPingPong 2.5s ease-in-out infinite alternate; }
    .anim-plasma-kritis { animation: plasmaPingPong 1.2s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate; }
    
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
  </>
);

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingText, setLoadingText] = useState("OTORISASI AKSES");
  
  const [isExiting, setIsExiting] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault(); 
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

        if (password === adminPass || password === crewPass) {
          setLoadingText("[ AKSES DITERIMA ]");
          
          setIsExiting(true);
          
          setTimeout(() => {
            const role = password === adminPass ? "pip" : "crew";
            localStorage.setItem("jwt_token", `token_${role}_dynamic_2026`);
            localStorage.setItem("user_role", role);
            localStorage.setItem("user_name", sanitizedUser);
            onLogin({ isAuthenticated: true, role: role, name: sanitizedUser });
          }, 800);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  return (
    <div className="w-full min-h-screen relative bg-[#02040a] overflow-hidden flex items-center justify-center md:justify-end md:pr-[12%] p-5 md:p-4 perspective-[1000px]">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes neon-pulse-white { 0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.4); } 50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.8); } }
        @keyframes neon-pulse-magenta { 0%, 100% { text-shadow: 0 0 10px rgba(217, 70, 239, 0.4); opacity: 0.8; } 50% { text-shadow: 0 0 20px rgba(217, 70, 239, 0.8); opacity: 1; } }
        @keyframes bracket-breathe-vertical { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes bracket-breathe-vertical-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
        
        @keyframes anti-gravity-float {
          0%, 100% { transform: translateY(0px); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8), inset 0 2px 2px rgba(255,255,255,0.15), inset 1px 0 2px rgba(255,255,255,0.1); }
          50% { transform: translateY(-12px); box-shadow: 0 60px 100px -20px rgba(0,0,0,0.9), inset 0 2px 2px rgba(255,255,255,0.25), inset 1px 0 2px rgba(255,255,255,0.15); }
        }

        @keyframes warp-in {
          0% { transform: scale(0.3) translateZ(-500px); opacity: 0; filter: blur(20px); }
          70% { transform: scale(1.05) translateZ(50px); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); }
        }

        @keyframes warp-out {
          0% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); }
          20% { transform: scale(0.95) translateZ(-50px); opacity: 1; filter: blur(0px); }
          100% { transform: scale(2) translateZ(500px); opacity: 0; filter: blur(20px); }
        }
        
        .anim-why-text { animation: neon-pulse-white 3s ease-in-out infinite; }
        .anim-magenta-glow { animation: neon-pulse-magenta 3s ease-in-out infinite; }
        .anim-bracket-top { animation: bracket-breathe-vertical 3s ease-in-out infinite; }
        .anim-bracket-bottom { animation: bracket-breathe-vertical-down 3s ease-in-out infinite; }
        .anim-floating-panel { animation: anti-gravity-float 6s ease-in-out infinite; }
        
        .animate-3d-entry { animation: warp-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-3d-exit { animation: warp-out 0.8s cubic-bezier(0.5, 0, 0.2, 1) forwards; pointer-events: none; }
        
        .input-biometric { transition: all 0.3s ease; background: rgba(0, 0, 0, 0.4); box-shadow: inset 0 2px 6px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.05); border: 1px solid rgba(0,0,0,0.5); }
        .input-biometric:focus { border-color: rgba(0, 229, 255, 0.5); box-shadow: inset 0 2px 6px rgba(0,0,0,0.8), 0 0 15px rgba(0,229,255,0.15), inset 0 0 10px rgba(0,229,255,0.05); outline: none; }
      `}} />

      <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center pointer-events-none">
        <iframe 
          src="https://my.spline.design/logoreveal-k0mxfileGsO18DXpGVFjt0cE/" 
          frameBorder="0" 
          width="100%" 
          height="100%" 
          title="MarineVault 3D Logo Reveal"
          className="w-full h-full scale-[1.5] md:scale-[1.1] opacity-90 md:opacity-100 transition-opacity duration-1000"
          style={{ border: 'none', pointerEvents: 'none' }}
        />
        <div className="absolute inset-0 bg-[#02040a]/30 z-10 pointer-events-none" />
      </div>

      <div className={`relative z-20 w-full max-w-[420px] ${isExiting ? 'animate-3d-exit' : 'animate-3d-entry'}`}>
        
        <div className="anim-floating-panel flex flex-col w-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0c1322]/80 via-[#050A15]/80 to-[#02040a]/90 backdrop-blur-[24px] border border-white/5 relative">
          
          <div className="absolute top-0 left-[-50%] w-[200%] h-[150%] bg-gradient-to-b from-white/[0.05] to-transparent transform -rotate-45 pointer-events-none z-0"></div>

          <div className="w-full p-7 pb-5 md:p-8 md:pb-6 flex flex-col items-center justify-center border-b border-white/5 bg-white/[0.01] relative z-10">
            <div className="flex flex-col items-center justify-center mb-4 md:mb-5 cursor-default select-none">
              <span className="text-fuchsia-500 text-xl font-light leading-none mb-1.5 anim-magenta-glow anim-bracket-top">[</span>
              <span className="text-white text-3xl font-black leading-none tracking-[0.2em] anim-why-text">WHY</span>
              <span className="text-fuchsia-400 font-mono text-[10px] font-bold tracking-[0.4em] mt-2 mb-2 anim-magenta-glow">1988</span>
              <span className="text-fuchsia-500 text-xl font-light leading-none anim-magenta-glow anim-bracket-bottom">]</span>
            </div>

            <div className="text-center">
              <h2 className="text-[22px] md:text-[24px] font-bold uppercase tracking-[0.15em] leading-tight text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                CREW <br/>
                <span className="text-slate-400">MATRIX</span>
              </h2>
              <h3 className="text-[9px] font-semibold tracking-[0.4em] text-[#d946ef] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase mt-2 mb-0">
                SERTIFIKAT
              </h3>
            </div>
          </div>

          <div className="w-full p-7 pt-6 md:p-8 flex flex-col justify-center bg-[#000000]/20 relative z-10">
            {error && (
              <div className="mb-4 p-2.5 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-[10px] md:text-xs flex items-center gap-2 backdrop-blur-md">
                <Icon name="AlertTriangle" size={14} className="text-red-500 flex-shrink-0" /> 
                <span>{error}</span>
              </div>
            )}
            
            <div onKeyDown={handleKeyDown} className="space-y-6 w-full">
              
              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-2 tracking-wider uppercase drop-shadow-md">
                  NAMA OPERATOR / CREW
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-[#00e5ff] transition-colors duration-300">
                    <LucideUser size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    disabled={loading || isExiting} 
                    placeholder="Ketik nama Anda..."
                    autoComplete="off"
                    className="input-biometric w-full pl-12 pr-4 py-4 md:py-3.5 rounded-xl text-sm text-white placeholder-gray-600" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-2 tracking-wider uppercase drop-shadow-md">
                  ENCRYPTED KEY (PASSWORD)
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-[#00e5ff] transition-colors duration-300">
                    <LucideLock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={loading || isExiting} 
                    placeholder="Ketik sandi keamanan..."
                    autoComplete="new-password"
                    className="input-biometric w-full pl-12 pr-4 py-4 md:py-3.5 rounded-xl text-sm text-white placeholder-gray-600" 
                  />
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleLogin}
                disabled={loading || isExiting}
                className="w-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white font-bold text-[10px] md:text-[11px] tracking-[0.2em] py-4 rounded-xl border border-[#334155] border-t-[#94a3b8] shadow-[0_10px_20px_rgba(0,0,0,0.6)] hover:from-[#334155] hover:to-[#1e293b] hover:border-t-white active:scale-[0.98] transition-all duration-300 uppercase mt-6 disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
              >
                {loadingText}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

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
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-80 pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              SYSTEM SETTINGS
            </h3>
            <p className="text-[10px] text-[#00e5ff] font-mono tracking-widest uppercase mt-1">
              Access Configuration
            </p>
          </div>
          <button type="button" onClick={onClose} className="relative z-[100] text-gray-500 hover:text-rose-500 transition-all duration-300 bg-white/5 hover:bg-rose-500/10 p-2 rounded-xl cursor-pointer flex items-center justify-center">
            <Icon name="X" size={20} className="pointer-events-none" />
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
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg font-medium font-mono relative z-[100]"
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
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg font-medium font-mono relative z-[100]"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 w-full mt-6 pt-5 border-t border-white/10">
              <button type="button" onClick={onClose} className="relative z-[100] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center">
                Batal
              </button>
              <button type="submit" className="relative z-[100] px-6 py-2.5 bg-gradient-to-r from-[#00e5ff]/10 to-transparent hover:bg-[#00e5ff]/20 text-white border rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.15)] group overflow-hidden cursor-pointer flex items-center justify-center" style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out z-0 pointer-events-none"></div>
                <span className="relative z-10 pointer-events-none">Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
      
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <div className="anim-modal-slam w-full max-w-sm rounded-xl overflow-hidden border border-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.4)] relative bg-[#050A15]">
        <div className="absolute inset-0 hazard-stripes z-0 pointer-events-none"></div>
        <div className="bg-rose-600 text-white text-[9px] font-black tracking-[0.3em] uppercase text-center py-1.5 relative z-10 shadow-[0_0_15px_#e11d48] pointer-events-none">
          [ CRITICAL DANGER PROTOCOL ]
        </div>

        <div className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-rose-950/80 rounded-full flex items-center justify-center mb-5 border border-rose-50 anim-strobe-glitch shadow-[0_0_20px_#e11d48] pointer-events-none">
            <Icon name="AlertTriangle" size={32} className="text-rose-500 pointer-events-none" />
          </div>
          
          <h3 className="text-xl font-black text-rose-500 mb-2 tracking-[0.15em] uppercase drop-shadow-[0_0_8px_rgba(225,29,72,0.6)] pointer-events-none">
            Peringatan Kritis
          </h3>
          
          <p className="text-xs text-rose-200/80 mb-8 font-mono leading-relaxed pointer-events-none">
            {message}
            <br/><br/>
            <span className="text-rose-500 font-bold bg-rose-950/50 p-1.5 rounded border border-rose-900 block tracking-widest pointer-events-none">
              TINDAKAN INI BERSIFAT PERMANEN.
            </span>
          </p>
          
          <div className="flex flex-col w-full gap-3 mt-2">
            <button
              type="button"
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onMouseLeave={() => setIsHolding(false)}
              onTouchStart={() => setIsHolding(true)}
              onTouchEnd={() => setIsHolding(false)}
              className="relative z-[100] w-full py-3.5 bg-[#0a0000] border border-rose-600 text-white rounded-lg overflow-hidden group select-none active:scale-[0.98] transition-transform cursor-crosshair flex items-center justify-center"
            >
              <div 
                className="absolute top-0 left-0 h-full bg-rose-600 transition-all duration-75 ease-linear z-0 shadow-[0_0_20px_#e11d48] pointer-events-none"
                style={{ width: `${holdProgress}%` }}
              ></div>
              <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black tracking-[0.25em] uppercase drop-shadow-md pointer-events-none">
                  {isHolding ? "PURGING DATA..." : "Execute Purge"}
                </span>
                <span className="text-[8.5px] font-mono text-rose-200 opacity-90 tracking-widest mt-1 uppercase pointer-events-none">
                  {isHolding ? `[ LOADING: ${Math.floor(holdProgress)}% ]` : "[ Tahan Untuk Konfirmasi ]"}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="relative z-[100] w-full py-3 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white rounded-lg transition-colors shadow-inner cursor-pointer flex items-center justify-center"
            >
              Abort Mission
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050A15]/60 backdrop-blur-md p-4 overflow-hidden">
      
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <div className="anim-holo-unfold w-full max-w-lg rounded-2xl p-6 md:p-8 border border-white/10 bg-[#0A1128]/60 relative overflow-visible shadow-2xl backdrop-blur-md">
        
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-80 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {certData ? "Update Cert" : "System Input"}
            </h3>
            <p className="text-[10px] text-[#00e5ff] font-mono tracking-widest uppercase mt-1">
              Data Entry Terminal
            </p>
          </div>
          <button type="button" onClick={onClose} className="relative z-[100] text-gray-500 hover:text-rose-500 hover:rotate-90 transition-all duration-300 bg-white/5 hover:bg-rose-500/10 p-2 rounded-xl cursor-pointer flex items-center justify-center">
            <Icon name="X" size={20} className="pointer-events-none" />
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
              className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg placeholder-gray-600 font-medium relative z-[100]"
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
              className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg placeholder-gray-600 font-medium font-mono relative z-[100]"
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
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg [color-scheme:dark] relative z-[100]"
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
                className="glass-input-holo w-full px-4 py-3 text-sm rounded-lg [color-scheme:dark] disabled:opacity-20 disabled:cursor-not-allowed relative z-[100]"
              />
              <label className="flex items-center gap-2 mt-2.5 group w-fit relative z-[100] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.expiryDate === "Unlimited"}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.checked ? "Unlimited" : "" })}
                  className="rounded border-gray-600 text-[#00e5ff] focus:ring-[#00e5ff]/50 bg-[#1A1D24] cursor-pointer w-4 h-4 transition-all relative z-[100]"
                />
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#00e5ff] transition-colors tracking-widest uppercase cursor-pointer">
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
                  className="relative z-[100] flex-1 sm:flex-none px-3 py-2 sm:py-2 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:shadow-[inset_0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 border-r border-white/10 cursor-pointer flex items-center justify-center"
                  title="MCU / Buku Pelaut (1 Tahun)"
                >
                  +1 Thn
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoCalculate(2)}
                  className="relative z-[100] flex-1 sm:flex-none px-3 py-2 sm:py-2 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:shadow-[inset_0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 border-r border-white/10 cursor-pointer flex items-center justify-center"
                  title="Buku Pelaut (2 Tahun)"
                >
                  +2 Thn
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoCalculate(5)}
                  className="relative z-[100] flex-1 sm:flex-none px-3 py-2 sm:py-2 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:shadow-[inset_0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 cursor-pointer flex items-center justify-center"
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
                className="relative z-[100] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                Batal
              </button>
              <button
                type="submit"
                className="relative z-[100] px-8 py-2.5 bg-gradient-to-r from-[#00e5ff]/10 to-transparent hover:bg-[#00e5ff]/20 text-white border rounded-lg text-xs font-bold tracking-widest uppercase w-full md:w-auto transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden cursor-pointer flex items-center justify-center"
                style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', boxShadow: '0 0 15px rgba(0,229,255,0.15)' }}
              >
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent -skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out pointer-events-none"></div>
                <span className="group-hover:drop-shadow-[0_0_8px_currentColor] transition-all relative z-10 pointer-events-none">
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

const Dashboard = ({ onLogout, userRole, userName, fbUser }) => {
  const [activeTheme, setActiveTheme] = useState('cyan');
  const theme = MARINE_THEMES[activeTheme];
  const isPip = userRole === "pip"; 

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [inputCrewStatus, setInputCrewStatus] = useState("Onboard");
  const [showOffboard, setShowOffboard] = useState(false);

  const glowRef = useRef(null);
  
  useEffect(() => {
    let animationFrameId;
    
    const handleMouseMove = (e) => {
      animationFrameId = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, ${theme.hex}15, transparent 40%)`;
        }
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [theme.hex]);

  const [currentView, setCurrentView] = useState("overview"); 
  const [crews, setCrews] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCrewId, setSelectedCrewId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [inputCrewName, setInputCrewName] = useState("");
  const [inputCrewRank, setInputCrewRank] = useState("");
  const [editingCrewId, setEditingCrewId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [confirmAction, setConfirmAction] = useState({ isOpen: false, message: "", action: null });
  const [toast, setToast] = useState(null); 

  const [draggedCrewId, setDraggedCrewId] = useState(null);
  const [dragOverCrewId, setDragOverCrewId] = useState(null);

  const handleDragStart = (e, id) => {
    if (!isPip) return;
    setDraggedCrewId(id);
    e.dataTransfer.effectAllowed = "move"; 
  };

  const handleDragOver = (e, id) => {
    e.preventDefault(); 
    if (!isPip || draggedCrewId === id) return;
    setDragOverCrewId(id);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverCrewId(null);
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    setDragOverCrewId(null);

    if (!isPip || !draggedCrewId || draggedCrewId === targetId || !fbUser) return;

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

  const selectedCrew = crews.find((c) => c.id === selectedCrewId);
  const crewCerts = selectedCrewId ? certificates.filter((c) => c.crewId === selectedCrew?.id) : [];
  const sortedCrewCerts = [...crewCerts].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999;
    const orderB = b.order !== undefined ? b.order : 999999;
    return orderA - orderB;
  });

  const getExpiryStatus = (expiryDateStr, currentTheme) => {
    const tHex = currentTheme?.hex || "#00e5ff"; 

    if (expiryDateStr === "Unlimited" || expiryDateStr === "" || !expiryDateStr) {
      return { 
        label: "VALID", days: Infinity, class: "border-current/30 shadow-[0_0_15px_currentColor] bg-current/10", 
        textClass: "text-current", icon: <Icon name="CheckCircle" size={16} className="text-current" />,
        prog: 100, color: "text-current", bg: "bg-current opacity-20", bar: "bg-current", action: "SEUMUR HIDUP", message: "SEUMUR HIDUP", hex: tHex
      };
    }

    const expDate = new Date(expiryDateStr);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); 
    const diffDays = Math.ceil((expDate - todayDate) / (1000 * 60 * 60 * 24));
    const prog = Math.min(100, Math.max(0, (diffDays / 365) * 100));
    
    const absDays = Math.abs(diffDays);
    const yearsLeft = Math.floor(absDays / 365);
    const monthsLeft = Math.floor((absDays % 365) / 30);
    const daysLeft = (absDays % 365) % 30;

    let parts = [];
    if (yearsLeft > 0) parts.push(`${yearsLeft} Thn`);
    if (monthsLeft > 0) parts.push(`${monthsLeft} Bln`);
    if (daysLeft > 0 || (yearsLeft === 0 && monthsLeft === 0)) parts.push(`${daysLeft} Hr`);
    
    const detailTime = parts.join(" ");
    let message = diffDays <= 0 ? `EXP: -${detailTime}` : `SW: ${detailTime}`;

    if (diffDays <= 0) return { label: "EXPIRED", class: "cert-expired", icon: <Icon name="XCircle" size={16} className="text-red-500" />, days: diffDays, prog: 0, color: "text-red-500", bg: "bg-red-500/20", bar: "bg-red-500", action: "DOKUMEN MATI", message, hex: "#f43f5e" };
    if (diffDays <= 10) return { label: "CRITICAL", class: "blink-red bg-red-950/30", icon: <Icon name="AlertTriangle" size={16} className="text-red-400" />, days: diffDays, prog, color: "text-red-400", bg: "bg-red-500/20", bar: "bg-red-400", action: "PERPANJANG SEGERA", message, hex: "#f87171" };
    if (diffDays <= 20) return { label: "WARNING", class: "pulse-orange bg-orange-950/30", icon: <Icon name="Clock" size={16} className="text-orange-400" />, days: diffDays, prog, color: "text-orange-400", bg: "bg-orange-500/20", bar: "bg-orange-400", action: "PROSES SEKARANG", message, hex: "#fbbf24" };
    if (diffDays <= 30) return { label: "ATTENTION", class: "glow-yellow bg-yellow-950/20", icon: <Icon name="Clock" size={16} className="text-yellow-400" />, days: diffDays, prog, color: "text-yellow-400", bg: "bg-yellow-500/20", bar: "bg-yellow-400", action: "SIAPKAN DOKUMEN", message, hex: "#facc15" };
    
    return { 
        label: "VALID", 
        class: "border-current/30 shadow-[0_0_15px_currentColor] bg-current/10", 
        icon: <Icon name="CheckCircle" size={16} className="text-current" />, 
        days: diffDays, 
        prog, 
        color: "text-current", 
        bg: "bg-current opacity-20", 
        bar: "bg-current", 
        action: "STATUS AMAN", 
        message, 
        hex: tHex 
    };
  };

  const formatSisaWaktu = (days) => {
    if (days < 0) return `${days} HARI`; 
    if (days === 0) return "HARI INI";
    if (days < 30) return `${days} HARI`;
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = (days % 365) % 30;

    if (months === 12) return `${years + 1} THN`; 

    if (years > 0) {
      return `${years} THN ${months > 0 ? months + ' BLN' : ''}`.trim();
    } else {
      return `${months} BLN ${remainingDays > 0 ? remainingDays + ' HR' : ''}`.trim();
    }
  };

  const filteredCrews = sortedCrews.filter((crew) => {
    if (!showOffboard && crew.status === "Sign Off") return false;

    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === "all") return true;

    const crewCertsForFilter = certificates.filter((c) => c.crewId === crew.id);
    if (filterStatus === "expired") return crewCertsForFilter.some((cert) => getExpiryStatus(cert.expiryDate, theme).days <= 0);
    if (filterStatus === "critical") return crewCertsForFilter.some((cert) => {
      const days = getExpiryStatus(cert.expiryDate, theme).days;
      return days > 0 && days <= 30; 
    });
    if (filterStatus === "valid") return crewCertsForFilter.some((cert) => {
      const days = getExpiryStatus(cert.expiryDate, theme).days;
      return days > 30 || cert.expiryDate === "Unlimited";
    });
    return true;
  });

  const displayCerts = sortedCrewCerts.filter(cert => {
    if (filterStatus === "all") return true;
    let diffDays = Infinity;
    if (cert.expiryDate && cert.expiryDate !== "Unlimited") {
      diffDays = Math.ceil((new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    }
    if (filterStatus === "expired") return diffDays <= 0;
    if (filterStatus === "critical") return diffDays > 0 && diffDays <= 30;
    if (filterStatus === "valid") return diffDays > 30 || cert.expiryDate === "Unlimited";
    return true;
  });

  useEffect(() => {
    if (!fbUser) return;
    
    const crewsRef = collection(db, 'artifacts', appId, 'public', 'data', 'crews');
    const unsubCrews = onSnapshot(crewsRef, 
      (snapshot) => setCrews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), 
      (error) => console.error("Error fetching crews:", error)
    );
    
    const certsRef = collection(db, 'artifacts', appId, 'public', 'data', 'certificates');
    const unsubCerts = onSnapshot(certsRef, 
      (snapshot) => setCertificates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), 
      (error) => console.error("Error fetching certs:", error)
    );
    
    return () => { 
      unsubCrews(); 
      unsubCerts(); 
    };
  }, [fbUser, refreshTrigger]);
  
  useEffect(() => {
    if (currentView === "crew" && !selectedCrewId && crews.length > 0) setSelectedCrewId(crews[0].id);
  }, [crews, selectedCrewId, currentView]);

  const totalSertifikatInti = sortedCrewCerts.filter(cert => {
    if (!cert.name) return false;
    const namaDokumen = cert.name.toLowerCase();
    const isMCU = namaDokumen.includes("mcu") || namaDokumen.includes("medical");
    const isBukuPelaut = namaDokumen.includes("seaman") || namaDokumen.includes("pelaut");
    return !isMCU && !isBukuPelaut;
  }).length;

  const expiredDocsCount = sortedCrewCerts.filter(cert => {
    if (cert.expiryDate === "Unlimited" || !cert.expiryDate) return false;
    const diffDays = Math.ceil((new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= 0;
  }).length;

  const criticalDocsCount = sortedCrewCerts.filter(cert => {
    if (cert.expiryDate === "Unlimited" || !cert.expiryDate) return false;
    const diffDays = Math.ceil((new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  const isSystemAlertActive = expiredDocsCount > 0 || criticalDocsCount > 0;

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
    const crewData = { 
      name: sanitizeInput(inputCrewName), 
      rank: sanitizeInput(inputCrewRank), 
      status: inputCrewStatus,
      order: newOrder 
    };

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
    setInputCrewStatus("Onboard");
    setIsAddingNew(false);
  };

  const handleStartEditCrew = (crew) => {
    setEditingCrewId(crew.id);
    setInputCrewName(crew.name);
    setInputCrewRank(crew.rank);
    setInputCrewStatus(crew.status || "Onboard");
    setIsAddingNew(true);
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

  const executeConfirmAction = async () => {
    if (confirmAction.action) {
      await confirmAction.action();
    }
    setConfirmAction({ isOpen: false, message: "", action: null });
  };

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
          const status = getExpiryStatus(foundCert.expiryDate, theme);
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
            const status = getExpiryStatus(foundCert.expiryDate, theme);
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
    const globalStats = {
      totalCrews: crews.length,
      expired: certificates.filter(c => getExpiryStatus(c.expiryDate, theme).days <= 0).length,
      critical: certificates.filter(c => { const d = getExpiryStatus(c.expiryDate, theme).days; return d > 0 && d <= 30; }).length,
      valid: certificates.filter(c => getExpiryStatus(c.expiryDate, theme).days > 30).length,
    };

    const { totalCrews, expired, critical, valid } = globalStats;
    const totalCerts = expired + critical + valid;
    
    const validPct = totalCerts === 0 ? 0 : (valid / totalCerts) * 100;
    const criticalPct = totalCerts === 0 ? 0 : (critical / totalCerts) * 100;
    const expiredPct = totalCerts === 0 ? 0 : (expired / totalCerts) * 100;

    return (
      <div className="space-y-6 md:space-y-8 animate-fadeIn w-full max-w-6xl mx-auto mt-2">
        {/* INJEKSI CSS: COLOR-CODED DARK BLOCKS 3D */}
        <style dangerouslySetInnerHTML={{ __html: `
          .dash-card {
            border-radius: 1.5rem;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .dash-card:hover { transform: translateY(-8px) scale(1.02); }

          /* WARNA 1: Deep Sapphire (Total Crew) */
          .card-sapphire { background: #0A192F; border: 1px solid #112240; box-shadow: 0 15px 30px -5px rgba(10,25,47,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -5px 0 0 #020C1B; }
          .card-sapphire:hover { box-shadow: 0 25px 40px -10px rgba(10,25,47,0.5), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -5px 0 0 #020C1B; }

          /* WARNA 2: Deep Emerald (Dokumen Valid) */
          .card-emerald { background: #064E3B; border: 1px solid #065F46; box-shadow: 0 15px 30px -5px rgba(6,78,59,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -5px 0 0 #022C22; }
          .card-emerald:hover { box-shadow: 0 25px 40px -10px rgba(6,78,59,0.5), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -5px 0 0 #022C22; }

          /* WARNA 3: Deep Topaz (Dokumen Kritis) */
          .card-topaz { background: #451A03; border: 1px solid #78350F; box-shadow: 0 15px 30px -5px rgba(69,26,3,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -5px 0 0 #290F02; }
          .card-topaz:hover { box-shadow: 0 25px 40px -10px rgba(69,26,3,0.5), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -5px 0 0 #290F02; }

          /* WARNA 4: Deep Ruby (Kedaluwarsa) */
          .card-ruby { background: #4C0519; border: 1px solid #881337; box-shadow: 0 15px 30px -5px rgba(76,5,25,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -5px 0 0 #28020D; }
          .card-ruby:hover { box-shadow: 0 25px 40px -10px rgba(76,5,25,0.5), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -5px 0 0 #28020D; }

          /* MAIN PANEL: Deep Slate (Rasio Global) */
          .card-slate { background: #0F172A; border: 1px solid #1E293B; box-shadow: 0 15px 30px -5px rgba(15,23,42,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -5px 0 0 #020617; }
          .card-slate:hover { box-shadow: 0 25px 40px -10px rgba(15,23,42,0.5), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -5px 0 0 #020617; }
        `}} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Kartu 1: TOTAL CREW (Klik untuk lihat Semua) */}
          <button type="button" onClick={() => { setFilterStatus("all"); setCurrentView("matrix"); }} className="relative z-[100] dash-card card-sapphire p-6 flex flex-col gap-2 relative overflow-hidden group text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50 flex items-start justify-center">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl group-hover:bg-sky-400/30 transition-colors pointer-events-none"></div>
            <div className="flex items-center gap-3 text-sky-400 relative z-10 pointer-events-none">
              <Icon name="Users" size={22} className="pointer-events-none" />
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 pointer-events-none">Total Crew</h3>
            </div>
            <p className="text-4xl font-black text-white mt-2 relative z-10 pointer-events-none">{totalCrews}</p>
            <p className="text-[10px] text-sky-300 uppercase tracking-widest mt-1 font-bold relative z-10 flex items-center gap-1 group-hover:text-sky-200 transition-colors pointer-events-none">Lihat Matrix Data <Icon name="ChevronRight" size={12} className="pointer-events-none" /></p>
          </button>

          {/* Kartu 2: DOKUMEN VALID (Klik untuk filter Aman) */}
          <button type="button" onClick={() => { setFilterStatus("valid"); setCurrentView("matrix"); }} className="relative z-[100] dash-card card-emerald p-6 flex flex-col gap-2 relative overflow-hidden group text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-start justify-center">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-colors pointer-events-none"></div>
            <div className="flex items-center gap-3 text-emerald-400 relative z-10 pointer-events-none">
              <Icon name="CheckCircle" size={22} className="pointer-events-none" />
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 pointer-events-none">Dokumen Valid</h3>
            </div>
            <p className="text-4xl font-black text-white mt-2 relative z-10 pointer-events-none">{valid}</p>
            <p className="text-[10px] text-emerald-300 uppercase tracking-widest mt-1 font-bold relative z-10 flex items-center gap-1 group-hover:text-emerald-200 transition-colors pointer-events-none">Filter: &gt; 30 Hari <Icon name="ChevronRight" size={12} className="pointer-events-none" /></p>
          </button>

          {/* Kartu 3: DOKUMEN KRITIS (Klik untuk filter Kritis) */}
          <button type="button" onClick={() => { setFilterStatus("critical"); setCurrentView("matrix"); }} className="relative z-[100] dash-card card-topaz p-6 flex flex-col gap-2 relative overflow-hidden group text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 flex items-start justify-center">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-400/30 transition-colors pointer-events-none"></div>
            <div className="flex items-center gap-3 text-amber-400 relative z-10 pointer-events-none">
              <Icon name="AlertTriangle" size={22} className="pointer-events-none" />
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 pointer-events-none">Dokumen Kritis</h3>
            </div>
            <p className="text-4xl font-black text-white mt-2 relative z-10 pointer-events-none">{critical}</p>
            <p className="text-[10px] text-amber-300 uppercase tracking-widest mt-1 font-bold relative z-10 flex items-center gap-1 group-hover:text-amber-200 transition-colors pointer-events-none">Filter: 1 - 30 Hari <Icon name="ChevronRight" size={12} className="pointer-events-none" /></p>
          </button>

          {/* Kartu 4: KEDALUWARSA (Klik untuk filter Expired) */}
          <button type="button" onClick={() => { setFilterStatus("expired"); setCurrentView("matrix"); }} className="relative z-[100] dash-card card-ruby p-6 flex flex-col gap-2 relative overflow-hidden group text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/50 flex items-start justify-center">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-400/30 transition-colors pointer-events-none"></div>
            <div className="flex items-center gap-3 text-rose-400 relative z-10 pointer-events-none">
              <Icon name="XCircle" size={22} className="pointer-events-none" />
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 pointer-events-none">Kedaluwarsa</h3>
            </div>
            <p className="text-4xl font-black text-white mt-2 relative z-10 pointer-events-none">{expired}</p>
            <p className="text-[10px] text-rose-300 uppercase tracking-widest mt-1 font-bold relative z-10 flex items-center gap-1 group-hover:text-rose-200 transition-colors pointer-events-none">Filter: &le; 0 Hari <Icon name="ChevronRight" size={12} className="pointer-events-none" /></p>
          </button>
          
        </div>

        <div className="dash-card card-slate p-8 flex flex-col md:flex-row items-center gap-10 mt-2">
          {/* Cincin Chart 3D Glass Melayang (Terpisah dari Latar Slate) */}
          <div className="w-56 h-56 md:w-64 md:h-64 relative flex-shrink-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-full p-5 border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_4px_10px_rgba(255,255,255,0.15)] transition-transform duration-700 hover:scale-105 hover:shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_4px_15px_rgba(255,255,255,0.3)] z-10 pointer-events-none">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes drawValid { 0% { stroke-dasharray: 0 100; } 100% { stroke-dasharray: ${validPct} ${100 - validPct}; } }
              @keyframes drawCritical { 0% { stroke-dasharray: 0 100; } 100% { stroke-dasharray: ${criticalPct} ${100 - criticalPct}; } }
              @keyframes drawExpired { 0% { stroke-dasharray: 0 100; } 100% { stroke-dasharray: ${expiredPct} ${100 - expiredPct}; } }
              .anim-stroke-valid { animation: drawValid 1.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
              .anim-stroke-critical { animation: drawCritical 1.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
              .anim-stroke-expired { animation: drawExpired 1.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards; }
            `}} />

            <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] pointer-events-none">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#1e293b" strokeWidth="4"></circle>
              {totalCerts > 0 && (
                <>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#34d399" strokeWidth="4" strokeDashoffset="0" strokeLinecap="round" className="anim-stroke-valid"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#fbbf24" strokeWidth="4" strokeDashoffset={`-${validPct}`} strokeLinecap="round" className="anim-stroke-critical"></circle>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f43f5e" strokeWidth="4" strokeDashoffset={`-${validPct + criticalPct}`} strokeLinecap="round" className="anim-stroke-expired"></circle>
                </>
              )}
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Icon name="PieChart" className="mb-1 text-slate-300 drop-shadow-md pointer-events-none" size={26} />
              <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] pointer-events-none">{totalCerts}</span>
              <span className="text-[9px] text-slate-300 uppercase tracking-[0.3em] font-bold mt-1.5 drop-shadow-md pointer-events-none">Total_Certs</span>
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full pointer-events-none">
            <div>
              <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                <Icon name="Activity" className="text-sky-400 pointer-events-none" size={22} /> Rasio Status Dokumen Global
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Distribusi kesehatan seluruh dokumen sertifikat awak kapal.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#020617] border border-white/5 rounded-xl shadow-inner pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                  <span className="text-sm font-bold text-slate-300">Status Valid (&gt; 30 Hari)</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-xs text-emerald-400 font-mono font-bold">{validPct.toFixed(1)}%</span>
                  <span className="font-black text-white text-xl w-8 text-right">{valid}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#020617] border border-white/5 rounded-xl shadow-inner pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                  <span className="text-sm font-bold text-slate-300">Status Kritis (1 - 30 Hari)</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-xs text-amber-400 font-mono font-bold">{criticalPct.toFixed(1)}%</span>
                  <span className="font-black text-white text-xl w-8 text-right">{critical}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#020617] border border-white/5 rounded-xl shadow-inner pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                  <span className="text-sm font-bold text-slate-300">Kedaluwarsa (&le; 0 Hari)</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-xs text-rose-500 font-mono font-bold">{expiredPct.toFixed(1)}%</span>
                  <span className="font-black text-white text-xl w-8 text-right">{expired}</span>
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
      <div className="w-full h-full flex flex-col relative z-20 perspective-[2000px] mt-2">
        
        {/* ========================================================================= */}
        {/* ENGINE CSS: MINIMALIST DARK-GRAY HARDWARE & 3D GLASS                      */}
        {/* ========================================================================= */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* IMPORT FONT ELEGAN (ANTI-KAKU) */
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;900&display=swap');

          /* 1. ANIMASI MENGAMBANG (ANTI-GRAVITASI) */
          @keyframes antiGravFloat {
            0%, 100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
            50% { transform: translateY(-6px) rotateX(2deg) rotateY(-2deg); }
          }
          .delay-1 { animation-delay: 0s; }
          .delay-2 { animation-delay: 0.7s; }
          .delay-3 { animation-delay: 1.4s; }

          /* HEADER KAPSUL 3D & TEKS NEON ORANYE TERANG */
          .header-capsule-3d {
            background: rgba(10, 15, 25, 0.75);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-top: 1px solid rgba(255, 255, 255, 0.25); 
            border-bottom: 1px solid rgba(0, 0, 0, 0.8); 
            border-radius: 12px;
            box-shadow: inset 0 1px 2px rgba(255,255,255,0.1), 0 8px 15px rgba(0,0,0,0.4);
            transition: all 0.3s ease;
          }
          .text-neon-orange {
            font-family: 'Outfit', sans-serif; /* Font elegan */
            color: #ff9d00; 
            text-shadow: 0 0 10px rgba(255, 157, 0, 0.8), 0 0 20px rgba(255, 157, 0, 0.4);
          }

          /* 2. KAPSUL 3D ABU GELAP (HARDWARE MATERIAL) */
          .node-dark-gray {
            background: linear-gradient(145deg, #4b5563 0%, #1f2937 100%); 
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-top: 1px solid rgba(255, 255, 255, 0.25); 
            border-radius: 12px; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -3px 5px rgba(0,0,0,0.4); 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
            animation: antiGravFloat 6s ease-in-out infinite;
            cursor: crosshair;
            position: relative;
          }

          .node-dark-gray:hover {
            transform: translateY(-10px) scale(1.08) translateZ(30px) !important;
            background: linear-gradient(145deg, #6b7280 0%, #374151 100%); 
            border-color: rgba(0, 240, 255, 0.4);
            box-shadow: 0 20px 30px rgba(0,0,0,0.8), 0 0 15px rgba(0, 240, 255, 0.2), inset 0 2px 5px rgba(255, 255, 255, 0.3);
            z-index: 100;
          }

          /* ========================================================= */
          /* 4. TEKS HITAM DOFF DENGAN EFEK PAHATAN HALUS (SMOOTH DEBOSSED) */
          /* ========================================================= */
          .text-black-doff {
            font-family: 'Outfit', sans-serif; /* Membuat lekukan huruf lebih mulus/aerodinamis */
            color: #0f172a; /* Menggunakan Slate sangat gelap, tidak murni hitam agar tidak mati */
            /* Penambahan blur radius (1px) membuat pahatan terlihat seperti logam cetakan premium */
            text-shadow: 1px 1px 1px rgba(255,255,255,0.35), -1px -1px 1px rgba(0,0,0,0.7);
            letter-spacing: 0.15em; /* Memberi ruang nafas ekstra agar tidak dempet */
          }

          /* 5. KAPSUL KOSONG */
          .node-empty-3d {
            background: transparent;
            border: 1px dashed rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            transition: all 0.4s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .node-empty-3d:hover {
            border-color: rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.05);
            transform: scale(1.05);
          }

          /* TOOLTIP HOLOGRAM MICRO */
          .holo-tooltip-micro {
            background: rgba(2, 4, 10, 0.95); 
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 240, 255, 0.3); 
            box-shadow: 0 10px 30px rgba(0,0,0,1), 0 0 15px rgba(0, 240, 255, 0.1); 
            transform: translateX(-50%) translateY(10px) scale(0.9);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
          }
          .node-dark-gray:hover .holo-tooltip-micro {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
            visibility: visible;
          }

          /* MENGATUR JARAK ANTAR SEL TABEL */
          .table-zero-g {
            border-spacing: 12px 14px !important;
            border-collapse: separate !important;
          }
        `}} />

        <div className="rounded-3xl flex-1 flex flex-col relative mb-4">
          <div className="overflow-x-auto flex-1 custom-scrollbar px-2 md:px-4 pb-32 relative">
            <table className="w-full text-left table-zero-g">
              <thead className="sticky top-0 z-50">
                <tr>
                  <th className="sticky left-0 top-0 z-50 p-0 align-middle">
                    <div className="mx-1 my-2 py-3 px-4 header-capsule-3d flex items-center justify-center">
                      <span className="text-[10px] md:text-[11px] font-black uppercase text-neon-orange" style={{ letterSpacing: '0.25em' }}>
                        IDENTITY // RANK
                      </span>
                    </div>
                  </th>
                  
                  {activeCertKeys.map(key => (
                    <th key={key} className="p-0 align-middle">
                      <div className="mx-1 my-2 py-3 px-3 header-capsule-3d flex items-center justify-center min-w-[60px] md:min-w-[70px]">
                        <span className="text-[10px] md:text-[11px] font-black uppercase text-center text-neon-orange" style={{ letterSpacing: '0.2em' }}>
                          {key}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {filteredCrews.map((crew, index) => {
                  const crewDocs = certificates.filter(c => c.crewId === crew.id);
                  const isOffboard = crew.status === "Sign Off";
                  const delayClass = index % 3 === 0 ? 'delay-1' : index % 3 === 1 ? 'delay-2' : 'delay-3';
                  
                  return (
                    <tr key={crew.id} className={`${isOffboard ? 'opacity-40 grayscale' : ''}`}>
                      
                      {/* ==================================================== */}
                      {/* KAPSUL NAMA KRU (FONT OUTFIT + SMOOTH DEBOSSED)      */}
                      {/* ==================================================== */}
                      <td className="sticky left-0 z-30 p-0 align-middle">
                        <div className={`node-dark-gray w-[140px] md:w-[170px] py-2 px-3.5 flex flex-col justify-center ${delayClass}`}>
                          {/* font-black diganti ke font-bold agar tidak terlalu menggumpal/gemuk */}
                          <span className="font-bold text-[11px] md:text-[13px] uppercase truncate text-black-doff">
                            {crew.name}
                          </span>
                          <span className="text-[7px] md:text-[8px] font-mono tracking-[0.2em] uppercase mt-0.5" style={{ color: '#1e293b', textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.3)' }}>
                            RANK // {crew.rank} {isOffboard && "- OFF"}
                          </span>
                        </div>
                      </td>
                      
                      {/* ==================================================== */}
                      {/* KAPSUL SERTIFIKAT                                    */}
                      {/* ==================================================== */}
                      {activeCertKeys.map(key => {
                        const expectedName = CERT_DICTIONARY[key];
                        const foundCert = crewDocs.find(c => c.name.toLowerCase() === expectedName.toLowerCase());
                        
                        if (foundCert) {
                          const status = getExpiryStatus(foundCert.expiryDate, theme);
                          const barWidth = foundCert.expiryDate === "Unlimited" ? "100%" : `${status.prog}%`;
                          
                          return (
                            <td key={key} className="p-0 align-middle">
                              <div className={`node-dark-gray w-11 h-11 md:w-12 md:h-12 mx-auto flex flex-col items-center justify-center gap-1 ${delayClass}`}>
                                
                                <div className="scale-[0.75] md:scale-[0.85] drop-shadow-[0_0_8px_currentColor]" style={{ color: status.hex }}>
                                  {status.icon}
                                </div>
                                
                                <div className="w-[60%] h-[2px] bg-[#111111]/60 rounded-full overflow-hidden shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)] mt-0.5">
                                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: barWidth, backgroundColor: status.hex, boxShadow: `0 0 6px ${status.hex}` }}></div>
                                </div>

                                <div className="holo-tooltip-micro absolute top-[110%] left-1/2 mt-1 w-max min-w-[150px] rounded-lg p-2.5 z-[9999] border-t-2" style={{ borderTopColor: status.hex }}>
                                  <div className="text-[8px] font-black text-white mb-1.5 uppercase tracking-widest text-center border-b border-white/10 pb-1.5">
                                    {expectedName}
                                  </div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[7px] text-slate-500 uppercase tracking-widest">STATUS</span>
                                    <span className="text-[8px] font-bold uppercase drop-shadow-[0_0_5px_currentColor]" style={{ color: status.hex }}>{status.label}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[7px] text-slate-500 uppercase tracking-widest">WAKTU</span>
                                    <span className="text-[8px] font-mono font-bold text-white">{foundCert.expiryDate === "Unlimited" ? "PERMANEN" : formatSisaWaktu(status.days)}</span>
                                  </div>
                                </div>

                              </div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={key} className="p-0 align-middle">
                            <div className="node-empty-3d w-10 h-10 md:w-11 md:h-11 mx-auto">
                              <span className="text-white/20 text-[10px] font-light">+</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#050A15]">
      <style dangerouslySetInnerHTML={{ __html: `:root { --neon-cyan: ${theme.hex}; }`}} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* ========================================================================= */}
      {/* AREA SIDEBAR (FROSTED TITANIUM & STEALTH 3D GLASS - ORANGE EDITION 2026) */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out flex-shrink-0 bg-[#18181B] rounded-r-[30px] md:rounded-none md:border-r md:border-white/5 overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.8)] ${
          isSidebarOpen
            ? "translate-x-0 w-80 opacity-100"
            : "-translate-x-full w-80 md:w-0 md:opacity-0 border-none"
        }`}
      >
        {/* --- INJEKSI CSS: EFEK DIAM TENGGELAM -> MUNCUL KACA ORENS 3D --- */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* 1. STATE DIAM (IDLE): Rata dengan background, efek tenggelam/inset halus */
          .flush-idle {
            background: #18181B; 
            border: 1px solid rgba(255,255,255,0.05) !important; /* Tambahan garis tipis agar wujud tombol terlihat meski diam */
            box-shadow: inset 2px 2px 5px rgba(0,0,0,0.8);
            transition: all 0.1s ease-out !important; 
            color: #64748b; 
          }
          
          /* 2. STATE GERAK/HOVER: Langsung Keluar Kaca Orens 3D (Super Kilat & Menonjol) */
          .pop-orange:hover, .pop-orange-active {
            background: linear-gradient(145deg, rgba(249, 115, 22, 0.25) 0%, rgba(24, 24, 27, 0.95) 100%) !important;
            backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(249, 115, 22, 0.8) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.5) !important; /* Kilauan atas kaca lebih terang */
            transform: translateY(-4px) scale(1.08) !important; /* Skala diperbesar agar lompatannya sangat terasa */
            box-shadow: 
              0 12px 20px -5px rgba(249, 115, 22, 0.5),
              0 8px 10px -5px rgba(0, 0, 0, 0.9),
              inset 0 1px 1px rgba(255, 255, 255, 0.5),
              inset 0 -3px 0 0 rgba(249, 115, 22, 1) !important;
            color: #ffffff !important;
            z-index: 50 !important;
            transition: all 0.05s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; /* Durasi 0.05s: Super instan & memantul */
          }

          /* 3. STATE KLIK (DITEKAN): Efek Ambles Taktis */
          .pop-orange:active {
            transform: translateY(0px) scale(0.95) !important;
            box-shadow: inset 0 4px 10px rgba(0,0,0,0.9), 0 0 10px rgba(249,115,22,0.4) !important;
            border-top: 1px solid rgba(249, 115, 22, 0.5) !important;
            transition: all 0.05s ease-in !important;
          }
          
          /* Khusus Input Field (Tenggelam Dalam, Focus Orens) */
          .input-flush {
            background: #111111; /* Sedikit lebih gelap dari Titanium */
            box-shadow: inset 3px 3px 8px rgba(0,0,0,0.9), inset -1px -1px 3px rgba(255,255,255,0.03);
            border: 1px solid transparent;
            transition: all 0.4s ease;
          }
          .input-flush:focus {
            background: linear-gradient(145deg, rgba(249, 115, 22, 0.05), #18181B);
            border: 1px solid rgba(249, 115, 22, 0.6);
            box-shadow: 0 5px 15px rgba(249, 115, 22, 0.2), inset 0 0 8px rgba(249,115,22,0.15);
            transform: translateY(-2px);
            outline: none;
          }

          /* Teks & Ikon saat Pop Out (Menyala Orens) */
          .pop-orange:hover .icon-orange, .pop-orange-active .icon-orange {
            color: #f97316; /* Orange 500 */
            filter: drop-shadow(0 0 5px rgba(249, 115, 22, 0.6));
          }
          .pop-orange:hover .text-orange-glow, .pop-orange-active .text-orange-glow {
            color: #fdba74; /* Orange 300 */
            text-shadow: 0 0 8px rgba(249, 115, 22, 0.5);
          }

          /* 1. BLACK DOFF TACTICAL BUTTON (IDLE) */
          .btn-doff-orange {
            background: #111111; /* Hitam Doff Murni */
            border: 1px solid rgba(255, 255, 255, 0.05); /* Garis batas samar */
            /* Efek 3D fisik: Bayangan jatuh ke bawah + bayangan dalam (inset) */
            box-shadow: 
              inset 2px 2px 5px rgba(0,0,0,0.8), 
              inset -1px -1px 2px rgba(255,255,255,0.02),
              0 4px 6px rgba(0,0,0,0.6);
            color: #64748b; /* Ikon redup saat idle */
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
          }

          /* 2. HOVER STATE: VOLCANIC ORANGE TRANSFORM */
          .btn-doff-orange:hover {
            background: linear-gradient(145deg, #18181b 0%, #0a0a0a 100%); /* Hitam memanas */
            border: 1px solid rgba(249, 115, 22, 0.8); /* Border Oranye Menyala */
            transform: translateY(-3px) scale(1.05); /* Melompat maju ke arah user */
            box-shadow: 
              inset 1px 1px 2px rgba(249, 115, 22, 0.2), /* Cahaya memantul ke dalam */
              0 10px 20px -5px rgba(0, 0, 0, 0.9), /* Bayangan bawah makin pekat */
              0 0 15px rgba(249, 115, 22, 0.4); /* Glow oranye ke luar */
            z-index: 50;
          }

          /* Kilatan cahaya tipis melintas di tombol saat di-hover */
          .btn-doff-orange::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(249, 115, 22, 0.15), transparent);
            transform: skewX(-20deg);
            transition: none;
          }
          .btn-doff-orange:hover::after {
            left: 200%;
            transition: left 0.6s ease-out;
          }

          /* 3. ACTIVE STATE: DITEKAN (MECHANICAL PRESS) */
          .btn-doff-orange:active {
            transform: translateY(2px) scale(0.95);
            background: #0a0a0a;
            border-color: rgba(249, 115, 22, 0.3);
            box-shadow: 
              inset 0 6px 15px rgba(0,0,0,0.9), 
              0 0 5px rgba(249, 115, 22, 0.2);
            transition: all 0.05s ease-in;
          }

          /* Perubahan warna Ikon dan Teks saat di-hover */
          .btn-doff-orange .icon-doff {
            transition: all 0.3s ease;
          }
          .btn-doff-orange:hover .icon-doff {
            color: #f97316; /* Oranye 500 */
            filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.8));
          }
          
          .btn-doff-orange .text-doff {
            color: #64748b;
            transition: all 0.3s ease;
          }
          .btn-doff-orange:hover .text-doff {
            color: #ffffff; /* Teks berubah putih bersinar */
            text-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
          }

          /* CSS BARU: INPUT STRIP & COLLAPSE ANIMATION */
          .input-strip {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            transition: all 0.3s ease;
          }
          .input-strip:focus {
            background: rgba(255,255,255,0.06);
            border-color: #f97316;
            outline: none;
            box-shadow: 0 0 10px rgba(249,115,22,0.15);
          }
          
          .form-collapse {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.3s ease-out;
          }
          .form-collapse.open {
            grid-template-rows: 1fr;
          }
          .form-collapse-inner {
            overflow: hidden;
          }
        `}} />

        <div className="w-80 h-full flex flex-col">
          {/* HEADER SIDEBAR */}
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.5)] relative z-20 bg-[#18181B]">
            <div className="flex items-center justify-center overflow-hidden relative py-1 md:py-2 pointer-events-none">
              <div className="flex items-center justify-center pointer-events-none">
                <h1 className="font-light text-xl md:text-2xl tracking-[0.25em] uppercase m-0 leading-none text-slate-300 drop-shadow-md flex items-center pointer-events-none">
                  CREW 
                  <b className="font-black text-white ml-2 md:ml-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] pointer-events-none">
                    MATRIX
                  </b>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Tombol Logout Rata Background -> Hover Orens */}
              <button
                type="button"
                onClick={onLogout}
                className="relative z-[100] w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center flush-idle pop-orange cursor-pointer"
                title="Logout"
              >
                <Icon name="LogOut" size={14} className="icon-orange transition-all pointer-events-none" />
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="relative z-[100] w-8 h-8 rounded-lg flex items-center justify-center flush-idle pop-orange cursor-pointer md:hidden"
              >
                <Icon name="X" size={14} className="icon-orange transition-all pointer-events-none" />
              </button>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 pr-2 pb-4 custom-scrollbar">
              
              {/* MAIN MENU (OVERVIEW & MATRIX) */}
              <div className="mb-8 px-1">
                <p className="text-[8px] text-slate-600 font-bold tracking-[0.3em] uppercase mb-4 ml-1 pointer-events-none">
                  Main Menu
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("overview");
                      setSelectedCrewId(null);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`relative z-[100] flex flex-col items-start p-4 rounded-xl cursor-pointer text-left overflow-visible flush-idle pop-orange group ${
                      currentView === "overview" ? "pop-orange-active" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors duration-300 icon-orange bg-[#111111] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] pointer-events-none ${currentView === "overview" ? "text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "text-slate-500"}`}>
                      <Icon name="Home" size={16} className="pointer-events-none" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 text-orange-glow pointer-events-none ${currentView === "overview" ? "text-orange-300" : "text-slate-500"}`}>
                      Overview
                    </span>
                    <span className="text-slate-600 group-hover:text-slate-400 text-[7px] font-mono uppercase tracking-[0.2em] leading-tight transition-colors pointer-events-none">
                      Global_Status
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("matrix");
                      setSelectedCrewId(null);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`relative z-[100] flex flex-col items-start p-4 rounded-xl cursor-pointer text-left overflow-visible flush-idle pop-orange group ${
                      currentView === "matrix" ? "pop-orange-active" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors duration-300 icon-orange bg-[#111111] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] pointer-events-none ${currentView === "matrix" ? "text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "text-slate-500"}`}>
                      <Icon name="Grid" size={16} className="pointer-events-none" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 text-orange-glow pointer-events-none ${currentView === "matrix" ? "text-orange-300" : "text-slate-500"}`}>
                      Matrix
                    </span>
                    <span className="text-slate-600 group-hover:text-slate-400 text-[7px] font-mono uppercase tracking-[0.2em] leading-tight transition-colors pointer-events-none">
                      Full_Grid
                    </span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTER AREA */}
              <div className="border-t border-white/5 pt-5 mb-3 px-1">
                <p className="text-[8.5px] font-mono tracking-[0.25em] uppercase mb-4 ml-1 flex items-center gap-2 text-slate-500 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 pointer-events-none"></span>
                  [ DATABASE_NAV ]
                </p>

                {/* TOMBOL RAHASIA ADMIN: TAMPILKAN KRU OFFBOARD */}
                {isPip && (
                  <button 
                    type="button"
                    onClick={() => setShowOffboard(!showOffboard)}
                    className="w-full mb-3 py-2 rounded-xl flex items-center justify-between px-4 border border-white/5 bg-[#0a0a0a] shadow-inner transition-colors cursor-pointer group z-[100] relative"
                  >
                    <div className="flex items-center gap-2 pointer-events-none">
                      <Icon name={showOffboard ? "User" : "UserPlus"} size={14} className={showOffboard ? "text-orange-500" : "text-slate-600 group-hover:text-slate-400"} />
                      <span className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors ${showOffboard ? "text-orange-500" : "text-slate-600 group-hover:text-slate-400"}`}>
                        {showOffboard ? "GUEST MODE: ON" : "SHOW OFFBOARD CREW"}
                      </span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors pointer-events-none ${showOffboard ? "bg-orange-500/20" : "bg-white/5"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${showOffboard ? "bg-orange-500 left-[18px]" : "bg-slate-600 left-1"}`}></div>
                    </div>
                  </button>
                )}
                
                <div className="mb-5 space-y-3">
                  {/* Kolom Input Search (Rata -> Hover Orens) */}
                  <div className="relative group z-[100]">
                    <Icon 
                      name="Search" 
                      size={13} 
                      className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 transition-colors duration-300 z-10 pointer-events-none ${searchQuery ? 'text-orange-500 drop-shadow-[0_0_5px_#f97316]' : 'text-slate-600 group-focus-within:text-orange-500'}`} 
                    />
                    <input 
                      type="text"
                      placeholder="SCAN IDENTITY QUERY..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs font-mono text-slate-300 rounded-xl input-flush placeholder-slate-600 relative z-[100]"
                    />
                  </div>
                  
                  {/* Filter Buttons (Rata -> Pop Orens) */}
                  <div className="grid grid-cols-2 gap-2 relative z-10">
                    <button 
                      type="button"
                      onClick={() => setFilterStatus("all")}
                      className={`relative z-[100] py-2.5 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 flush-idle pop-orange cursor-pointer ${filterStatus === "all" ? "pop-orange-active" : ""}`}
                    >
                      {filterStatus === "all" && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] animate-pulse pointer-events-none"></span>}
                      <span className="pointer-events-none">Semua</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setFilterStatus("valid")}
                      className={`relative z-[100] py-2.5 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 flush-idle pop-orange cursor-pointer ${filterStatus === "valid" ? "pop-orange-active" : ""}`}
                    >
                      {filterStatus === "valid" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse pointer-events-none"></span>}
                      <span className="pointer-events-none">Valid</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setFilterStatus("critical")}
                      className={`relative z-[100] py-2.5 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 flush-idle pop-orange cursor-pointer ${filterStatus === "critical" ? "pop-orange-active" : ""}`}
                    >
                      {filterStatus === "critical" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse pointer-events-none"></span>}
                      <span className="pointer-events-none">Kritis</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setFilterStatus("expired")}
                      className={`relative z-[100] py-2.5 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 flush-idle pop-orange cursor-pointer ${filterStatus === "expired" ? "pop-orange-active" : ""}`}
                    >
                      {filterStatus === "expired" && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse pointer-events-none"></span>}
                      <span className="pointer-events-none">Expired</span>
                    </button>
                  </div>
                </div>

                {/* AREA BARU: ADD CREW COLLAPSIBLE FORM */}
                {isPip && (
                  <div className="mt-4 border-t border-white/5 pt-4 z-[100] relative">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(!isAddingNew)}
                      className="w-full py-2.5 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 btn-tactical cursor-pointer group shadow-sm"
                    >
                      <Icon name={isAddingNew ? "ChevronUp" : "Plus"} size={14} className="group-hover:text-orange-500 transition-colors pointer-events-none" />
                      <span className="pointer-events-none">{editingCrewId ? "EDITING CREW..." : "ADD NEW CREW"}</span>
                    </button>
                    
                    <div className={`form-collapse ${isAddingNew ? 'open' : ''}`}>
                      <div className="form-collapse-inner">
                        <div className="pt-3 pb-1">
                          <form onSubmit={handleSaveCrew} className="space-y-2.5 relative z-10">
                            <input 
                              type="text" 
                              value={inputCrewName} 
                              onChange={(e) => setInputCrewName(e.target.value)} 
                              placeholder="Input Identity..." 
                              className="w-full px-3 py-2 text-xs font-mono font-medium text-slate-200 rounded-lg input-strip placeholder-slate-600 outline-none" 
                              required 
                            />
                            
                            {/* MENU GANTI STATUS: MUNCUL HANYA SAAT EDIT */}
                            {editingCrewId && (
                              <div className="w-full relative z-[100] mt-1">
                                <select 
                                  value={inputCrewStatus}
                                  onChange={(e) => setInputCrewStatus(e.target.value)}
                                  className="w-full px-3 py-2 text-[10px] uppercase tracking-widest font-mono font-bold text-slate-200 rounded-lg input-strip cursor-pointer outline-none"
                                  style={{ color: inputCrewStatus === "Sign Off" ? "#ef4444" : "#10b981" }}
                                >
                                  <option value="Onboard" className="bg-[#111111] text-emerald-500">🟢 STATUS: ONBOARD</option>
                                  <option value="Sign Off" className="bg-[#111111] text-rose-500">🔴 STATUS: SIGN OFF</option>
                                </select>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={inputCrewRank} 
                                onChange={(e) => setInputCrewRank(e.target.value)} 
                                placeholder="Input Rank..." 
                                className="w-full px-3 py-2 text-xs font-mono font-medium text-slate-200 rounded-lg flex-1 input-strip placeholder-slate-600 outline-none" 
                                required 
                              />
                              <button 
                                type="submit" 
                                className="relative z-[100] px-3 rounded-lg font-mono text-[10px] font-black tracking-widest flex items-center justify-center min-w-[60px] flush-idle pop-orange cursor-pointer" 
                                title={editingCrewId ? "SIMPAN OVERRIDE" : "EKSEKUSI PENAMBAHAN"}
                              >
                                <span className="pointer-events-none">{editingCrewId ? "UPDT" : "EXEC"}</span>
                              </button>
                              {editingCrewId && (
                                <button 
                                  type="button" 
                                  onClick={() => { setEditingCrewId(null); setInputCrewName(""); setInputCrewRank(""); setInputCrewStatus("Onboard"); setIsAddingNew(false); }} 
                                  className="relative z-[100] px-2.5 bg-rose-950/30 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                >
                                  <Icon name="X" size={14} className="pointer-events-none" />
                                </button>
                              )}
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================== */}
              {/* LIST KRU - MINIMALIST DARK 3D GLASS              */}
              {/* ============================================== */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-3 md:px-5 space-y-2 pb-6 pt-4 relative z-10">
                
                <style dangerouslySetInnerHTML={{ __html: `
                  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
                  .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                  
                  /* 1. KOTAK KACA HITAM 3D (MINIMALIS) */
                  .sidebar-crew-glass-dark {
                    background: rgba(10, 15, 25, 0.65); /* Hitam transparan */
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    
                    /* Efek kaca tebal */
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-top: 1px solid rgba(255, 255, 255, 0.2); 
                    border-bottom: 1px solid rgba(0, 0, 0, 0.9); 
                    border-radius: 10px; /* Sudut sedikit lebih tegas */
                    
                    box-shadow: 
                      0 6px 12px -4px rgba(0, 0, 0, 0.7),
                      inset 0 1px 2px rgba(255, 255, 255, 0.1); 
                      
                    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                    position: relative;
                    overflow: hidden;
                  }
                  
                  /* SAAT DI HOVER: Kaca sedikit terangkat & garis menyala */
                  .sidebar-crew-glass-dark:hover, .sidebar-crew-glass-dark.is-selected {
                    transform: translateY(-2px);
                    background: rgba(15, 22, 35, 0.85); 
                    box-shadow: 
                      0 10px 20px -5px rgba(0, 0, 0, 0.9),
                      0 0 0 1px rgba(249, 115, 22, 0.4), /* Garis oranye tipis keliling */
                      inset 0 1px 2px rgba(255, 255, 255, 0.2);
                    z-index: 20;
                  }

                  /* Indikator kiri (Oranye) untuk item terpilih */
                  .sidebar-crew-glass-dark::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: #f97316; 
                    box-shadow: 0 0 10px #f97316;
                    transform: scaleY(0);
                    transition: transform 0.3s ease;
                    transform-origin: center;
                  }
                  .sidebar-crew-glass-dark.is-selected::before {
                    transform: scaleY(1);
                  }

                  /* Teks Super Terang (High Contrast) */
                  .text-bright-contrast {
                    color: #ffffff; /* Putih murni */
                    text-shadow: 
                      0 0 8px rgba(255, 255, 255, 0.3), /* Glow putih halus */
                      0 2px 4px rgba(0, 0, 0, 0.9); /* Bayangan hitam tegas agar lepas dari background */
                    transition: all 0.3s ease;
                  }
                  .sidebar-crew-glass-dark:hover .text-bright-contrast {
                    color: #ffffff;
                    transform: translateY(-1px);
                  }

                  /* WADAH TOMBOL AKSI (Versi Gelap) */
                  .action-buttons-container-dark {
                    position: absolute;
                    right: 4px;
                    top: 50%;
                    transform: translateY(-50%) translateX(10px);
                    opacity: 0;
                    visibility: hidden;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    /* Gradasi hitam pekat agar menutupi teks panjang dengan rapi */
                    background: linear-gradient(to right, transparent, rgba(10,15,25,0.95) 20%, rgba(10,15,25,1) 100%);
                    padding: 6px 6px 6px 20px;
                    border-radius: 0 10px 10px 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 10;
                  }
                  .sidebar-crew-glass-dark:hover .action-buttons-container-dark {
                    transform: translateY(-50%) translateX(0);
                    opacity: 1;
                    visibility: visible;
                  }

                  /* Tombol Aksi Micro 3D Gelap */
                  .btn-action-micro-dark {
                    width: 26px; /* Sedikit lebih mungil */
                    height: 26px;
                    border-radius: 6px;
                    background: rgba(20, 25, 35, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5);
                  }
                  .btn-action-micro-dark:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.8);
                  }
                  .btn-action-micro-dark.drag:hover { background: rgba(14, 165, 233, 0.15); color: #38bdf8; border-color: #0ea5e9; } 
                  .btn-action-micro-dark.edit:hover { background: rgba(249, 115, 22, 0.15); color: #fb923c; border-color: #f97316; } 
                  .btn-action-micro-dark.delete:hover { background: rgba(244, 63, 94, 0.15); color: #fb7185; border-color: #f43f5e; } 
                `}} />

                {filteredCrews.map((crew, index) => {
                  const isSelected = selectedCrewId === crew.id;
                  const isOffboard = crew.status === "Sign Off";
                  const isDragging = draggedCrewId === crew.id;
                  const isDragOver = dragOverCrewId === crew.id;
                  
                  return (
                    <div 
                      key={crew.id} 
                      draggable={isPip}
                      onDragStart={(e) => handleDragStart(e, crew.id)}
                      onDragOver={(e) => handleDragOver(e, crew.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, crew.id)}
                      onDragEnd={() => { setDraggedCrewId(null); setDragOverCrewId(null); }}
                      onClick={() => {
                        setSelectedCrewId(crew.id);
                        setCurrentView("crew");
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`sidebar-crew-glass-dark group cursor-pointer ${isOffboard ? 'opacity-60 grayscale' : ''} ${isSelected ? 'is-selected' : ''} ${isDragging ? 'opacity-30 scale-95 blur-[1px]' : ''} ${isDragOver ? '!border-[1px] !border-orange-500 !shadow-[0_0_15px_rgba(249,115,22,0.4)]' : ''}`}
                    >
                      {/* PADDING DIPERKECIL MENJADI py-2 px-3 AGAR KOTAK LEBIH MINIMALIS */}
                      <div className="flex items-center gap-3 py-2 px-3 relative z-10 w-full">
                        
                        {/* UKURAN LOGO DIPERKECIL MENJADI w-8 h-8 */}
                        <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-all duration-300 shadow-inner border border-white/5 ${isSelected ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-[#0f172a] text-slate-400 group-hover:bg-[#1e293b] group-hover:text-white'}`}>
                          <Icon name={isSelected ? "UserCheck" : "User"} size={14} />
                        </div>

                        {/* TEKS NAMA (FULL) */}
                        <div className="flex flex-col min-w-0 flex-1 py-0.5">
                          {/* Nama Crew: Putih Terang, break-words agar tidak kepotong */}
                          <span className="font-jakarta text-[11px] font-extrabold uppercase tracking-widest text-bright-contrast leading-tight break-words pr-1">
                            {crew.name}
                          </span>
                          
                          <div className="flex items-center gap-1.5 mt-[2px]">
                            <span className="text-[8px] font-mono tracking-[0.2em] text-slate-500 uppercase transition-colors group-hover:text-slate-400">
                              RANK // {crew.rank}
                            </span>
                            {isOffboard && (
                              <span className="text-[6.5px] font-bold tracking-widest bg-rose-500/20 border border-rose-500/30 text-rose-400 px-1 py-[1px] rounded uppercase shadow-sm">
                                OFFBOARD
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* --- WADAH TOMBOL AKSI GELAP --- */}
                      {isPip && (
                        <div className="action-buttons-container-dark">
                          <div className="btn-action-micro-dark drag cursor-grab active:cursor-grabbing" title="Geser Urutan" onClick={(e) => e.stopPropagation()}>
                            <Icon name="GripVertical" size={12} />
                          </div>
                          
                          <button onClick={(e) => { e.stopPropagation(); handleStartEditCrew(crew); }} 
                            className="btn-action-micro-dark edit" title="Edit Data Crew">
                            <Icon name="Edit2" size={12} />
                          </button>
                          
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCrew(crew.id); }} 
                            className="btn-action-micro-dark delete" title="Hapus Crew">
                            <Icon name="Trash2" size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredCrews.length === 0 && (
                  <div className="text-center py-12 opacity-60 bg-black/20 rounded-xl border border-white/5">
                    <Icon name="Users" size={28} className="mx-auto mb-3 text-slate-500" />
                    <p className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase">NO CREW FOUND</p>
                  </div>
                )}
              </div>
              
              <div className="h-24 w-full flex-shrink-0 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </aside>
      {/* ========================================================================= */}

      <main className="flex-1 relative bg-[#02040A] overflow-hidden flex flex-col w-full">
        
        {/* ========================================================================= */}
        {/* LATAR BELAKANG KANVAS: PUTIH ES & GRADASI HITAM (ARCTIC GLACIER)          */}
        {/* ========================================================================= */}
        {/* Dominan Putih Es dari kiri atas, memudar menjadi gradasi hitam di kanan bawah */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#f0f9ff] via-[#94a3b8] to-[#02040A] pointer-events-none"></div>

        {/* Pola Titik (Dot Grid) sangat tipis agar putihnya bertekstur dan tidak polos */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }}></div>

        {/* EFEK CAHAYA MOUSE (Mix-Blend Overlay agar membaur cantik dengan putih es) */}
        <div ref={glowRef} className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300 mix-blend-overlay" style={{ background: `radial-gradient(600px circle at 0px 0px, ${theme?.hex}60, transparent 40%)` }} />

        {/* ========================================================================= */}
        {/* HEADER: MAXIMAL 3D FLOATING GLASS (BRIGHTER IDLE TEXT)                    */}
        {/* ========================================================================= */}
        <header className="px-3 md:px-6 py-4 md:py-6 z-[9999] flex flex-row justify-between items-center gap-2 md:gap-0 relative bg-transparent border-none shadow-none flex-shrink-0 pointer-events-auto">
          
          <style dangerouslySetInnerHTML={{ __html: `
            /* ========================================================= */
            /* 3D FLOATING GLASS (HITAM DOFF MEKANIKAL)                  */
            /* ========================================================= */
            .btn-tactical {
              background: rgba(10, 15, 25, 0.65); 
              backdrop-filter: blur(16px) saturate(120%);
              -webkit-backdrop-filter: blur(16px) saturate(120%);
              
              border: 1px solid rgba(255, 255, 255, 0.05);
              border-top: 1px solid rgba(255, 255, 255, 0.3); 
              border-bottom: 1px solid rgba(0, 0, 0, 0.9);
              
              box-shadow: 
                inset 0 1px 2px rgba(255,255,255,0.15), 
                inset 0 -4px 6px rgba(0,0,0,0.8), 
                0 4px 6px rgba(0,0,0,0.5), 
                0 15px 25px -5px rgba(0,0,0,0.6); 
                
              /* WARNA TEKS & IKON SAAT DIAM (DITERANGKAN MENJADI PERAK) */
              color: #cbd5e1; 
              
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); 
              pointer-events: auto !important; 
            }
            
            .btn-tactical:hover {
              background: rgba(15, 20, 35, 0.85); 
              border-color: rgba(0, 229, 255, 0.4);
              border-top: 1px solid rgba(255, 255, 255, 0.5); 
              color: #ffffff; /* Saat di-hover menjadi Putih Murni */
              transform: translateY(-5px) scale(1.05); 
              
              box-shadow: 
                inset 0 1px 3px rgba(0, 229, 255, 0.4), 
                inset 0 -4px 6px rgba(0,0,0,0.9), 
                0 8px 10px rgba(0,0,0,0.5), 
                0 25px 35px -5px rgba(0,0,0,0.7), 
                0 0 20px rgba(0, 229, 255, 0.3); 
            }
            
            .btn-tactical.btn-orange:hover {
              border-color: rgba(249, 115, 22, 0.5);
              box-shadow: 
                inset 0 1px 3px rgba(249, 115, 22, 0.4), 
                inset 0 -4px 6px rgba(0,0,0,0.9), 
                0 8px 10px rgba(0,0,0,0.5), 
                0 25px 35px -5px rgba(0,0,0,0.7), 
                0 0 20px rgba(249, 115, 22, 0.3);
            }
            
            .btn-tactical:active {
              transform: translateY(3px) scale(0.94);
              background: rgba(5, 8, 15, 0.95);
              box-shadow: 
                inset 0 6px 15px rgba(0,0,0,0.95), 
                0 2px 4px rgba(0,0,0,0.4);
            }
            
            .btn-tactical .icon-tactical { transition: all 0.3s ease-out; }
            .btn-tactical:hover .icon-tactical { color: #00e5ff; filter: drop-shadow(0 0 6px rgba(0, 229, 255, 0.8)); }
            .btn-tactical.btn-orange:hover .icon-tactical { color: #f97316; filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.8)); }

            .header-scroll::-webkit-scrollbar { display: none; }
            .header-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          {/* ============================================== */}
          {/* AREA KIRI: TOMBOL MENU */}
          {/* ============================================== */}
          <div className="flex items-center flex-shrink-0 relative z-[9999] pointer-events-auto">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center rounded-[10px] btn-tactical cursor-pointer"
              title="Menu"
            >
              <Icon name="Menu" size={16} className="icon-tactical md:w-[18px] md:h-[18px]" />
            </button>
          </div>

          {/* ============================================== */}
          {/* AREA KANAN: OPERATOR TAG & TOMBOL ACTION */}
          {/* ============================================== */}
          <div className="flex flex-row items-center justify-end gap-3 flex-1 overflow-x-auto header-scroll relative z-[9999] pointer-events-auto pl-4 py-2">
            
            {/* OPERATOR TAG */}
            <div className="hidden sm:flex items-center gap-2.5 px-4 h-[28px] md:h-[32px] rounded-full cursor-default group transition-all duration-400 ease-out pointer-events-auto"
                 style={{
                   background: 'rgba(10, 15, 25, 0.65)',
                   backdropFilter: 'blur(16px) saturate(120%)',
                   border: '1px solid rgba(255, 255, 255, 0.05)',
                   borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                   borderBottom: '1px solid rgba(0, 0, 0, 0.9)',
                   boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -4px 6px rgba(0,0,0,0.8), 0 4px 6px rgba(0,0,0,0.5), 0 15px 25px -5px rgba(0,0,0,0.6)'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                   e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(249, 115, 22, 0.3), inset 0 -4px 6px rgba(0,0,0,0.9), 0 8px 10px rgba(0,0,0,0.5), 0 20px 30px -5px rgba(0,0,0,0.7), 0 0 15px rgba(249, 115, 22, 0.2)';
                   e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0) scale(1)';
                   e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -4px 6px rgba(0,0,0,0.8), 0 4px 6px rgba(0,0,0,0.5), 0 15px 25px -5px rgba(0,0,0,0.6)';
                   e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]"></div>
              {/* Teks "OP //" juga diterangkan */}
              <span className="font-michroma text-[7.5px] md:text-[8px] text-slate-300 group-hover:text-white tracking-[0.25em] uppercase transition-colors mt-0.5">
                OP //
              </span>
              <span className="font-michroma text-[8.5px] md:text-[9px] font-bold text-orange-500 tracking-[0.2em] uppercase drop-shadow-[0_0_5px_rgba(249,115,22,0.8)] mt-0.5">
                {userName || "GUEST"}
              </span>
            </div>

            {/* REFRESH BUTTON */}
            <button onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1500); }} 
              className={`flex-shrink-0 w-8 h-[28px] md:w-10 md:h-[32px] rounded-[10px] flex items-center justify-center btn-tactical cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
              title="Sinkronisasi Data" disabled={isRefreshing}>
              <Icon name="RefreshCw" size={13} className="icon-tactical md:w-[15px] md:h-[15px]" />
            </button>

            {isPip && (
              <>
                {/* SYSTEM SETTINGS */}
                <button onClick={() => setIsSettingsOpen(true)} className="flex-shrink-0 w-8 h-[28px] md:w-10 md:h-[32px] rounded-[10px] flex items-center justify-center btn-tactical cursor-pointer" title="System Settings">
                  <Icon name="Settings" size={13} className="icon-tactical md:w-[15px] md:h-[15px]" />
                </button>
                
                {/* EXPORT CSV */}
                <button onClick={exportToCSV} className="flex-shrink-0 h-[28px] md:h-[32px] px-3 md:px-4 rounded-[10px] flex items-center justify-center gap-1.5 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] btn-tactical cursor-pointer">
                  <Icon name="Download" size={13} className="icon-tactical md:w-[14px] md:h-[14px]" /> 
                  <span className="hidden md:block mt-0.5 font-michroma">CSV</span>
                </button>
                
                {/* EXPORT PDF */}
                <button onClick={exportToPDF} className="flex-shrink-0 h-[28px] md:h-[32px] px-3 md:px-4 rounded-[10px] flex items-center justify-center gap-1.5 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] btn-tactical cursor-pointer">
                  <Icon name="FileDown" size={13} className="icon-tactical md:w-[14px] md:h-[14px]" /> 
                  <span className="hidden md:block mt-0.5 font-michroma">PDF</span>
                </button>

                {/* ADD CERT */}
                {currentView === "crew" && selectedCrew && (
                  <button onClick={() => { setEditingCert(null); setIsModalOpen(true); }} 
                    className="flex-shrink-0 h-[28px] md:h-[32px] px-4 md:px-5 rounded-[10px] flex items-center justify-center gap-1.5 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] btn-tactical btn-orange cursor-pointer">
                    {/* Teks "ADD CERT" juga diterangkan */}
                    <span className="flex items-center gap-1 mt-0.5 text-slate-300 group-hover:text-white font-michroma transition-colors">
                      <span className="hidden sm:inline">ADD</span> CERT <span className="text-[13px] leading-none -mt-0.5 text-orange-500">+</span>
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {}
        <div key={currentView + (selectedCrewId || '')} className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 z-10 pb-20 md:pb-8 relative anim-crt-wipe custom-scrollbar">
          {currentView === "overview" ? renderOverviewDashboard() : currentView === "matrix" ? renderMatrixView() : (
            <>
              {selectedCrew && (
                <>
                  <div className="w-full mb-6 pt-5 px-2 relative z-20 group select-none">
                    <style dangerouslySetInnerHTML={{ __html: `
                      @keyframes sweepLeft { 0% { transform: translateX(-100%); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(200%); opacity: 0; } }
                      .anim-laser-sweep { animation: sweepLeft 3s infinite cubic-bezier(0.4, 0, 0.2, 1); }
                    `}} />
                    
                    {/* DEKLARASI WARNA STATUS (Aman = Cyan Neon, Kritis = Merah Crimson) */}
                    {(() => {
                      const laserColor = isSystemAlertActive ? '#e11d48' : '#00e5ff'; 
                      const laserGlow = isSystemAlertActive ? 'rgba(225,29,72,0.6)' : 'rgba(0,229,255,0.5)';
                      const animSpeed = isSystemAlertActive ? 'anim-plasma-kritis' : 'anim-plasma-normal';
                      
                      return (
                        <div className="relative w-full h-[36px] mb-8 flex items-center gap-3">
                          
                          {/* 1. KAPSUL KIRI (JUDUL) DENGAN PANTULAN CAHAYA (LIGHT BLEED) */}
                          <div 
                            className="flex items-center px-4 py-1.5 bg-[#0a0f19] rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8),0_5px_15px_rgba(0,0,0,0.5)] z-10 transition-all duration-500"
                            style={{ border: `1px solid ${laserGlow}`, boxShadow: `inset 2px 2px 4px rgba(0,0,0,0.8), 0 0 15px ${laserGlow}` }}
                          >
                            <h4 className="font-michroma text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold text-slate-300 m-0">
                              SERTIFIKAT <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] ml-1">{selectedCrew.name}</span>
                            </h4>
                          </div>

                          {/* 2. JALUR REL PLASMA (THE TRENCH) */}
                          <div className="flex-1 h-[8px] bg-[#03060d] rounded-full relative overflow-hidden shadow-[inset_0_3px_5px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.05)] border border-[#111]">
                              
                             {/* Inti Plasma & Aura */}
                             <div 
                               className={`absolute top-0 h-full w-[40%] ${animSpeed}`}
                               style={{ 
                                 background: `linear-gradient(90deg, transparent, ${laserColor}, transparent)`,
                                 boxShadow: `0 0 10px ${laserGlow}, 0 0 20px ${laserColor}`
                               }}
                             >
                               {/* Mata Pemindai (Flare Putih di Tengah Plasma) */}
                               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-white shadow-[0_0_10px_2px_white]"></div>
                             </div>
                          </div>

                          {/* 3. KAPSUL KANAN (ANGKA) DENGAN PANTULAN CAHAYA (LIGHT BLEED) */}
                          <div 
                            className="flex items-center gap-2 px-4 py-1.5 bg-[#0a0f19] rounded-full z-10 transition-all duration-500"
                            style={{ border: `1px solid ${laserGlow}`, boxShadow: `inset 2px 2px 4px rgba(0,0,0,0.8), 0 0 15px ${laserGlow}` }}
                          >
                            <Icon name="FileText" size={14} style={{ color: laserColor }} className="drop-shadow-[0_0_5px_currentColor]" />
                            <span className="text-[10px] font-black text-slate-500 font-michroma">:</span>
                            <span className="text-[11px] font-black font-michroma text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                              {totalSertifikatInti < 10 ? `0${totalSertifikatInti}` : totalSertifikatInti}
                            </span>
                          </div>

                        </div>
                      );
                    })()}

                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start pl-1 mt-1">
                      {isSystemAlertActive ? (
                        <>
                          {expiredDocsCount > 0 && (
                            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm w-fit mt-2 pointer-events-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse pointer-events-none"></div>
                              <span 
                                className="font-michroma text-[8px] font-bold tracking-[0.2em] uppercase pointer-events-none"
                                style={{ color: '#1a1a1a' }}
                              >
                                <span className="text-rose-600 mr-1 pointer-events-none">{expiredDocsCount}</span> DOKUMEN <span className="text-rose-700 pointer-events-none">EXPIRED</span>
                              </span>
                            </div>
                          )}
                          {criticalDocsCount > 0 && (
                            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm w-fit mt-2 pointer-events-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse pointer-events-none"></div>
                              <span 
                                className="font-michroma text-[8px] font-bold tracking-[0.2em] uppercase pointer-events-none"
                                style={{ color: '#1a1a1a' }}
                              >
                                <span className="text-amber-600 mr-1 pointer-events-none">{criticalDocsCount}</span> DOKUMEN <span className="text-amber-700 pointer-events-none">KRITIS</span>
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm w-fit mt-2 pointer-events-none">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse pointer-events-none"></div>
                          <span 
                            className="font-michroma text-[8px] font-bold tracking-[0.2em] uppercase pointer-events-none"
                            style={{ color: '#1a1a1a' }}
                          >
                            SEMUA DOKUMEN <span className="text-emerald-700 pointer-events-none">VALID & AMAN</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fadeIn relative z-20 mt-4">
                    {displayCerts.length > 0 ? (
                      displayCerts.map((cert, index) => {
                        const status = getExpiryStatus(cert.expiryDate, theme);
                        const isExpired = status.days <= 0;
                        
                        // Eksekusi Deteksi 2026: Valid, Critical, Expired
                        let statusRgb = "52, 211, 153"; // Default Emerald (Aman)
                        if (status.label === "EXPIRED") statusRgb = "244, 63, 94"; // Rose/Merah
                        else if (status.label === "CRITICAL") statusRgb = "251, 191, 36"; // Amber/Kuning

                        const isDraggingCert = draggedCertId === cert.id;
                        const isDragOverCert = dragOverCertId === cert.id;

                        let shortCertName = cert.name;
                        const match = cert.name.match(/\(([^)]+)\)/);
                        if (match) shortCertName = match[1].toUpperCase();
                        else {
                          const dictKey = Object.keys(CERT_DICTIONARY).find(key => CERT_DICTIONARY[key].toLowerCase() === cert.name.toLowerCase());
                          if (dictKey) shortCertName = dictKey.toUpperCase();
                        }
                        
                        // --- LOGIKA BARU: DETEKSI LOGO OTOMATIS DARI PANGKAT (RANK) ---
                        const rankStr = selectedCrew.rank ? selectedCrew.rank.toUpperCase() : "";
                        const isEngine = rankStr.includes('ENG') || rankStr.includes('OILER') || rankStr.includes('WIPER') || rankStr.includes('FITTER') || rankStr.includes(' E') || rankStr.includes('/E');
                        const RoleIcon = isEngine ? "Anchor" : "ShipWheel";

                        return (
                          <div 
                            key={cert.id} 
                            draggable={isPip}
                            onDragStart={(e) => handleCertDragStart(e, cert.id)}
                            onDragOver={(e) => handleCertDragOver(e, cert.id)}
                            onDragLeave={handleCertDragLeave}
                            onDrop={(e) => handleCertDrop(e, cert.id)}
                            onDragEnd={() => { setDraggedCertId(null); setDragOverCertId(null); }}
                            /* Fungsi Pelacak Kursor untuk Menggerakkan Efek 3D Parallax pada Logo */
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = (e.clientX - rect.left) / rect.width - 0.5;
                              const y = (e.clientY - rect.top) / rect.height - 0.5;
                              e.currentTarget.style.setProperty('--mx', x);
                              e.currentTarget.style.setProperty('--my', y);
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.setProperty('--mx', 0);
                              e.currentTarget.style.setProperty('--my', 0);
                            }}
                            style={{
                              '--status-rgb': status.label === "EXPIRED" ? "244, 63, 94" : status.label === "CRITICAL" ? "251, 191, 36" : "52, 211, 153"
                            }}
                            className={`scroll-grid-2026 relative overflow-hidden w-full p-6 rounded-[2rem] bg-[#02040A] border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] group transition-all duration-500 hover:translate-y-[-10px] hover:scale-[1.01] cursor-default
                              ${isPip ? 'active:cursor-grabbing' : ''}
                              ${isDraggingCert ? 'opacity-30 scale-95 blur-[2px]' : ''}
                              ${isDragOverCert ? 'border-2 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.5)] z-50' : ''}
                            `}
                          >
                            
                            {/* INJEKSI ENGINES CSS: KETEBALAN 3D LOGO ICE & REFLEKSI KACA KENTAL */}
                            <style dangerouslySetInnerHTML={{ __html: `
                              /* 1. LUXURY 3D OBSIDIAN CARD (2026 EDITION) */
                              .cert-lux-3d-card {
                                background: #02040A; /* Hitam Murni */
                                border-radius: 1.5rem;
                                box-shadow: 
                                  0 20px 40px -10px rgba(0, 0, 0, 0.5), /* Bayangan Kontras */
                                  inset 0 1px 1px rgba(255, 255, 255, 0.15), /* Cahaya Kaca Atas */
                                  inset 1px 0 1px rgba(255, 255, 255, 0.05),
                                  inset 0 -6px 0 0 rgba(0, 0, 0, 1), /* Bibir Bawah Fisik */
                                  inset 0 -7px 0 0 rgba(255, 255, 255, 0.05); /* Garis pantul bawah */
                                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                                border: 1px solid rgba(255, 255, 255, 0.05);
                              }
                              .cert-lux-3d-card:hover {
                                transform: translateY(-12px) scale(1.02);
                                box-shadow: 
                                  0 35px 60px -15px rgba(0, 0, 0, 0.7),
                                  0 15px 25px -5px rgba(0, 0, 0, 0.4),
                                  inset 0 1px 2px rgba(255, 255, 255, 0.25),
                                  inset 0 -6px 0 0 rgba(0, 0, 0, 1),
                                  inset 0 -7px 0 0 rgba(255, 255, 255, 0.1);
                              }

                              /* 2. MOUSE-TRACKING 3D GLASS LOGO PARALLAX (SHAPE-CONTOUR ICE EDITION) */
                              .logo-parallax {
                                transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                                /* Posisi Diam: Terlihat jelas, miring, dan redup */
                                transform: translate3d(10px, 0, 0) scale(0.85) rotate(-15deg);
                                opacity: 0.4;
                                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                              }
                              
                              .cert-lux-3d-card:hover .logo-parallax {
                                /* Melompat keluar mengikuti mouse */
                                transform: translate3d(calc(var(--mx, 0) * 60px - 15px), calc(var(--my, 0) * 60px), 80px) scale(1.3) rotate(0deg);
                                opacity: 1;
                                filter: 
                                  drop-shadow(0 -2px 1.5px rgba(255, 255, 255, 0.95))
                                  drop-shadow(0 10px 8px rgba(0, 0, 0, 0.8))
                                  drop-shadow(0 0 15px rgba(0, 229, 255, 0.6))
                                  drop-shadow(0 0 35px rgba(255, 255, 255, 0.3));
                              }

                              /* Adaptasi Jika Status Expired (Merah Kritis) */
                              .cert-lux-3d-card:hover .logo-parallax.is-expired {
                                filter: 
                                  drop-shadow(0 -2px 1.5px rgba(255, 255, 255, 0.95))
                                  drop-shadow(0 10px 8px rgba(0, 0, 0, 0.8))
                                  drop-shadow(0 0 15px rgba(244, 63, 94, 0.7))
                                  drop-shadow(0 0 35px rgba(244, 63, 94, 0.4));
                              }

                              /* 1. ANIMASI 3D LOGO (KEMUDI / JANGKAR) MENGIKUTI MOUSE - ICE EDITION */
                              .engine-3d-logo {
                                color: rgba(255, 255, 255, 0.85);
                                filter: 
                                  drop-shadow(2px 4px 6px rgba(0,0,0,0.9)) 
                                  drop-shadow(0 0 12px rgba(0, 229, 255, 0.3));
                                transform: translate3d(calc(var(--mx, 0) * 35px + 10px), calc(var(--my, 0) * 35px), 0) scale(1.1) rotate(-10deg);
                                transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), filter 0.4s ease, color 0.4s ease, opacity 0.4s ease;
                                opacity: 0.4;
                              }
                              .group:hover .engine-3d-logo {
                                opacity: 1;
                                color: #ffffff;
                                /* Efek Melompat Keluar Menembus Kaca (Pop-Out) */
                                transform: translate3d(calc(var(--mx, 0) * 65px - 5px), calc(var(--my, 0) * 65px), 80px) scale(1.45) rotate(0deg);
                                filter: 
                                  drop-shadow(15px 30px 25px rgba(0,0,0,0.95)) 
                                  drop-shadow(0 0 30px rgba(var(--status-rgb), 0.6));
                              }

                              /* Adaptasi Jika Status Expired (Merah Kritis) */
                              .group:hover .engine-3d-logo.is-expired {
                                filter: 
                                  drop-shadow(0 -2px 1.5px rgba(255, 255, 255, 0.95))
                                  drop-shadow(0 10px 8px rgba(0, 0, 0, 0.8))
                                  drop-shadow(0 0 15px rgba(244, 63, 94, 0.7))
                                  drop-shadow(0 0 35px rgba(244, 63, 94, 0.4));
                              }

                              /* 2. UNIFIED 3D GLASS BADGE (KOTAK GABUNGAN STATUS & DESKRIPSI) */
                              .unified-3d-glass-box {
                                background: rgba(10, 14, 23, 0.85);
                                border: 1px solid rgba(255, 255, 255, 0.03);
                                box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.4);
                                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                                transform-origin: center;
                              }
                              
                              /* Efek Breathing/Pulse 3D Glass 2026 saat Kritis/Expired (Mode Normal) */
                              @keyframes glass-pulse-3d {
                                0%, 100% { 
                                  transform: scale(1) translateY(0);
                                  box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.4), 0 0 0 rgba(var(--status-rgb), 0); 
                                  background: rgba(10, 14, 23, 0.85);
                                  border-color: rgba(255, 255, 255, 0.03);
                                }
                                50% { 
                                  transform: scale(1.05) translateY(-3px);
                                  box-shadow: inset 0 1px 2px rgba(255,255,255,0.2), 0 12px 20px -5px rgba(0,0,0,0.6), 0 0 20px rgba(var(--status-rgb), 0.6); 
                                  background: rgba(var(--status-rgb), 0.15);
                                  border-color: rgba(var(--status-rgb), 0.5);
                                }
                              }

                              /* Efek Breathing/Pulse 3D Glass 2026 saat Kritis/Expired (Mode Hover) */
                              @keyframes glass-pulse-3d-hover {
                                0%, 100% { 
                                  transform: translateY(-5px) scale(1.05);
                                  box-shadow: 
                                    0 20px 35px -5px rgba(0, 0, 0, 0.7),
                                    0 0 20px -2px rgba(var(--status-rgb), 0.4),
                                    inset 0 1px 2px rgba(255, 255, 255, 0.4);
                                  background: rgba(var(--status-rgb), 0.12);
                                  border-color: rgba(var(--status-rgb), 0.45);
                                }
                                50% { 
                                  transform: translateY(-10px) scale(1.1);
                                  box-shadow: 
                                    0 30px 45px -5px rgba(0, 0, 0, 0.8),
                                    0 0 35px 5px rgba(var(--status-rgb), 0.8),
                                    inset 0 2px 4px rgba(255, 255, 255, 0.6);
                                  background: rgba(var(--status-rgb), 0.25);
                                  border-color: rgba(var(--status-rgb), 0.8);
                                }
                              }

                              .animate-glass-pulse { 
                                animation: glass-pulse-3d 2s infinite ease-in-out; 
                              }

                              /* Hover state standard untuk badge yang Aman (Normal) */
                              .group:hover .unified-3d-glass-box:not(.animate-glass-pulse) {
                                background: rgba(var(--status-rgb), 0.12);
                                backdrop-filter: blur(20px);
                                -webkit-backdrop-filter: blur(20px);
                                border: 1px solid rgba(var(--status-rgb), 0.45);
                                border-top: 1px solid rgba(255, 255, 255, 0.35);
                                transform: translateY(-5px) translateZ(30px);
                                box-shadow: 
                                  0 20px 35px -5px rgba(0, 0, 0, 0.7),
                                  0 0 20px -2px rgba(var(--status-rgb), 0.4),
                                  inset 0 1px 2px rgba(255, 255, 255, 0.4);
                              }

                              /* Hover state khusus untuk badge yang sedang Pulse (Kritis) */
                              .group:hover .unified-3d-glass-box.animate-glass-pulse {
                                animation: glass-pulse-3d-hover 2s infinite ease-in-out;
                                backdrop-filter: blur(20px);
                                -webkit-backdrop-filter: blur(20px);
                                border-top: 1px solid rgba(255, 255, 255, 0.35);
                              }
                            `}} />

                            {/* ========================================================================= */}
                            {/* TOMBOL EDIT/DELETE (HANYA TERLIHAT OLEH PIP/ADMIN) */}
                            {/* ========================================================================= */}
                            {isPip && (
                              <div className={`absolute top-5 right-5 flex flex-col gap-1.5 z-[100] transition-all duration-300 transform ${isDraggingCert || isDragOverCert ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}`}>
                                <div className="flex flex-col gap-1.5 justify-end bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
                                  <div className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing flex items-center justify-center"><Icon name="Menu" size={13} className="pointer-events-none" /></div>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setEditingCert(cert); setIsModalOpen(true); }} className="relative z-[100] p-1.5 rounded-md text-sky-400 hover:scale-110 hover:bg-sky-500/20 transition-all cursor-pointer flex items-center justify-center"><Icon name="Edit2" size={13} className="pointer-events-none" /></button>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteCert(cert.id); }} className="relative z-[100] p-1.5 rounded-md text-rose-400 hover:scale-110 hover:bg-rose-500/20 transition-all cursor-pointer flex items-center justify-center"><Icon name="Trash2" size={13} className="pointer-events-none" /></button>
                                </div>
                              </div>
                            )}

                            {/* ========================================================================= */}
                            {/* AREA STRUKTUR KANAN: PANGGUNG UTAMA LOGO 3D KINETIK                       */}
                            {/* ========================================================================= */}
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-36 h-36 flex items-center justify-center pointer-events-none z-0 overflow-visible">
                              <div className="engine-3d-logo">
                                <Icon name={RoleIcon} size={130} strokeWidth={1.3} className="pointer-events-none" />
                              </div>
                            </div>

                            {/* ========================================================================= */}
                            {/* AREA STRUKTUR KIRI & BAWAH: DATA TEKS MINIMALIS                           */}
                            {/* ========================================================================= */}
                            <div className="relative z-10 w-full pr-12 sm:pr-24 flex flex-col justify-between h-full min-h-[160px] pointer-events-none">
                              
                              {/* Bagian Atas: Nama Sertifikat & ID */}
                              <div className="pointer-events-none">
                                <h4 className="font-black text-white text-sm md:text-[15px] leading-tight truncate tracking-wide pointer-events-none">
                                  {cert.name}
                                </h4>
                                <p className="text-[9px] text-slate-500 font-mono mt-1 tracking-[0.15em] uppercase pointer-events-none">ID: {cert.number}</p>
                              </div>

                              {/* Bagian Tengah: Tanggal Minimalis Ultra Clean (TEKS DIBUAT LEBIH TERANG) */}
                              <div className="flex flex-col gap-2.5 my-4 w-[90%] pointer-events-none">
                                <div className="flex justify-between items-center border-b border-white/10 pb-1 pointer-events-none">
                                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.25em] pointer-events-none">TERBIT</span>
                                  <span className="text-[11px] text-white font-mono tracking-widest pointer-events-none">{cert.issueDate}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-1 pointer-events-none">
                                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.25em] pointer-events-none">KEDALUWARSA</span>
                                  <span className={`text-[11px] font-mono tracking-widest font-bold pointer-events-none ${isExpired ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "text-white"}`}>
                                    {cert.expiryDate === "Unlimited" ? "PERMANEN" : cert.expiryDate}
                                  </span>
                                </div>
                              </div>

                              {/* Item Utama Badge: Menggunakan animate-glass-pulse jika kondisi kritis */}
                              <div className={`unified-3d-glass-box w-fit flex items-center gap-3 px-3.5 py-2 rounded-xl mt-2 pointer-events-none 
                                ${(isExpired || status.label === "CRITICAL") ? 'animate-glass-pulse' : ''}`}>
                                
                                <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                                  <div className="scale-[0.85] drop-shadow-[0_0_5px_currentColor]" style={{ color: status.hex }}>{status.icon}</div>
                                  <span className="text-[10px] font-black tracking-widest uppercase drop-shadow-md pointer-events-none" style={{ color: status.hex }}>
                                    {status.label}
                                  </span>
                                </div>

                                <div className="w-[1px] h-3.5 bg-white/10 group-hover:bg-white/20 transition-colors pointer-events-none"></div>

                                <div className="flex flex-col items-start leading-none pr-1 pointer-events-none">
                                  <span className={`text-[9px] font-black tracking-[0.15em] font-mono uppercase whitespace-nowrap pointer-events-none ${isExpired ? "text-rose-400" : "text-slate-100"}`}>
                                    {cert.expiryDate === "Unlimited" ? "UNLIMITED" : formatSisaWaktu(status.days)}
                                  </span>
                                  <span className="text-[6.5px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1 whitespace-nowrap pointer-events-none">
                                    {status.action}
                                  </span>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-80 relative z-20 bg-[#02040A] rounded-2xl border border-dashed border-white/10 shadow-lg pointer-events-none">
                        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4 relative bg-[#0A0F19] pointer-events-none"><Icon name="Activity" size={24} className="text-slate-500 pointer-events-none" /><div className="absolute inset-0 rounded-full border-t-2 border-sky-400 animate-spin pointer-events-none"></div></div>
                        <p className="text-slate-300 font-mono tracking-widest uppercase text-[10px] font-black drop-shadow-md pointer-events-none">Awaiting Data Input</p>
                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider mt-1 pointer-events-none">Tidak ada dokumen {filterStatus === "all" ? "tersedia" : filterStatus}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <CertificateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCert} certData={editingCert} crewId={selectedCrewId} />
        <ConfirmModal isOpen={confirmAction.isOpen} message={confirmAction.message} onConfirm={executeConfirmAction} onCancel={() => setConfirmAction({ isOpen: false, message: "", action: null })} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleUpdatePasswords} />

        {toast && (
          <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[120] animate-slide-up pointer-events-none">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes tacticalSlideUp { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
              @keyframes toastSweepLeft { 0% { transform: translateX(-100%); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(200%); opacity: 0; } }
              .animate-slide-up { animation: tacticalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
              .animate-toast-sweep { animation: toastSweepLeft 2s infinite; }
            `}} />
            <div className="flex items-center gap-3.5 px-4 py-3 md:px-5 md:py-3.5 bg-[#02040a]/90 backdrop-blur-xl border border-white/10 rounded-r-lg rounded-l-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden group pointer-events-none">
              <div className={`absolute left-0 top-0 w-1 h-full shadow-[0_0_12px_currentColor] pointer-events-none ${toast.type === 'error' ? 'bg-rose-500 text-rose-500' : 'bg-[#00e5ff] text-[#00e5ff]'}`}></div>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-toast-sweep pointer-events-none"></div>
              <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border pointer-events-none ${toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#00e5ff]/10 border-[#00e5ff]/30'}`}>
                <Icon name={toast.type === 'error' ? 'AlertTriangle' : 'Check'} size={12} className={toast.type === 'error' ? 'text-rose-500 drop-shadow-[0_0_5px_#f43f5e] pointer-events-none' : 'text-[#00e5ff] drop-shadow-[0_0_5px_#00e5ff] pointer-events-none'} />
              </div>
              <div className="flex flex-col relative z-10 pointer-events-none">
                <span className={`text-[8px] md:text-[9px] font-mono tracking-[0.25em] uppercase mb-0.5 opacity-80 pointer-events-none ${toast.type === 'error' ? 'text-rose-500' : 'text-[#00e5ff]'}`}>
                  {toast.type === 'error' ? 'System Error Log' : 'System Update Log'}
                </span>
                <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
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
    isAuthenticated: !!localStorage.getItem("jwt_token"),
    role: localStorage.getItem("user_role") || null,
    name: localStorage.getItem("user_name") || "",
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
    const token = localStorage.getItem("jwt_token");
    const role = localStorage.getItem("user_role");
    const name = localStorage.getItem("user_name");
    if (token && role && name)
      setAuth({ isAuthenticated: true, role: role, name: name });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
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
