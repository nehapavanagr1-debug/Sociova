import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   SOCIOVA v6 — Worldwide Platform
   NEW: 🌍 Firebase Worldwide Leaderboard
        🔐 Google Sign-In (One tap)
        ✉️  Magic Link Login (No password)
        📧 Email + Password Login
        ☁️  Cloud-saved history & XP from any device
═══════════════════════════════════════════════════════════════

   SETUP INSTRUCTIONS (5 minutes):
   1. Go to firebase.google.com → Create project → "sociova"
   2. Enable Authentication:
      - Email/Password ✓
      - Email Link (passwordless) ✓
      - Google ✓
   3. Enable Firestore Database (start in test mode)
   4. Replace the FIREBASE_CONFIG below with your config
   5. In Firebase Console → Authentication → Settings →
      Add your domain to "Authorized domains"

═══════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════
// 🔧 PASTE YOUR FIREBASE CONFIG HERE
// Get this from: Firebase Console → Project Settings → Your Apps
// ══════════════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyD6RCstF6FAbppJV82LdwMpLH--jg_yuJw",
  authDomain:        "sociova-13a31.firebaseapp.com",
  projectId:         "sociova-13a31",
  storageBucket:     "sociova-13a31.firebasestorage.app",
  messagingSenderId: "660577461077",
  appId:             "1:660577461077:web:4f136ce74c9e1d3b5385dc",
};

// ══════════════════════════════════════════════════════════════

// ─── CONSTANTS ───────────────────────────────────────────────
const SCENARIOS = [
  { id:"first-date",   label:"First Date",        emoji:"☕", color:"#f9a8d4", dark:"#be185d", desc:"Practice charming first-date energy",     tag:"Most Popular" },
  { id:"ask-out",      label:"Ask Someone Out",   emoji:"💌", color:"#c4b5fd", dark:"#6d28d9", desc:"Build courage to make your move",          tag:"Fan Favourite" },
  { id:"apology",      label:"Heartfelt Apology", emoji:"🌸", color:"#6ee7b7", dark:"#065f46", desc:"Apologize with genuine empathy",           tag:"Emotional IQ" },
  { id:"make-friends", label:"Make New Friends",  emoji:"🤝", color:"#93c5fd", dark:"#1d4ed8", desc:"Break the ice & build real connections",   tag:"Social Skills" },
  { id:"confidence",   label:"Confidence Boost",  emoji:"🔥", color:"#fdba74", dark:"#c2410c", desc:"Unlock your boldest, most confident self", tag:"Level Up" },
];

const LANGUAGES = [
  { code:"hi-IN", flag:"🇮🇳", name:"हिंदी",     label:"Hindi (India)",  tts:"hi-IN" },
  { code:"en-US", flag:"🇺🇸", name:"English",   label:"English (US)",   tts:"en-US" },
  { code:"en-GB", flag:"🇬🇧", name:"English UK", label:"English (UK)",  tts:"en-GB" },
  { code:"es-ES", flag:"🇪🇸", name:"Español",   label:"Spanish",        tts:"es-ES" },
  { code:"fr-FR", flag:"🇫🇷", name:"Français",  label:"French",         tts:"fr-FR" },
  { code:"de-DE", flag:"🇩🇪", name:"Deutsch",   label:"German",         tts:"de-DE" },
  { code:"ja-JP", flag:"🇯🇵", name:"日本語",     label:"Japanese",       tts:"ja-JP" },
  { code:"ko-KR", flag:"🇰🇷", name:"한국어",     label:"Korean",         tts:"ko-KR" },
  { code:"pt-BR", flag:"🇧🇷", name:"Português", label:"Portuguese",     tts:"pt-BR" },
];

const PERSONAS = [
  { id:"aria",  name:"Aria",  emoji:"✨", age:"23", desc:"Warm, witty & emotionally open.", vibe:"Charming",   color:"#f9a8d4",
    personality:"You are Aria, 23, warm, witty, emotionally open, curious, genuinely fun. You laugh easily, ask thoughtful follow-ups, make people feel seen. You tease lightly, never cold." },
  { id:"rohan", name:"Rohan", emoji:"🌟", age:"25", desc:"Confident, direct & playful.",    vibe:"Bold",       color:"#c4b5fd",
    personality:"You are Rohan, 25, confident, direct, slightly cheeky but respectful. You appreciate boldness. Challenge the user in a fun way. Cool but not arrogant." },
  { id:"meera", name:"Meera", emoji:"🌸", age:"22", desc:"Empathetic & deeply understanding.", vibe:"Empathetic", color:"#6ee7b7",
    personality:"You are Meera, 22, deeply empathetic, patient, emotionally intelligent. Don't rush to forgive — make the user earn it. Warm but honest." },
  { id:"arjun", name:"Arjun", emoji:"💫", age:"26", desc:"Chill, funny & real.",             vibe:"Chill",      color:"#93c5fd",
    personality:"You are Arjun, 26, effortlessly cool, funny, authentic. Talk like a real person — casual, relatable, great energy. Help the user loosen up." },
];

const LEVELS = [
  { min:0,    max:199,  name:"Newbie",          emoji:"🌱", color:"#6ee7b7" },
  { min:200,  max:499,  name:"Ice Breaker",     emoji:"🧊", color:"#93c5fd" },
  { min:500,  max:999,  name:"Social Spark",    emoji:"⚡", color:"#c4b5fd" },
  { min:1000, max:1999, name:"Confidence King", emoji:"👑", color:"#f9a8d4" },
  { min:2000, max:3999, name:"Charm Master",    emoji:"💎", color:"#fdba74" },
  { min:4000, max:9999, name:"Social Legend",   emoji:"🌟", color:"#f97316" },
  { min:10000,max:99999,name:"SOCIOVA GOD",     emoji:"🔥", color:"#ec4899" },
];

const COUNTRY_FLAGS = {
  IN:"🇮🇳",US:"🇺🇸",GB:"🇬🇧",AU:"🇦🇺",CA:"🇨🇦",DE:"🇩🇪",FR:"🇫🇷",JP:"🇯🇵",
  KR:"🇰🇷",BR:"🇧🇷",MX:"🇲🇽",SG:"🇸🇬",AE:"🇦🇪",PK:"🇵🇰",BD:"🇧🇩",NG:"🇳🇬",
};

function getLevel(xp){ return LEVELS.find(l=>xp>=l.min&&xp<=l.max)||LEVELS[LEVELS.length-1]; }
function xpForSession(score,msgs){ return Math.round((score/100)*50+msgs*3); }

// ─── FIREBASE SDK LOADER ─────────────────────────────────────
// Loads Firebase from CDN dynamically — no npm install needed
let FB = null; // Firebase instance cache

async function getFirebase() {
  if(FB) return FB;
  try {
    const [
      { initializeApp, getApps },
      { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
        createUserWithEmailAndPassword, sendSignInLinkToEmail, isSignInWithEmailLink,
        signInWithEmailLink, signOut, onAuthStateChanged, updateProfile },
      { getFirestore, doc, setDoc, getDoc, updateDoc, collection,
        query, orderBy, limit, getDocs, serverTimestamp, increment, addDoc },
    ] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"),
    ]);

    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db   = getFirestore(app);

    FB = {
      auth, db,
      GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
      createUserWithEmailAndPassword, sendSignInLinkToEmail,
      isSignInWithEmailLink, signInWithEmailLink, signOut,
      onAuthStateChanged, updateProfile,
      doc, setDoc, getDoc, updateDoc, collection,
      query, orderBy, limit, getDocs, serverTimestamp, increment, addDoc,
    };
    return FB;
  } catch(e) {
    console.error("Firebase load error:", e);
    throw new Error("Firebase failed to load. Check your config and internet connection.");
  }
}

// ─── FIRESTORE HELPERS ───────────────────────────────────────
async function ensureUserDoc(fb, user, extra={}) {
  const ref = fb.doc(fb.db, "users", user.uid);
  const snap = await fb.getDoc(ref);
  const avatars = ["🧑","👩","👨","🧑‍💻","👩‍💻","👨‍🎤","👩‍🎤","🦸","🦸‍♀️"];
  if(!snap.exists()) {
    await fb.setDoc(ref, {
      uid: user.uid,
      name: user.displayName || extra.name || "Anonymous",
      email: user.email || "",
      avatar: avatars[Math.floor(Math.random()*avatars.length)],
      xp: 0, streak: 0, lastDate: "",
      sessions: 0, country: extra.country || "IN",
      joinedAt: fb.serverTimestamp(),
      ...extra,
    });
    return (await fb.getDoc(ref)).data();
  }
  return snap.data();
}

async function getUserDoc(fb, uid) {
  const snap = await fb.getDoc(fb.doc(fb.db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

async function updateUserDoc(fb, uid, data) {
  await fb.updateDoc(fb.doc(fb.db, "users", uid), data);
}

async function addSession(fb, uid, session) {
  await fb.addDoc(fb.collection(fb.db, "users", uid, "sessions"), {
    ...session, createdAt: fb.serverTimestamp(),
  });
}

async function getUserSessions(fb, uid) {
  try {
    const q = fb.query(fb.collection(fb.db,"users",uid,"sessions"), fb.orderBy("createdAt","desc"), fb.limit(30));
    const snap = await fb.getDocs(q);
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ return []; }
}

async function getWorldLeaderboard(fb) {
  try {
    const q = fb.query(fb.collection(fb.db,"users"), fb.orderBy("xp","desc"), fb.limit(50));
    const snap = await fb.getDocs(q);
    return snap.docs.map(d=>d.data());
  } catch(e){ return []; }
}

// ─── AI HELPERS ──────────────────────────────────────────────
function buildSystemPrompt(persona, scenario, language) {
  const isHindi = language.code.startsWith("hi");
  const ctx = {
    "first-date":   "You are on a first date at a cozy café. React naturally — curious, playful, slightly nervous.",
    "ask-out":      "The user is trying to ask you out. You've seen them around. Be flattered, curious, or a bit guarded at first.",
    "apology":      "The user is apologizing for something that genuinely hurt you. Don't forgive too easily. Make them articulate it.",
    "make-friends": "You're at a social event getting to know each other. Warm but not overly eager.",
    "confidence":   "The user just came up to you out of nowhere. Be impressed by boldness but push them with follow-up questions.",
  };
  return `${persona.personality}
SCENARIO: ${ctx[scenario.id]}
LANGUAGE: Reply ONLY in ${language.label}. ${isHindi?"Use natural Hindi/Hinglish (Devanagari + casual English).":""}
RULES:
1. NEVER repeat previous replies. Each message must be completely fresh.
2. React DIRECTLY to what the user just said — reference their actual words.
3. Keep replies SHORT — 1 to 3 sentences max.
4. Stay in character as ${persona.name} always.
5. If user goes off-topic, respond as ${persona.name} would — curious or playful.
6. Max 1 emoji per reply, only when natural.
7. Goal: make the user feel heard and more confident.`;
}

async function callClaude(messages, systemPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:200, system:systemPrompt, messages }),
  });
  if(!response.ok){ const e=await response.json().catch(()=>({})); throw new Error(e.error?.message||`HTTP ${response.status}`); }
  const data = await response.json();
  return data.content?.map(b=>b.type==="text"?b.text:"").join("").trim()||"...";
}

const GREETINGS = {
  "en-US":{ "first-date":"Hey! So glad we finally got to meet 😊 Are you nervous at all, or is it just me?","ask-out":"Hey! Yeah, I've definitely seen you around. What's up?","apology":"I wasn't sure you'd reach out. I'm here though. What did you want to say?","make-friends":"Hey! Are you enjoying the event? I don't think we've met 👋","confidence":"Well look who decided to just come say hi 😄 Bold move. I respect it." },
  "hi-IN":{ "first-date":"हाय! आखिरकार मिलना हुआ 😊 थोड़ा nervous हो? मैं भी!","ask-out":"हाय! हाँ देखा है तुम्हें पहले। क्या बात है?","apology":"सोचा नहीं था कि तुम message करोगे। बोलो — क्या कहना था?","make-friends":"हाय! Event enjoy कर रहे हो? मैं भी नई हूँ यहाँ! 👋","confidence":"वाह, सीधे आ गए बात करने 😄 हिम्मत की बात है।" },
};
function getGreeting(sceneId,langCode){ const k=langCode.startsWith("hi")?"hi-IN":"en-US"; return (GREETINGS[k]||GREETINGS["en-US"])[sceneId]||GREETINGS["en-US"]["first-date"]; }

function analyze(messages) {
  const u=messages.filter(m=>m.role==="user");
  if(!u.length) return null;
  const avgLen=u.reduce((s,m)=>s+m.text.split(" ").length,0)/u.length;
  const qs=u.filter(m=>m.text.includes("?")).length;
  const pos=["love","great","amazing","appreciate","thank","understand","sorry","like","enjoy","happy","care","miss","respect","wonderful","pyaar","shukriya","bahut","accha","samajh"];
  const p=u.reduce((s,m)=>s+pos.filter(w=>m.text.toLowerCase().includes(w)).length,0);
  const confidence=Math.min(95,Math.max(30,40+avgLen*2.2+u.length*3.5));
  const empathy=Math.min(95,Math.max(22,32+p*9+qs*6));
  const listening=Math.min(95,Math.max(28,48+qs*9+u.length*2.5));
  const flow=Math.min(95,Math.max(32,42+Math.min(avgLen,18)*2.2+u.length*3));
  const respect=Math.min(99,Math.max(58,68+p*5.5));
  const overall=Math.round((confidence+empathy+listening+flow+respect)/5);
  const tips=[];
  if(confidence<58) tips.push("Lead with stronger, clearer statements — confidence shows in certainty.");
  if(empathy<55)    tips.push("Acknowledge their feelings first before sharing your perspective.");
  if(listening<55)  tips.push("Ask more follow-up questions — it shows you're truly present.");
  if(flow<55)       tips.push("Mix short punchy reactions with deeper responses for better rhythm.");
  if(!tips.length)  tips.push("You're doing amazing — maintain this natural energy in real life!");
  tips.push("Pause 1–2 seconds before responding. It reads as thoughtful confidence.");
  return { confidence,empathy,listening,flow,respect,overall,tips:tips.slice(0,3),count:u.length };
}

// ─── VOICE ───────────────────────────────────────────────────
function useVoice(langCode) {
  const [vState,setVState]=useState("idle");
  const [liveText,setLiveText]=useState("");
  const [error,setError]=useState("");
  const [supported,setSupported]=useState(false);
  const recRef=useRef(null);
  useEffect(()=>{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; setSupported(!!(SR&&window.speechSynthesis)); },[]);
  const stopAll=useCallback(()=>{ try{recRef.current?.stop();}catch(e){} recRef.current=null; window.speechSynthesis?.cancel(); setVState("idle"); setLiveText(""); setError(""); },[]);
  const startListen=useCallback((onResult)=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setError("Use Chrome or Edge for voice.");return;}
    stopAll(); setError("");
    const rec=new SR(); rec.lang=langCode; rec.continuous=false; rec.interimResults=true;
    rec.onstart=()=>{setVState("listening");setLiveText("");};
    rec.onresult=(e)=>{ const t=Array.from(e.results).map(r=>r[0].transcript).join(""); setLiveText(t); if(e.results[e.results.length-1].isFinal){setVState("thinking");setLiveText("");recRef.current=null;if(onResult)onResult(t);} };
    rec.onspeechend=()=>{try{rec.stop();}catch(e){}};
    rec.onerror=(e)=>{setError(e.error==="no-speech"?"Couldn't hear you. Try again!":e.error==="not-allowed"?"Mic access denied.":"Mic error. Try Chrome.");setVState("idle");recRef.current=null;};
    rec.onend=()=>{setVState(v=>v==="listening"?"idle":v);};
    recRef.current=rec; try{rec.start();}catch(e){setError("Couldn't start mic.");setVState("idle");}
  },[langCode,stopAll]);
  const speak=useCallback((text,onEnd)=>{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); setVState("speaking");
    const doSpeak=()=>{ const u=new SpeechSynthesisUtterance(text); u.lang=langCode; u.rate=langCode.startsWith("hi")?0.88:0.93; u.pitch=1.05; const voices=window.speechSynthesis.getVoices(); u.voice=voices.find(v=>v.lang===langCode)||voices.find(v=>v.lang.startsWith(langCode.split("-")[0]))||null; u.onend=()=>{setVState("idle");if(onEnd)onEnd();}; u.onerror=()=>{setVState("idle");if(onEnd)onEnd();}; window.speechSynthesis.speak(u); };
    if(window.speechSynthesis.getVoices().length>0) doSpeak(); else window.speechSynthesis.onvoiceschanged=doSpeak;
  },[langCode]);
  const stopSpeak=useCallback(()=>{window.speechSynthesis?.cancel();setVState("idle");},[]);
  return{vState,liveText,error,supported,startListen,stopAll,speak,stopSpeak,setError};
}

// ─── CSS ─────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#040410}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:99px}
@keyframes drift{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(25px,-35px) scale(1.06)}70%{transform:translate(-20px,20px) scale(0.96)}}
@keyframes shimmer{0%{background-position:0% center}100%{background-position:200% center}}
@keyframes glow{0%,100%{box-shadow:0 0 25px rgba(167,139,250,.4),0 0 50px rgba(167,139,250,.1)}50%{box-shadow:0 0 50px rgba(167,139,250,.8),0 0 100px rgba(236,72,153,.25)}}
@keyframes up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes msgIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes dot{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-7px);opacity:1}}
@keyframes rippleOut{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.8);opacity:0}}
@keyframes wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleUp{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes xpPop{0%{transform:scale(0) translateY(0);opacity:1}100%{transform:scale(1.4) translateY(-50px);opacity:0}}
@keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
.br{font-family:'Bricolage Grotesque',sans-serif}
.gt{background:linear-gradient(135deg,#a855f7,#ec4899,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200%;animation:shimmer 4s linear infinite}
.pbtn{background:linear-gradient(135deg,#7c3aed,#db2777);border:none;color:#fff;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .25s cubic-bezier(.34,1.56,.64,1)}
.pbtn:hover{transform:scale(1.04) translateY(-1px);box-shadow:0 8px 30px rgba(124,58,237,.45)}
.pbtn:active{transform:scale(.97)}
.pbtn:disabled{opacity:.35;cursor:not-allowed;transform:none}
.gbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.7);font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s}
.gbtn:hover{background:rgba(255,255,255,.1);color:#fff}
.ch{transition:all .28s cubic-bezier(.34,1.56,.64,1)!important}
.ch:hover{transform:translateY(-4px) scale(1.02)!important;border-color:rgba(167,139,250,.5)!important}
.glass{background:rgba(4,4,16,.7);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
textarea:focus,input:focus{outline:none!important}
input,textarea,button{font-family:'Plus Jakarta Sans',sans-serif}
.authInput{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:13px 16px;color:#fff;font-size:14px;transition:border-color .2s}
.authInput:focus{border-color:rgba(167,139,250,.6)!important}
.authInput::placeholder{color:rgba(255,255,255,.25)}
`;

function Orbs(){return(<div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>{[{w:600,h:600,x:"-10%",y:"-15%",c:"rgba(124,58,237,.13)",d:"0s"},{w:500,h:500,x:"60%",y:"40%",c:"rgba(219,39,119,.1)",d:"-7s"},{w:400,h:400,x:"30%",y:"60%",c:"rgba(249,168,212,.07)",d:"-14s"},{w:350,h:350,x:"80%",y:"-10%",c:"rgba(147,197,253,.06)",d:"-21s"}].map((o,i)=>(<div key={i} style={{position:"absolute",width:o.w,height:o.h,left:o.x,top:o.y,borderRadius:"50%",background:`radial-gradient(circle,${o.c},transparent 70%)`,animation:`drift ${28+i*6}s ease-in-out infinite`,animationDelay:o.d}}/>))}</div>);}

function Bubble({msg,isNew,persona}){
  const isUser=msg.role==="user";
  return(<div style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",gap:8,alignItems:"flex-end",marginBottom:12,animation:isNew?"msgIn .35s cubic-bezier(.34,1.4,.64,1) both":"none"}}>
    {!isUser&&<div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,boxShadow:"0 0 12px rgba(124,58,237,.4)"}}>{persona?.emoji||"✨"}</div>}
    <div style={{maxWidth:"75%",padding:"11px 15px",lineHeight:1.65,fontSize:14,borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isUser?"linear-gradient(135deg,#6d28d9,#be185d)":"rgba(255,255,255,.07)",border:isUser?"none":"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.92)",boxShadow:isUser?"0 4px 20px rgba(124,58,237,.3)":"none"}}>
      {msg.text}{msg.via==="voice"&&<span style={{marginLeft:6,fontSize:10,opacity:.4}}>🎙️</span>}
    </div>
  </div>);}

function Typing(){return(<div style={{display:"flex",gap:8,alignItems:"flex-end",marginBottom:12}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}/><div style={{padding:"13px 17px",borderRadius:"18px 18px 18px 4px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)"}}><div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"linear-gradient(135deg,#a855f7,#ec4899)",animation:`dot 1.3s ease-in-out infinite`,animationDelay:`${i*.2}s`}}/>)}</div></div></div>);}

function ScoreBar({label,val,color,delay=0}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(val),delay+150);return()=>clearTimeout(t);},[val,delay]);
  return(<div style={{marginBottom:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:"rgba(255,255,255,.6)"}}>{label}</span><span style={{fontSize:13,color,fontWeight:700}}>{Math.round(val)}%</span></div><div style={{background:"rgba(255,255,255,.07)",borderRadius:99,height:7,overflow:"hidden"}}><div style={{width:`${w}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg,${color}44,${color})`,transition:"width 1.3s cubic-bezier(.34,1.4,.64,1)"}}/></div></div>);}

function LevelBadge({xp,size="sm"}){
  const lv=getLevel(xp);
  const next=LEVELS[LEVELS.findIndex(l=>l===lv)+1];
  const pct=next?Math.round(((xp-lv.min)/(next.min-lv.min))*100):100;
  if(size==="lg") return(<div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:4}}>{lv.emoji}</div><div style={{fontSize:18,fontWeight:700,color:lv.color,marginBottom:2}}>{lv.name}</div><div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:10}}>{xp} XP{next?` · ${next.min-xp} to ${next.name}`:""}</div><div style={{background:"rgba(255,255,255,.07)",borderRadius:99,height:6,overflow:"hidden",maxWidth:200,margin:"0 auto"}}><div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg,${lv.color}80,${lv.color})`,transition:"width 1s ease"}}/></div></div>);
  return(<div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:99,background:`${lv.color}15`,border:`1px solid ${lv.color}30`}}><span style={{fontSize:14}}>{lv.emoji}</span><span style={{fontSize:11,fontWeight:600,color:lv.color}}>{lv.name}</span><span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{xp}xp</span></div>);}

// ─── LOADING SCREEN ───────────────────────────────────────────
function Loading({msg="Loading..."}){
  return(<div style={{minHeight:"100vh",background:"#040410",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
    <div className="br gt" style={{fontSize:32}}>SOCIOVA</div>
    <div style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(167,139,250,.2)",borderTop:"3px solid #a855f7",animation:"spin .8s linear infinite"}}/>
    <div style={{fontSize:13,color:"rgba(255,255,255,.3)"}}>{msg}</div>
  </div>);}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App(){
  // ── Auth ──
  const [fbUser,setFbUser]       = useState(null);  // Firebase auth user
  const [userData,setUserData]   = useState(null);  // Firestore user doc
  const [authMode,setAuthMode]   = useState("landing"); // landing|login|signup|magic
  const [authForm,setAuthForm]   = useState({name:"",email:"",password:""});
  const [authErr,setAuthErr]     = useState("");
  const [authLoading,setAuthLoading]=useState(false);
  const [magicSent,setMagicSent] = useState(false);
  const [fbLoading,setFbLoading] = useState(true);
  const fbRef = useRef(null);

  // ── App ──
  const [page,setPage]           = useState("auth");
  const [scene,setScene]         = useState(null);
  const [persona,setPersona]     = useState(null);
  const [lang,setLang]           = useState(LANGUAGES[0]);
  const [msgs,setMsgs]           = useState([]);
  const [input,setInput]         = useState("");
  const [aiTyping,setAiTyping]   = useState(false);
  const [feedback,setFeedback]   = useState(null);
  const [chatMode,setChatMode]   = useState("text");
  const [autoSpeak,setAutoSpeak] = useState(true);
  const [apiError,setApiError]   = useState("");
  const [newId,setNewId]         = useState(null);
  const [xpPop,setXpPop]         = useState(null);
  const [history,setHistory]     = useState([]);
  const [leaderboard,setLeaderboard]=useState([]);
  const [lbLoading,setLbLoading] = useState(false);
  const [activeTab,setActiveTab] = useState("home");
  const [showShare,setShowShare] = useState(false);
  const [configOk,setConfigOk]   = useState(true);

  const endRef         = useRef(null);
  const conversationRef= useRef([]);
  const voice          = useVoice(lang.tts);

  // ── Check Firebase config ──
  useEffect(()=>{
    if(FIREBASE_CONFIG.apiKey==="YOUR_API_KEY"){
      setConfigOk(false); setFbLoading(false); return;
    }
    // Init Firebase & listen to auth state
    getFirebase().then(fb=>{
      fbRef.current=fb;
      // Check magic link
      if(fb.isSignInWithEmailLink(fb.auth,window.location.href)){
        const email=localStorage.getItem("sv_magic_email");
        if(email){
          fb.signInWithEmailLink(fb.auth,email,window.location.href).then(async(r)=>{
            localStorage.removeItem("sv_magic_email");
            const ud=await ensureUserDoc(fb,r.user);
            setFbUser(r.user); setUserData(ud);
            await loadUserData(fb,r.user.uid);
            setPage("dashboard"); setFbLoading(false);
          }).catch(e=>{setAuthErr("Magic link failed: "+e.message);setFbLoading(false);});
          return;
        }
      }
      const unsub=fb.onAuthStateChanged(fb.auth,async(u)=>{
        if(u){
          setFbUser(u);
          const ud=await ensureUserDoc(fb,u);
          setUserData(ud);
          await loadUserData(fb,u.uid);
          setPage("dashboard");
        } else {
          setFbUser(null); setUserData(null); setPage("auth");
        }
        setFbLoading(false);
      });
      return unsub;
    }).catch(e=>{ console.error(e); setFbLoading(false); setConfigOk(false); });
  },[]);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,aiTyping]);

  async function loadUserData(fb,uid){
    const [sessions,lb]=await Promise.all([getUserSessions(fb,uid),getWorldLeaderboard(fb)]);
    setHistory(sessions); setLeaderboard(lb);
  }

  // ─── AUTH METHODS ─────────────────────────────────────────
  async function handleGoogleLogin(){
    setAuthLoading(true); setAuthErr("");
    try{
      const fb=fbRef.current||await getFirebase();
      const provider=new fb.GoogleAuthProvider();
      const result=await fb.signInWithPopup(fb.auth,provider);
      const ud=await ensureUserDoc(fb,result.user);
      setFbUser(result.user); setUserData(ud);
      await loadUserData(fb,result.user.uid);
      setPage("dashboard");
    }catch(e){ setAuthErr("Google sign-in failed: "+e.message); }
    setAuthLoading(false);
  }

  async function handleEmailAuth(){
    setAuthLoading(true); setAuthErr("");
    const {name,email,password}=authForm;
    if(!email||!password){setAuthErr("Please fill all fields.");setAuthLoading(false);return;}
    if(password.length<6){setAuthErr("Password must be at least 6 characters.");setAuthLoading(false);return;}
    try{
      const fb=fbRef.current||await getFirebase();
      if(authMode==="signup"){
        if(!name){setAuthErr("Please enter your name.");setAuthLoading(false);return;}
        const result=await fb.createUserWithEmailAndPassword(fb.auth,email,password);
        await fb.updateProfile(result.user,{displayName:name});
        const ud=await ensureUserDoc(fb,result.user,{name});
        setFbUser(result.user); setUserData(ud);
        await loadUserData(fb,result.user.uid);
        setPage("dashboard");
      } else {
        const result=await fb.signInWithEmailAndPassword(fb.auth,email,password);
        const ud=await ensureUserDoc(fb,result.user);
        setFbUser(result.user); setUserData(ud);
        await loadUserData(fb,result.user.uid);
        setPage("dashboard");
      }
    }catch(e){
      const msg=e.code==="auth/user-not-found"?"No account found. Please sign up.":e.code==="auth/wrong-password"?"Wrong password. Try again.":e.code==="auth/email-already-in-use"?"Email already registered. Please log in.":e.message;
      setAuthErr(msg);
    }
    setAuthLoading(false);
  }

  async function handleMagicLink(){
    setAuthLoading(true); setAuthErr("");
    const {email}=authForm;
    if(!email){setAuthErr("Please enter your email.");setAuthLoading(false);return;}
    try{
      const fb=fbRef.current||await getFirebase();
      const actionCodeSettings={ url:window.location.href, handleCodeInApp:true };
      await fb.sendSignInLinkToEmail(fb.auth,email,actionCodeSettings);
      localStorage.setItem("sv_magic_email",email);
      setMagicSent(true);
    }catch(e){ setAuthErr("Failed to send link: "+e.message); }
    setAuthLoading(false);
  }

  async function handleLogout(){
    const fb=fbRef.current;
    if(fb) await fb.signOut(fb.auth);
    setFbUser(null); setUserData(null);
    setPage("auth"); setAuthMode("landing");
    voice.stopAll();
  }

  // ─── XP AWARD ─────────────────────────────────────────────
  async function awardXP(amount){
    if(!fbUser||!fbRef.current)return;
    const fb=fbRef.current;
    const today=new Date().toDateString();
    const lastDate=userData?.lastDate||"";
    const streak=lastDate===today?(userData?.streak||1):lastDate===new Date(Date.now()-86400000).toDateString()?(userData?.streak||0)+1:1;
    const newXP=(userData?.xp||0)+amount;
    const updates={xp:newXP,streak,lastDate:today,sessions:fb.increment(1)};
    await updateUserDoc(fb,fbUser.uid,updates);
    setUserData(p=>({...p,...updates,xp:newXP,streak}));
    setXpPop(`+${amount} XP ⚡`);
    setTimeout(()=>setXpPop(null),2200);
    // Refresh leaderboard
    const lb=await getWorldLeaderboard(fb);
    setLeaderboard(lb);
  }

  // ─── CHAT ─────────────────────────────────────────────────
  const push=useCallback((role,text,via="text")=>{
    const m={id:Date.now()+Math.random(),role,text,ts:Date.now(),via};
    setNewId(m.id); setMsgs(p=>[...p,m]); return m;
  },[]);

  const aiReply=useCallback(async(userText,currentScene,currentPersona,currentLang)=>{
    setAiTyping(true); setApiError("");
    try{
      conversationRef.current=[...conversationRef.current,{role:"user",content:userText}];
      const sys=buildSystemPrompt(currentPersona,currentScene,currentLang);
      const reply=await callClaude(conversationRef.current,sys);
      conversationRef.current=[...conversationRef.current,{role:"assistant",content:reply}];
      setAiTyping(false); return reply;
    }catch(e){
      setAiTyping(false);
      setApiError("Connection hiccup — check network and try again.");
      return "Hmm, I got a little tongue-tied. Try again? 😅";
    }
  },[]);

  const sendMsg=useCallback(async(text,via="text")=>{
    if(!text.trim()||aiTyping)return;
    push("user",text.trim(),via); setInput("");
    const reply=await aiReply(text.trim(),scene,persona,lang);
    push("ai",reply);
    if(autoSpeak&&voice.supported) voice.speak(reply);
  },[aiTyping,push,aiReply,scene,persona,lang,autoSpeak,voice]);

  const handleVoiceTap=useCallback(()=>{
    if(voice.vState==="listening"){voice.stopAll();return;}
    if(voice.vState==="speaking"){voice.stopSpeak();return;}
    if(voice.vState==="thinking")return;
    voice.startListen(async(t)=>{if(t.trim())await sendMsg(t,"voice");});
  },[voice,sendMsg]);

  function startChat(sc,pe,ln=lang){
    voice.stopAll(); setScene(sc); setPersona(pe); setLang(ln);
    const greeting=getGreeting(sc.id,ln.code);
    const m={id:Date.now(),role:"ai",text:greeting,ts:Date.now(),via:"text"};
    setMsgs([m]); setNewId(m.id); setAiTyping(false); setInput(""); setFeedback(null); setApiError("");
    conversationRef.current=[{role:"assistant",content:greeting}];
    setPage("chat");
    if(autoSpeak&&voice.supported) setTimeout(()=>voice.speak(greeting),600);
  }

  async function endChat(){
    voice.stopAll();
    const fb=analyze(msgs);
    if(!fb){alert("Send a few messages first! 😊");return;}
    const earned=xpForSession(fb.overall,fb.count);
    const sess={scene:scene?.label,sceneEmoji:scene?.emoji,persona:persona?.name,personaEmoji:persona?.emoji,score:fb.overall,grade:fb.overall>=85?"S":fb.overall>=75?"A":fb.overall>=65?"B":fb.overall>=50?"C":"D",xpEarned:earned,msgs:fb.count,date:new Date().toLocaleDateString("en-IN"),lang:lang.name,ts:Date.now()};
    if(fbRef.current&&fbUser){
      await addSession(fbRef.current,fbUser.uid,sess);
      setHistory(p=>[sess,...p]);
    }
    await awardXP(earned);
    setFeedback({...fb,earned,session:sess});
    setPage("feedback");
  }

  // ══════════════════════════════════════════════
  // CONFIG MISSING SCREEN
  // ══════════════════════════════════════════════
  if(!configOk) return(
    <div style={{minHeight:"100vh",background:"#040410",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <style>{CSS}</style><Orbs/>
      <div style={{position:"relative",zIndex:1,maxWidth:520,width:"100%",animation:"scaleUp .4s ease both"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="br gt" style={{fontSize:36,marginBottom:8}}>SOCIOVA</div>
          <div style={{fontSize:28,marginBottom:8}}>🔧</div>
          <div className="br" style={{fontSize:22,marginBottom:8}}>Firebase Setup Required</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.4)",lineHeight:1.8}}>To enable worldwide leaderboard, Google login, and cloud sync — add your Firebase config.</div>
        </div>
        <div style={{padding:"24px",borderRadius:22,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.09)",marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.5)",marginBottom:16,letterSpacing:".5px",textTransform:"uppercase"}}>5-Minute Setup Steps</div>
          {[
            ["1","Go to firebase.google.com → Create free project named 'sociova'"],
            ["2","Authentication → Sign-in method → Enable: Email/Password, Email Link, Google"],
            ["3","Firestore Database → Create database → Start in test mode"],
            ["4","Project Settings → Your Apps → Add Web App → Copy config"],
            ["5","In this file, replace FIREBASE_CONFIG at the top with your config values"],
          ].map(([n,t])=>(
            <div key={n} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{n}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.7}}>{t}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.2)",fontSize:12,color:"rgba(251,191,36,.8)",lineHeight:1.75}}>
          💡 Firebase free tier supports up to <strong>50,000 users</strong> and <strong>1GB storage</strong> — more than enough to launch your startup!
        </div>
      </div>
    </div>
  );

  if(fbLoading) return <Loading msg="Connecting to SOCIOVA..."/>;

  // ══════════════════════════════════════════════
  // AUTH PAGE
  // ══════════════════════════════════════════════
  if(page==="auth") return(
    <div style={{minHeight:"100vh",background:"#040410",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <style>{CSS}</style><Orbs/>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:420,animation:"scaleUp .4s ease both"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="br gt" style={{fontSize:38,marginBottom:6}}>SOCIOVA</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.3)"}}>AI Social Confidence Platform 🌍</div>
        </div>

        {/* Auth card */}
        <div style={{padding:"28px",borderRadius:28,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.09)"}}>

          {/* ── LANDING: choose method ── */}
          {authMode==="landing"&&(
            <div style={{animation:"fadeIn .4s ease"}}>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div className="br" style={{fontSize:20,marginBottom:6}}>Welcome back 👋</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>Choose how you want to sign in</div>
              </div>

              {/* Google */}
              <button onClick={handleGoogleLogin} disabled={authLoading} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12,transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {authLoading?"Connecting...":"Continue with Google"}
              </button>

              {/* Magic Link */}
              <button onClick={()=>setAuthMode("magic")} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12,transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}>
                ✉️ Send Magic Link (No Password)
              </button>

              {/* Divider */}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
                <span style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>or use email</span>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
              </div>

              {/* Email/Password */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button onClick={()=>setAuthMode("login")} className="pbtn" style={{padding:"13px",borderRadius:14,fontSize:13}}>Sign In</button>
                <button onClick={()=>setAuthMode("signup")} style={{padding:"13px",borderRadius:14,fontSize:13,border:"1px solid rgba(167,139,250,.4)",background:"rgba(167,139,250,.1)",color:"#c4b5fd",cursor:"pointer",fontWeight:600,transition:"all .2s"}}>Sign Up</button>
              </div>

              {authErr&&<div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",color:"#fca5a5",fontSize:13}}>{authErr}</div>}
            </div>
          )}

          {/* ── MAGIC LINK ── */}
          {authMode==="magic"&&(
            <div style={{animation:"fadeIn .4s ease"}}>
              <button onClick={()=>{setAuthMode("landing");setMagicSent(false);setAuthErr("");}} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Back</button>
              {magicSent?(
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:48,marginBottom:16,animation:"float 3s ease-in-out infinite"}}>📬</div>
                  <div className="br" style={{fontSize:20,marginBottom:8}}>Check your email!</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,.4)",lineHeight:1.85,marginBottom:20}}>We sent a magic login link to<br/><strong style={{color:"rgba(255,255,255,.7)"}}>{authForm.email}</strong><br/>Click the link to sign in instantly — no password needed.</div>
                  <button onClick={()=>{setMagicSent(false);setAuthForm(p=>({...p,email:""}));}} className="gbtn" style={{padding:"10px 24px",borderRadius:12,fontSize:13}}>Send to different email</button>
                </div>
              ):(
                <>
                  <div style={{textAlign:"center",marginBottom:20}}>
                    <div style={{fontSize:32,marginBottom:8}}>✉️</div>
                    <div className="br" style={{fontSize:18,marginBottom:4}}>Magic Link Login</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>No password needed. We email you a secure link.</div>
                  </div>
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:7,fontWeight:600,letterSpacing:".5px"}}>YOUR EMAIL</div>
                    <input type="email" className="authInput" value={authForm.email} onChange={e=>setAuthForm(p=>({...p,email:e.target.value}))} placeholder="you@email.com" onKeyDown={e=>{if(e.key==="Enter")handleMagicLink();}}/>
                  </div>
                  {authErr&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",color:"#fca5a5",fontSize:13,marginBottom:14}}>{authErr}</div>}
                  <button className="pbtn" onClick={handleMagicLink} disabled={authLoading} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14}}>
                    {authLoading?"Sending...":"Send Magic Link ✨"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── EMAIL/PASSWORD ── */}
          {(authMode==="login"||authMode==="signup")&&(
            <div style={{animation:"fadeIn .4s ease"}}>
              <button onClick={()=>{setAuthMode("landing");setAuthErr("");}} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Back</button>

              {/* Tab */}
              <div style={{display:"flex",background:"rgba(255,255,255,.06)",borderRadius:12,padding:4,marginBottom:22,gap:4}}>
                {["login","signup"].map(t=>(
                  <button key={t} onClick={()=>{setAuthMode(t);setAuthErr("");}} style={{flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:authMode===t?"linear-gradient(135deg,#7c3aed,#db2777)":"transparent",color:authMode===t?"#fff":"rgba(255,255,255,.4)",transition:"all .2s"}}>
                    {t==="login"?"Sign In":"Sign Up"}
                  </button>
                ))}
              </div>

              {authMode==="signup"&&(
                <div style={{marginBottom:13}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:7,fontWeight:600,letterSpacing:".5px"}}>YOUR NAME</div>
                  <input className="authInput" value={authForm.name} onChange={e=>setAuthForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Rahul Sharma"/>
                </div>
              )}
              <div style={{marginBottom:13}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:7,fontWeight:600,letterSpacing:".5px"}}>EMAIL</div>
                <input type="email" className="authInput" value={authForm.email} onChange={e=>setAuthForm(p=>({...p,email:e.target.value}))} placeholder="you@email.com"/>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:7,fontWeight:600,letterSpacing:".5px"}}>PASSWORD</div>
                <input type="password" className="authInput" value={authForm.password} onChange={e=>setAuthForm(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters" onKeyDown={e=>{if(e.key==="Enter")handleEmailAuth();}}/>
              </div>

              {authErr&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",color:"#fca5a5",fontSize:13,marginBottom:16}}>{authErr}</div>}

              <button className="pbtn" onClick={handleEmailAuth} disabled={authLoading} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14}}>
                {authLoading?"Please wait...":authMode==="login"?"Sign In →":"Create Account →"}
              </button>

              {/* Also offer Google & magic from here */}
              <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
                <span style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>or</span>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <button onClick={handleGoogleLogin} disabled={authLoading} className="gbtn" style={{padding:"10px",borderRadius:12,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button onClick={()=>setAuthMode("magic")} className="gbtn" style={{padding:"10px",borderRadius:12,fontSize:12}}>✉️ Magic Link</button>
              </div>
            </div>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"rgba(255,255,255,.2)"}}>🌍 Worldwide · 🔒 Secure · ⚡ Free to start</div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════
  if(page==="dashboard"){
    const lv=getLevel(userData?.xp||0);
    const next=LEVELS[LEVELS.findIndex(l=>l===lv)+1];
    const pct=next?Math.round((((userData?.xp||0)-lv.min)/(next.min-lv.min))*100):100;
    return(
    <div style={{minHeight:"100vh",background:"#040410",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{CSS}</style><Orbs/>
      {xpPop&&<div style={{position:"fixed",top:"18%",left:"50%",transform:"translateX(-50%)",zIndex:999,fontSize:22,fontWeight:800,color:"#fbbf24",animation:"xpPop 2.2s ease forwards",pointerEvents:"none",textShadow:"0 0 20px rgba(251,191,36,.6)"}}>{xpPop}</div>}

      <div style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",paddingBottom:80}}>
        {/* Header */}
        <div className="glass" style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:50}}>
          <div className="br gt" style={{fontSize:20,flex:1}}>SOCIOVA</div>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"rgba(249,115,22,.12)",border:"1px solid rgba(249,115,22,.3)"}}>
            <span style={{fontSize:14}}>🔥</span>
            <span style={{fontSize:12,fontWeight:700,color:"#fb923c"}}>{userData?.streak||0}d</span>
          </div>
          <LevelBadge xp={userData?.xp||0}/>
          <div onClick={()=>setActiveTab("profile")} style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>{userData?.avatar||"👤"}</div>
        </div>

        {/* HOME */}
        {activeTab==="home"&&(
          <div style={{padding:"18px"}}>
            <div style={{padding:"22px",borderRadius:24,background:"linear-gradient(135deg,rgba(124,58,237,.18),rgba(219,39,119,.1))",border:"1px solid rgba(167,139,250,.25)",marginBottom:18,animation:"up .4s ease both"}}>
              <div style={{fontSize:20,fontWeight:700,marginBottom:3}}>Hey {(userData?.name||fbUser?.displayName||"there")?.split(" ")[0]} 👋</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:16}}>Ready to level up your social game today?</div>
              <LevelBadge xp={userData?.xp||0} size="lg"/>
              <div style={{marginTop:14,background:"rgba(255,255,255,.07)",borderRadius:99,height:7,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:`linear-gradient(90deg,${lv.color}80,${lv.color})`,transition:"width 1s ease"}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{userData?.xp||0} XP</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{next?`${next.min} XP → ${next.name}`:"MAX LEVEL 🔥"}</span>
              </div>
            </div>
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
              {[{l:"Sessions",v:userData?.sessions||0,c:"#c4b5fd"},{l:"Streak",v:`${userData?.streak||0}🔥`,c:"#fdba74"},{l:"Total XP",v:userData?.xp||0,c:"#6ee7b7"}].map(s=>(
                <div key={s.l} style={{padding:"14px 10px",borderRadius:15,background:"rgba(255,255,255,.03)",border:`1px solid ${s.c}20`,textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:800,color:s.c,marginBottom:2}}>{s.v}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Scenarios */}
            <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.3)",marginBottom:10,letterSpacing:".5px",textTransform:"uppercase"}}>Choose a Scenario</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {SCENARIOS.map((s,i)=>(
                <button key={s.id} onClick={()=>{setScene(s);setPage("persona-select");}} className="ch"
                  style={{padding:"16px 14px",borderRadius:17,background:`linear-gradient(135deg,${s.color}0e,${s.color}06)`,border:`1px solid ${s.color}25`,cursor:"pointer",textAlign:"left",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",animation:`up .3s ${i*.06}s ease both`,opacity:0,position:"relative"}}>
                  {s.tag&&<div style={{position:"absolute",top:9,right:9,fontSize:8,fontWeight:700,color:s.color,background:`${s.color}18`,padding:"2px 7px",borderRadius:99}}>{s.tag}</div>}
                  <div style={{fontSize:26,marginBottom:7}}>{s.emoji}</div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{s.label}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",lineHeight:1.5}}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeTab==="history"&&(
          <div style={{padding:"18px"}}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:16}} className="br">Your Sessions 📚</div>
            {history.length===0?(<div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,.25)"}}><div style={{fontSize:48,marginBottom:12}}>💬</div><div>No sessions yet. Start your first practice!</div></div>):(
              history.map((s,i)=>{
                const gc={S:"#f59e0b",A:"#34d399",B:"#60a5fa",C:"#c4b5fd",D:"#f87171"};
                return(<div key={s.id||i} style={{padding:"16px",borderRadius:17,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",marginBottom:9,animation:`up .3s ${i*.04}s ease both`,opacity:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:44,height:44,borderRadius:13,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.sceneEmoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{s.scene}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{s.personaEmoji} {s.persona} · {s.lang} · {s.date}</div>
                      <div style={{display:"flex",gap:6,marginTop:5}}>
                        <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.4)"}}>💬 {s.msgs}</span>
                        <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"rgba(251,191,36,.1)",color:"#fbbf24"}}>⚡ +{s.xpEarned}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:26,fontWeight:900,color:gc[s.grade]||"#fff"}}>{s.grade}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{s.score}%</div></div>
                  </div>
                </div>);
              })
            )}
          </div>
        )}

        {/* WORLDWIDE LEADERBOARD */}
        {activeTab==="leaderboard"&&(
          <div style={{padding:"18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{fontSize:18,fontWeight:700}} className="br">World Leaderboard 🌍</div>
              <button onClick={async()=>{setLbLoading(true);const lb=await getWorldLeaderboard(fbRef.current);setLeaderboard(lb);setLbLoading(false);}} style={{background:"none",border:"none",color:"rgba(167,139,250,.7)",cursor:"pointer",fontSize:13}}>
                {lbLoading?<div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(167,139,250,.3)",borderTop:"2px solid #a855f7",animation:"spin .7s linear infinite"}}/>:"↻ Refresh"}
              </button>
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginBottom:18}}>Live rankings from all SOCIOVA users worldwide</div>
            {leaderboard.length===0?(
              <div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,.25)"}}><div style={{fontSize:48,marginBottom:12}}>🏆</div><div>Be the first on the global leaderboard!</div></div>
            ):(
              leaderboard.map((u,i)=>{
                const lv=getLevel(u.xp||0);
                const medals=["🥇","🥈","🥉"];
                const isMe=u.uid===fbUser?.uid;
                const flag=COUNTRY_FLAGS[u.country]||"🌍";
                return(
                  <div key={u.uid||i} style={{padding:"14px 16px",borderRadius:17,background:isMe?"rgba(167,139,250,.08)":"rgba(255,255,255,.03)",border:isMe?"1px solid rgba(167,139,250,.4)":"1px solid rgba(255,255,255,.07)",marginBottom:8,display:"flex",alignItems:"center",gap:10,animation:`up .3s ${i*.04}s ease both`,opacity:0}}>
                    <div style={{fontSize:20,width:28,textAlign:"center"}}>{i<3?medals[i]:`${i+1}`}</div>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{u.avatar||"👤"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}{isMe&&<span style={{fontSize:10,color:"rgba(167,139,250,.8)",marginLeft:5}}>· You</span>}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                        <span style={{fontSize:10,color:lv.color}}>{lv.emoji} {lv.name}</span>
                        <span style={{fontSize:12}}>{flag}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:15,fontWeight:700,color:"#fbbf24"}}>{(u.xp||0).toLocaleString()}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>XP</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab==="profile"&&(
          <div style={{padding:"18px"}}>
            <div style={{textAlign:"center",padding:"28px 16px",borderRadius:24,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",marginBottom:18}}>
              <div style={{fontSize:56,marginBottom:8}}>{userData?.avatar||"👤"}</div>
              <div style={{fontSize:20,fontWeight:700,marginBottom:2}}>{userData?.name||fbUser?.displayName||"User"}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:18}}>{fbUser?.email}</div>
              <LevelBadge xp={userData?.xp||0} size="lg"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[{l:"Total XP",v:`${userData?.xp||0}⚡`,c:"#fbbf24"},{l:"Day Streak",v:`${userData?.streak||0}🔥`,c:"#fb923c"},{l:"Sessions",v:userData?.sessions||0,c:"#c4b5fd"},{l:"Best Grade",v:history.length?history.slice().sort((a,b)=>b.score-a.score)[0]?.grade||"—":"—",c:"#34d399"}].map(s=>(
                <div key={s.l} style={{padding:"16px",borderRadius:15,background:"rgba(255,255,255,.03)",border:`1px solid ${s.c}20`,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:s.c,marginBottom:3}}>{s.v}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",marginBottom:12,fontSize:13}}>
              <div style={{color:"rgba(255,255,255,.35)",marginBottom:4,fontSize:11}}>SIGNED IN VIA</div>
              <div style={{fontWeight:600}}>{fbUser?.providerData?.[0]?.providerId==="google.com"?"Google 🔵":fbUser?.providerData?.[0]?.providerId==="password"?"Email & Password 🔐":"Magic Link ✉️"}</div>
            </div>
            <button onClick={handleLogout} className="gbtn" style={{width:"100%",padding:"13px",borderRadius:14,fontSize:14,color:"#f87171",borderColor:"rgba(248,113,113,.2)"}}>Sign Out</button>
          </div>
        )}

        {/* BOTTOM NAV */}
        <div className="glass" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:680,borderTop:"1px solid rgba(255,255,255,.08)",padding:"8px 0 16px",zIndex:50}}>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {[{id:"home",e:"🏠",l:"Home"},{id:"history",e:"📚",l:"History"},{id:"leaderboard",e:"🌍",l:"World"},{id:"profile",e:"👤",l:"Profile"}].map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 16px",borderRadius:12,color:activeTab===t.id?"#a855f7":"rgba(255,255,255,.3)",transition:"all .2s"}}>
                <div style={{fontSize:20,marginBottom:2}}>{t.e}</div>
                <div style={{fontSize:10,fontWeight:activeTab===t.id?700:400}}>{t.l}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );}

  // ══════════════════════════════════════════════
  // PERSONA SELECT
  // ══════════════════════════════════════════════
  if(page==="persona-select") return(
    <div style={{minHeight:"100vh",background:"#040410",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{CSS}</style><Orbs/>
      <div style={{position:"relative",zIndex:1,maxWidth:700,margin:"0 auto",padding:"28px 18px"}}>
        <button onClick={()=>setPage("dashboard")} className="gbtn" style={{padding:"7px 15px",borderRadius:10,fontSize:13,marginBottom:24}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:99,background:`${scene?.color}18`,border:`1px solid ${scene?.color}30`,fontSize:12,color:scene?.color,fontWeight:600,marginBottom:14}}>{scene?.emoji} {scene?.label}</div>
          <h2 className="br" style={{fontSize:"clamp(20px,4vw,34px)",letterSpacing:"-1px"}}>Choose your AI partner</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          {PERSONAS.map((p,i)=>(
            <button key={p.id} onClick={()=>{setPersona(p);setPage("pre-chat");}} className="ch"
              style={{padding:"22px 18px",borderRadius:20,background:`linear-gradient(135deg,${p.color}0e,${p.color}05)`,border:`1px solid ${p.color}25`,cursor:"pointer",textAlign:"left",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",animation:`up .3s ${i*.07}s ease both`,opacity:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${p.color}40,${p.color}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{p.emoji}</div>
                <div><div className="br" style={{fontSize:15}}>{p.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>Age {p.age} · {p.vibe}</div></div>
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.65}}>{p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // PRE-CHAT
  // ══════════════════════════════════════════════
  if(page==="pre-chat") return(
    <div style={{minHeight:"100vh",background:"#040410",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <style>{CSS}</style><Orbs/>
      <div style={{position:"relative",zIndex:1,maxWidth:440,width:"100%",animation:"scaleUp .4s ease both"}}>
        <button onClick={()=>setPage("persona-select")} className="gbtn" style={{padding:"7px 15px",borderRadius:10,fontSize:13,marginBottom:22}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px",borderRadius:18,background:`linear-gradient(135deg,${persona?.color}12,${persona?.color}06)`,border:`1px solid ${persona?.color}25`,marginBottom:22}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${persona?.color}50,${persona?.color}25)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{persona?.emoji}</div>
          <div><div className="br" style={{fontSize:17}}>{persona?.name}</div><div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{scene?.emoji} {scene?.label} · {persona?.vibe}</div></div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.35)",marginBottom:10,letterSpacing:".8px",textTransform:"uppercase"}}>Language</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
            {LANGUAGES.map(l=>(
              <button key={l.code} onClick={()=>setLang(l)} style={{padding:"8px 6px",borderRadius:10,border:lang.code===l.code?"1.5px solid rgba(167,139,250,.6)":"1px solid rgba(255,255,255,.09)",background:lang.code===l.code?"rgba(167,139,250,.12)":"rgba(255,255,255,.03)",cursor:"pointer",color:"#fff",fontSize:11,fontWeight:lang.code===l.code?600:400,transition:"all .2s",textAlign:"center"}}>
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:26}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.35)",marginBottom:10,letterSpacing:".8px",textTransform:"uppercase"}}>Mode</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{id:"text",icon:"💬",label:"Text Chat"},{id:"voice",icon:"🎙️",label:"Voice Mode"}].map(m=>(
              <button key={m.id} onClick={()=>setChatMode(m.id)} style={{padding:"13px",borderRadius:13,border:chatMode===m.id?"1.5px solid rgba(167,139,250,.6)":"1px solid rgba(255,255,255,.09)",background:chatMode===m.id?"rgba(167,139,250,.12)":"rgba(255,255,255,.03)",cursor:"pointer",color:"#fff",transition:"all .2s",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:4}}>{m.icon}</div>
                <div style={{fontSize:12,fontWeight:chatMode===m.id?600:400}}>{m.label}</div>
              </button>
            ))}
          </div>
        </div>
        <button className="pbtn" onClick={()=>startChat(scene,persona,lang)} style={{width:"100%",padding:"14px",borderRadius:13,fontSize:14}}>Start with {persona?.name} →</button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // CHAT
  // ══════════════════════════════════════════════
  if(page==="chat") return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#040410",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",overflow:"hidden"}}>
      <style>{CSS}</style><Orbs/>
      <div className="glass" style={{padding:"10px 13px",borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setPage("dashboard")} className="gbtn" style={{padding:"6px 10px",borderRadius:9,fontSize:12,flexShrink:0}}>← Back</button>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:99,background:`${persona?.color}15`,border:`1px solid ${persona?.color}25`,flex:1,minWidth:0}}>
            <span style={{fontSize:13}}>{persona?.emoji}</span>
            <span style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{persona?.name}</span>
            <span style={{fontSize:10,color:"rgba(255,255,255,.3)",flexShrink:0}}>· {scene?.emoji}</span>
          </div>
          <div style={{display:"flex",background:"rgba(255,255,255,.06)",borderRadius:9,padding:3,gap:2,flexShrink:0}}>
            {["text","voice"].map(m=>(
              <button key={m} onClick={()=>setChatMode(m)} style={{padding:"5px 8px",borderRadius:7,border:"none",cursor:"pointer",fontSize:10,background:chatMode===m?"rgba(167,139,250,.25)":"transparent",color:chatMode===m?"#c4b5fd":"rgba(255,255,255,.4)",transition:"all .2s"}}>
                {m==="text"?"💬":"🎙️"}
              </button>
            ))}
          </div>
          <button onClick={endChat} style={{padding:"6px 12px",borderRadius:9,border:"1px solid rgba(249,115,22,.35)",background:"rgba(249,115,22,.1)",color:"#fb923c",cursor:"pointer",fontSize:12,fontWeight:600,flexShrink:0}}>End ✓</button>
        </div>
      </div>
      {apiError&&<div style={{padding:"8px 15px",background:"rgba(239,68,68,.12)",borderBottom:"1px solid rgba(239,68,68,.2)",fontSize:12,color:"#fca5a5",display:"flex",alignItems:"center",flexShrink:0}}>⚠️ {apiError}<button onClick={()=>setApiError("")} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",marginLeft:"auto"}}>✕</button></div>}
      {voice.error&&<div style={{padding:"8px 15px",background:"rgba(239,68,68,.12)",borderBottom:"1px solid rgba(239,68,68,.2)",fontSize:12,color:"#fca5a5",flexShrink:0}}>⚠️ {voice.error}</div>}

      {chatMode==="voice"?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",overflowY:"auto",position:"relative",zIndex:1}}>
          <div style={{width:"100%",maxWidth:480,flex:1,overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
            {msgs.slice(-4).map(m=><Bubble key={m.id} msg={m} isNew={m.id===newId} persona={persona}/>)}
            {aiTyping&&<Typing/>}
            <div ref={endRef}/>
          </div>
          <div style={{flexShrink:0,paddingBottom:14,textAlign:"center"}}>
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
              {voice.vState==="listening"&&[0,1].map(i=><div key={i} style={{position:"absolute",width:110,height:110,borderRadius:"50%",border:"2px solid rgba(236,72,153,.35)",animation:`rippleOut 1.8s ease-out infinite`,animationDelay:`${i*.7}s`,pointerEvents:"none"}}/>)}
              <button onClick={voice.vState!=="idle"?voice.stopAll:handleVoiceTap} style={{width:78,height:78,borderRadius:"50%",border:"none",cursor:"pointer",background:voice.vState==="listening"?"linear-gradient(135deg,#be185d,#7c3aed)":voice.vState==="speaking"?"linear-gradient(135deg,#065f46,#1d4ed8)":"linear-gradient(135deg,#7c3aed,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,animation:"glow 2s ease-in-out infinite",position:"relative",zIndex:1}}>
                {voice.vState==="thinking"?<div style={{width:18,height:18,borderRadius:"50%",border:"3px solid rgba(255,255,255,.25)",borderTop:"3px solid white",animation:"spin .8s linear infinite"}}/>:voice.vState==="listening"?"🎤":voice.vState==="speaking"?"🔊":"🎙️"}
              </button>
            </div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>{voice.vState==="listening"?"Listening...":voice.vState==="speaking"?`${persona?.name} speaking...`:voice.vState==="thinking"?"Thinking...":"Tap to speak"}</div>
            {voice.liveText&&<div style={{marginTop:8,padding:"6px 14px",borderRadius:10,background:"rgba(244,114,182,.08)",border:"1px solid rgba(244,114,182,.2)",fontSize:12,color:"rgba(255,255,255,.6)",fontStyle:"italic"}}>"{voice.liveText}"</div>}
          </div>
        </div>
      ):(
        <>
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px",position:"relative",zIndex:1}}>
            {msgs.map(m=><Bubble key={m.id} msg={m} isNew={m.id===newId} persona={persona}/>)}
            {aiTyping&&<Typing/>}
            <div ref={endRef}/>
          </div>
          <div className="glass" style={{padding:"9px 12px",borderTop:"1px solid rgba(255,255,255,.08)",flexShrink:0,zIndex:10}}>
            {voice.supported&&(
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                <button onClick={handleVoiceTap} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:99,cursor:"pointer",fontSize:11,transition:"all .25s",...(voice.vState==="listening"?{background:"rgba(236,72,153,.15)",border:"1.5px solid rgba(236,72,153,.55)",color:"#f472b6"}:voice.vState==="speaking"?{background:"rgba(52,211,153,.12)",border:"1.5px solid rgba(52,211,153,.45)",color:"#34d399"}:{background:"rgba(255,255,255,.06)",border:"1.5px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.5)"})}}>
                  <span style={{fontSize:13}}>{voice.vState==="listening"?"🔴":voice.vState==="speaking"?"🔊":"🎙️"}</span>
                  <span>{voice.vState==="listening"?"Listening...":voice.vState==="speaking"?"Speaking...":voice.vState==="thinking"?"Thinking...":"Voice"}</span>
                </button>
                {voice.liveText&&<span style={{fontSize:11,color:"rgba(255,255,255,.4)",fontStyle:"italic"}}>"{voice.liveText}"</span>}
                <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,cursor:"pointer"}} onClick={()=>setAutoSpeak(!autoSpeak)}>
                  <div style={{width:26,height:15,borderRadius:99,position:"relative",background:autoSpeak?"linear-gradient(135deg,#7c3aed,#db2777)":"rgba(255,255,255,.1)",transition:"all .3s"}}><div style={{width:9,height:9,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:autoSpeak?13:3,transition:"left .3s"}}/></div>
                  <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Auto-speak</span>
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:7,alignItems:"flex-end"}}>
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg(input);}}}
                onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,110)+"px";}}
                placeholder={aiTyping?"AI is thinking...":"Type your message..."}
                rows={1} style={{flex:1,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"10px 13px",color:"#fff",fontSize:14,maxHeight:110,lineHeight:1.55,resize:"none",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor="rgba(167,139,250,.55)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}/>
              <button onClick={()=>sendMsg(input)} disabled={!input.trim()||aiTyping} className="pbtn" style={{width:42,height:42,borderRadius:12,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>↑</button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ══════════════════════════════════════════════
  // FEEDBACK
  // ══════════════════════════════════════════════
  if(page==="feedback"&&feedback){
    const gc={S:"#f59e0b",A:"#34d399",B:"#60a5fa",C:"#c4b5fd",D:"#f87171"};
    const grade=feedback.session?.grade||"B";
    const gradeMsg={S:"LEGENDARY! 🌟",A:"Outstanding! 🔥",B:"Great work! 💪",C:"Keep going! 📈",D:"Don't stop! 🌱"};
    return(
      <div style={{minHeight:"100vh",background:"#040410",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"22px 18px"}}>
        <style>{CSS}</style><Orbs/>
        {xpPop&&<div style={{position:"fixed",top:"15%",left:"50%",transform:"translateX(-50%)",zIndex:999,fontSize:24,fontWeight:800,color:"#fbbf24",animation:"xpPop 2.2s ease forwards",pointerEvents:"none"}}>{xpPop}</div>}
        <div style={{position:"relative",zIndex:1,maxWidth:500,margin:"0 auto"}}>
          <button onClick={()=>{setPage("dashboard");setActiveTab("home");}} className="gbtn" style={{padding:"7px 15px",borderRadius:10,fontSize:13,marginBottom:22}}>← Dashboard</button>
          {/* Grade */}
          <div style={{textAlign:"center",padding:"32px 20px 26px",borderRadius:26,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",marginBottom:16,animation:"scaleUp .4s ease both"}}>
            <div style={{fontSize:66,fontWeight:900,fontFamily:"'Bricolage Grotesque',sans-serif",color:gc[grade],textShadow:`0 0 40px ${gc[grade]}60`,lineHeight:1,marginBottom:5}}>{grade}</div>
            <div style={{fontSize:15,color:gc[grade],fontWeight:600,marginBottom:7}}>{gradeMsg[grade]}</div>
            <div style={{fontSize:40,fontWeight:800,fontFamily:"'Bricolage Grotesque',sans-serif",marginBottom:4}}>{feedback.overall}%</div>
            <div style={{color:"rgba(255,255,255,.4)",fontSize:12,marginBottom:10}}>Overall Social Score</div>
            <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:11,padding:"4px 12px",borderRadius:99,background:"rgba(251,191,36,.12)",color:"#fbbf24"}}>+{feedback.earned} XP earned ⚡</span>
              <span style={{fontSize:11,padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.4)"}}>💬 {feedback.count} messages</span>
            </div>
          </div>
          {/* Scores */}
          <div style={{padding:"20px",borderRadius:22,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",marginBottom:14}}>
            <div className="br" style={{fontSize:14,marginBottom:16}}>Skill Breakdown</div>
            <ScoreBar label="Confidence"        val={feedback.confidence} color="#f9a8d4" delay={0}/>
            <ScoreBar label="Empathy"           val={feedback.empathy}    color="#6ee7b7" delay={100}/>
            <ScoreBar label="Active Listening"  val={feedback.listening}  color="#93c5fd" delay={200}/>
            <ScoreBar label="Conversation Flow" val={feedback.flow}       color="#c4b5fd" delay={300}/>
            <ScoreBar label="Respect"           val={feedback.respect}    color="#fdba74" delay={400}/>
          </div>
          {/* Tips */}
          <div style={{padding:"20px",borderRadius:22,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",marginBottom:14}}>
            <div className="br" style={{fontSize:14,marginBottom:14}}>AI Coach Tips 🎯</div>
            {feedback.tips.map((tip,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<feedback.tips.length-1?12:0}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.75}}>{tip}</div>
              </div>
            ))}
          </div>
          {/* Share */}
          {showShare&&(
            <div style={{padding:"20px",borderRadius:22,background:"linear-gradient(135deg,rgba(124,58,237,.2),rgba(219,39,119,.12))",border:"1px solid rgba(167,139,250,.35)",marginBottom:14,textAlign:"center",animation:"scaleUp .3s ease both"}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:10}}>📱 Screenshot & share on Instagram/WhatsApp!</div>
              <div style={{padding:"16px",borderRadius:14,background:"rgba(4,4,16,.85)"}}>
                <div className="br gt" style={{fontSize:18,marginBottom:6}}>SOCIOVA</div>
                <div style={{fontSize:34,fontWeight:900,color:gc[grade],marginBottom:3}}>{grade}</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:3}}>{feedback.overall}% · {feedback.session?.scene}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:6}}>with {feedback.session?.personaEmoji} {feedback.session?.persona}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>⚡ +{feedback.earned} XP · 🔥 {userData?.streak||0} day streak · 🌍 Worldwide</div>
              </div>
            </div>
          )}
          {/* Actions */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
            <button className="pbtn" onClick={()=>startChat(scene,persona,lang)} style={{padding:"12px",borderRadius:13,fontSize:13}}>Practice Again 🔄</button>
            <button className="gbtn" onClick={()=>setShowShare(!showShare)} style={{padding:"12px",borderRadius:13,fontSize:13}}>Share Score 📤</button>
          </div>
          <button className="gbtn" onClick={()=>{setPage("dashboard");setActiveTab("leaderboard");}} style={{width:"100%",padding:"11px",borderRadius:13,fontSize:13,marginBottom:9}}>See World Leaderboard 🌍</button>
          <button className="gbtn" onClick={()=>{setPage("dashboard");setActiveTab("home");}} style={{width:"100%",padding:"11px",borderRadius:13,fontSize:13}}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return null;
}
