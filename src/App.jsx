import { useState, useRef, useEffect, useCallback } from "react";

// ── API ──
async function callClaude(prompt, sys = "") {
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] };
  if (sys) body.system = sys;
  const r = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

// ── SHARED UI ──
const BTN = ({ onClick, disabled, color = "#1e3a8a", children, style = {} }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ border:"none", borderRadius:8, padding:"11px 18px", fontWeight:700, fontSize:14,
      cursor:disabled?"not-allowed":"pointer", background:disabled?"#e2e8f0":color,
      color:disabled?"#94a3b8":"#fff", ...style }}>
    {children}
  </button>
);
const Card = ({ children, style = {} }) => (
  <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.08)", marginBottom:14, ...style }}>
    {children}
  </div>
);
const FeedbackBlock = ({ text }) => (
  <div style={{ fontSize:14, lineHeight:1.8, color:"#334155" }}>
    {(text||"").split('\n').map((line, i) => {
      const clean = line.replace(/\*\*/g,'');
      if (line.startsWith('**') && line.endsWith('**'))
        return <p key={i} style={{ fontWeight:700, color:"#1e3a8a", margin:"10px 0 3px" }}>{clean}</p>;
      return <p key={i} style={{ margin:"2px 0" }}>{line}</p>;
    })}
  </div>
);
const SubBackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ border:"none", background:"transparent", color:"#64748b", fontWeight:600, fontSize:14, cursor:"pointer", padding:"4px 0", marginBottom:12, display:"block" }}>
    ← 이전으로
  </button>
);
const SubMenu = ({ items, onSelect }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
    {items.map(item => (
      <button key={item.id} onClick={() => onSelect(item.id)}
        style={{ background:"#fff", border:"2px solid #e2e8f0", borderRadius:14, padding:"22px 16px", cursor:"pointer", textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:26, marginBottom:8 }}>{item.icon}</div>
        <div style={{ fontWeight:700, fontSize:14, color:"#1e3a8a", marginBottom:4 }}>{item.label}</div>
        <div style={{ fontSize:12, color:"#94a3b8" }}>{item.desc}</div>
      </button>
    ))}
  </div>
);

// ── COUNTDOWN TIMER ──
function CountdownTimer({ totalSecs, onExpire }) {
  const [left, setLeft] = useState(totalSecs);
  useEffect(() => {
    setLeft(totalSecs);
    const t = setInterval(() => setLeft(s => {
      if (s <= 1) { clearInterval(t); onExpire && onExpire(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [totalSecs]);
  const pct = (left / totalSecs) * 100;
  const color = left > totalSecs * 0.5 ? "#15803d" : left > totalSecs * 0.2 ? "#d97706" : "#dc2626";
  const fmt = `${String(Math.floor(left/60)).padStart(2,"0")}:${String(left%60).padStart(2,"0")}`;
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
        <span style={{ color:"#64748b" }}>남은 시간</span>
        <span style={{ fontWeight:700, color }}>{fmt}</span>
      </div>
      <div style={{ background:"#e2e8f0", borderRadius:6, height:6 }}>
        <div style={{ background:color, height:6, borderRadius:6, width:`${pct}%`, transition:"width 1s linear" }} />
      </div>
    </div>
  );
}

// ── VOCAB DATA ──
const VOCAB = [
  { word:"Ambiguous", def:"Having more than one possible meaning; unclear", ex:"The results were ambiguous." },
  { word:"Coherent", def:"Logical and consistent; forming a unified whole", ex:"She gave a coherent explanation." },
  { word:"Prevalent", def:"Widespread; existing or occurring frequently", ex:"Obesity is prevalent in many countries." },
  { word:"Mitigate", def:"To make less severe or intense", ex:"Trees can mitigate climate change effects." },
  { word:"Empirical", def:"Based on observation or experience rather than theory", ex:"They sought empirical evidence." },
  { word:"Paradigm", def:"A typical example or pattern; a framework of thought", ex:"A paradigm shift in physics." },
  { word:"Transient", def:"Lasting only a short time; temporary", ex:"The pain was transient." },
  { word:"Augment", def:"To make larger; to increase or supplement", ex:"She augmented her income with freelance work." },
  { word:"Scrutinize", def:"To examine carefully and critically", ex:"The committee will scrutinize all proposals." },
  { word:"Inherent", def:"Existing as a natural or basic part of something", ex:"There are inherent risks in every venture." },
];

// ── READING DATA ──
const CTW_ITEMS = [
  {
    title: "The Renaissance",
    passage: [
      { t:"The Renaissance was a period in European history from the fourteenth to the seventeenth " },
      { b:true, shown:"cent", blank:"uries", fill:"uries" },
      { t:". This era is " },
      { b:true, shown:"charac", blank:"terized", fill:"terized" },
      { t:" by a renewed interest in classical " },
      { b:true, shown:"cul", blank:"ture", fill:"ture" },
      { t:" and art. It " },
      { b:true, shown:"estab", blank:"lished", fill:"lished" },
      { t:" a flourishing environment where artists like Leonardo da Vinci created masterpieces that celebrated human " },
      { b:true, shown:"poten", blank:"tial", fill:"tial" },
      { t:"." },
    ]
  },
  {
    title: "Climate Change",
    passage: [
      { t:"Scientists have long " },
      { b:true, shown:"ob", blank:"served", fill:"served" },
      { t:" that the Earth's " },
      { b:true, shown:"atmo", blank:"sphere", fill:"sphere" },
      { t:" is gradually warming. This " },
      { b:true, shown:"pheno", blank:"menon", fill:"menon" },
      { t:" is primarily caused by burning " },
      { b:true, shown:"fos", blank:"sil", fill:"sil" },
      { t:" fuels, which releases carbon " },
      { b:true, shown:"di", blank:"oxide", fill:"oxide" },
      { t:" into the air." },
    ]
  },
  {
    title: "Urban Development",
    passage: [
      { t:"Urban " },
      { b:true, shown:"devel", blank:"opment", fill:"opment" },
      { t:" has brought significant " },
      { b:true, shown:"econ", blank:"omic", fill:"omic" },
      { t:" benefits to many cities. However, rapid population growth has created " },
      { b:true, shown:"environ", blank:"mental", fill:"mental" },
      { t:" challenges, including " },
      { b:true, shown:"pollu", blank:"tion", fill:"tion" },
      { t:" and a shortage of " },
      { b:true, shown:"afford", blank:"able", fill:"able" },
      { t:" housing for low-income residents." },
    ]
  },
];

const DAILY_PASSAGES = [
  {
    text:"To: All Students\nFrom: Library Services\nSubject: Extended Hours During Finals Week\n\nThe main library will be open 24 hours a day from December 10–17. Additional study rooms can be booked through the online portal (max 3 hours per booking). Students must show a valid ID at the entrance after midnight. Food and drinks with lids are permitted in designated areas only. For technical support, visit the IT Help Desk on Floor 2.",
    ko:"수신: 전체 학생\n발신: 도서관 서비스\n제목: 기말시험 기간 연장 운영 안내\n\n중앙 도서관이 12월 10일~17일 동안 24시간 운영됩니다. 추가 스터디룸은 온라인 포털을 통해 예약 가능합니다(최대 3시간). 자정 이후에는 유효한 신분증을 제시해야 입장할 수 있습니다. 뚜껑이 있는 음료는 지정된 구역에서만 허용됩니다. 기술 지원이 필요하면 2층 IT 헬프데스크를 방문하세요.",
    questions:[
      { q:"What must students bring to enter after midnight?", ko:"자정 이후 입장 시 무엇을 지참해야 하나요?", opts:["A library card","A valid ID","A booking confirmation","A student receipt"], ans:1 },
      { q:"Where can students get technical help?", ko:"기술 지원은 어디서 받을 수 있나요?", opts:["Floor 1","The front desk","IT Help Desk on Floor 2","The online portal"], ans:2 },
      { q:"How long can a study room be booked?", ko:"스터디룸은 최대 몇 시간 예약할 수 있나요?", opts:["1 hour","2 hours","3 hours maximum","Unlimited"], ans:2 },
    ]
  },
  {
    text:"Notice from Housing Services\n\nAll residents must complete their room inspection form by Friday, November 8. Please report any maintenance issues using the online portal at housing.edu/report. Failure to submit the form may result in residents being held responsible for pre-existing damage. If you need assistance, visit the Housing Office (Building C, Room 104) during office hours: Mon–Fri, 9 AM–5 PM.",
    ko:"주거 서비스 공지\n\n모든 입주자는 11월 8일(금)까지 객실 점검 양식을 작성해야 합니다. 유지보수 문제는 housing.edu/report 온라인 포털을 통해 신고하세요. 양식을 제출하지 않으면 기존 손상에 대한 책임을 질 수 있습니다. 도움이 필요하면 업무 시간(월~금, 오전 9시~오후 5시) 중 주거 사무소(C동 104호)를 방문하세요.",
    questions:[
      { q:"What is the deadline for the inspection form?", ko:"점검 양식 제출 마감일은 언제인가요?", opts:["November 4","November 8","November 12","November 15"], ans:1 },
      { q:"What may happen if a resident doesn't submit the form?", ko:"양식을 제출하지 않으면 어떻게 될 수 있나요?", opts:["They lose their housing","They are fined","They may be blamed for pre-existing damage","Their room is inspected twice"], ans:2 },
      { q:"Where is the Housing Office?", ko:"주거 사무소는 어디에 있나요?", opts:["Building A, Room 104","Building B, Room 204","Building C, Room 104","Building D, Room 404"], ans:2 },
    ]
  },
];

const ACADEMIC_PASSAGE = {
  text:"Urban green spaces — parks, gardens, and tree-lined streets — have long been considered aesthetic additions to city planning. However, recent research reveals their role extends far beyond beauty. Studies conducted in cities across Europe and North America demonstrate that residents living within 300 meters of green space report significantly lower stress levels and better mental health outcomes than those without such access. The mechanism appears to involve both direct exposure to nature, which reduces cortisol levels, and indirect benefits such as increased opportunities for physical activity and social interaction. Critics argue that urban greening initiatives often prioritize wealthy neighborhoods, raising concerns about environmental inequality. Nonetheless, the evidence that green spaces serve as critical public health infrastructure continues to mount, prompting city planners to integrate them more deliberately into development projects.",
  ko:"도시 녹지 공간 — 공원, 정원, 가로수길 — 은 오랫동안 도시 계획에서 미적 요소로 여겨져 왔습니다. 그러나 최근 연구에 따르면 그 역할은 아름다움을 훨씬 넘어서는 것으로 밝혀졌습니다. 유럽과 북미 도시들에서 실시된 연구들은 녹지 공간 300미터 이내에 거주하는 주민들이 접근성이 없는 주민들보다 스트레스 수준이 현저히 낮고 정신 건강 결과가 더 좋다고 보고한다는 것을 보여줍니다. 그 메커니즘은 코르티솔 수치를 낮추는 자연에의 직접적인 노출과 신체 활동 및 사회적 상호작용 기회 증가라는 간접적인 혜택 모두를 포함하는 것으로 보입니다. 비평가들은 도시 녹화 사업이 종종 부유한 동네를 우선시하여 환경 불평등에 대한 우려를 낳는다고 주장합니다. 그럼에도 불구하고, 녹지 공간이 중요한 공중 보건 인프라 역할을 한다는 증거는 계속 늘어나고 있으며, 이는 도시 계획가들이 개발 프로젝트에 녹지 공간을 더욱 의도적으로 통합하도록 촉구하고 있습니다.",
  questions:[
    { q:"What is the main argument of the passage?", ko:"지문의 주요 주장은 무엇인가요?", opts:["Green spaces are only useful for exercise","Green spaces are primarily aesthetic","Green spaces provide significant health benefits beyond appearance","Green spaces cause inequality"], ans:2 },
    { q:"How does green space reduce stress?", ko:"녹지 공간은 어떻게 스트레스를 줄이나요?", opts:["By providing outdoor workplaces","By lowering cortisol and enabling physical/social activity","By replacing noisy streets","By encouraging suburban living"], ans:1 },
    { q:"What concern do critics raise?", ko:"비평가들은 어떤 우려를 제기하나요?", opts:["Too expensive","Reduces parking","Benefits wealthier neighborhoods more","Harms wildlife"], ans:2 },
    { q:"The word 'mount' likely means:", ko:"'mount'의 의미로 가장 적절한 것은?", opts:["climb physically","increase or grow","attach to a wall","decrease steadily"], ans:1 },
    { q:"What can be inferred about city planners?", ko:"도시 계획가들에 대해 추론할 수 있는 것은?", opts:["They will stop building parks","They will focus only on wealthy areas","They will more intentionally include green spaces","They will replace parks with community centers"], ans:2 },
  ]
};

// ── SPEAKING DATA ──
const REPEAT_SENTENCES = [
  { text:"Welcome to the campus library.", level:1 },
  { text:"Please return your books before the due date.", level:1 },
  { text:"The science building is located next to the main hall.", level:2 },
  { text:"Students must register for classes by the end of the week.", level:2 },
  { text:"The professor asked everyone to submit their assignments online.", level:3 },
  { text:"All research papers should include at least five peer-reviewed sources.", level:3 },
  { text:"The university's financial aid office provides support for students with demonstrated need.", level:4 },
];

const INTERVIEW_TOPICS = [
  {
    theme:"Study Habits",
    questions:[
      "Do you prefer studying during the day or at night? Why?",
      "Do you prefer studying at a library or at home? Explain your choice.",
      "Do you prefer studying alone or in a group? Why?",
      "Do you think using a tablet is more effective than using traditional textbooks? Will this trend continue?",
    ]
  },
  {
    theme:"Technology & Daily Life",
    questions:[
      "Do you prefer communicating with friends in person or through technology? Why?",
      "Do you think smartphones have made people's lives better or more stressful? Explain.",
      "Would you prefer to pay with cash or with a digital payment app? Why?",
      "Do you think working from home is more productive than working in an office? Why or why not?",
    ]
  },
];

// ── WRITING DATA ──
const BUILD_SENTENCES = [
  { prompt:"Response to: 'What did she ask you about?'", words:["she","wanted","to","know","which","colleges","I'm","considering","already"], answer:"she wanted to know which colleges I'm considering", extra:"already" },
  { prompt:"Response to: 'Why was the student late?'", words:["the","bus","arrived","later","than","usual","very"], answer:"the bus arrived later than usual", extra:"very" },
  { prompt:"Response to: 'What does the professor recommend?'", words:["students","should","review","their","notes","before","each","lecture","always"], answer:"students should review their notes before each lecture", extra:"always" },
];

const EMAIL_SCENARIOS = [
  { scenario:"Your professor moved the midterm exam to next Friday, but you have a job interview you scheduled months ago. Write a professional email requesting an alternative arrangement.", req:["Explain the conflict clearly","Be polite and professional","Request a specific alternative","80–120 words"] },
  { scenario:"You missed last week's lab session due to illness and need materials and notes. Write an email to your TA asking for help.", req:["State reason for absence","Ask for what you need specifically","Offer to make up missed work","80–120 words"] },
];

const DISC_PROMPTS = [
  { prof:"Does social media do more good than harm, or more harm than good? Support your view with specific reasoning.", students:[{ name:"Maria", text:"I think social media is mostly positive — it connects people globally and gives a platform to voices that might otherwise go unheard." },{ name:"James", text:"I believe the negatives outweigh the positives. Misinformation spreads rapidly, and studies link social media to rising anxiety and depression." }] },
  { prof:"Should employees always be reachable after work via phone or email, or should there be a clear boundary?", students:[{ name:"Sofia", text:"Staying reachable shows dedication, especially in global companies across time zones." },{ name:"Daniel", text:"Constant availability leads to burnout. Research shows well-rested employees perform better." }] },
];

function wc(t) { return t.trim().split(/\s+/).filter(Boolean).length; }
function shuffleArr(arr) { return [...arr].sort(() => Math.random()-0.5); }

// ── MCOpt ──
const MCOpt = ({ label, i, sel, checked, correct, onSelect, koLabel }) => {
  let bg="#f8fafc", border="#e2e8f0", col="#334155";
  if (checked) {
    if (i===correct){bg="#f0fdf4";border="#86efac";col="#15803d";}
    else if (i===sel){bg="#fff5f5";border="#fca5a5";col="#dc2626";}
  } else if (i===sel){bg="#eff6ff";border="#93c5fd";col="#1d4ed8";}
  return (
    <div onClick={()=>!checked&&onSelect(i)} style={{ padding:"9px 12px", borderRadius:8, border:`2px solid ${border}`, background:bg, color:col, marginBottom:7, cursor:checked?"default":"pointer", fontSize:14 }}>
      {String.fromCharCode(65+i)}. {label}
    </div>
  );
};

// ══════════════════════════════════════════════
// VOCAB
// ══════════════════════════════════════════════
function VocabSection() {
  const [vIdx, setVIdx] = useState(0);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [wrongQ, setWrongQ] = useState([]);
  const [mcOpts, setMcOpts] = useState([]);
  const [mcSel, setMcSel] = useState(null);
  const [mcChecked, setMcChecked] = useState(false);
  const [mcMode, setMcMode] = useState(false);
  const [known, setKnown] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState("main");
  const [totalSecs, setTotalSecs] = useState(0);
  const [wordSecs, setWordSecs] = useState(0);
  const inputRef = useRef();

  useEffect(()=>{ const t=setInterval(()=>setTotalSecs(s=>s+1),1000); return()=>clearInterval(t); },[]);
  useEffect(()=>{ setWordSecs(0); const t=setInterval(()=>setWordSecs(s=>s+1),1000); return()=>clearInterval(t); },[vIdx, phase, mcMode]);

  const cur = phase==="retry" ? VOCAB[wrongQ[0]] : VOCAB[vIdx];
  const fmtT = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const color = s => s<60?"#15803d":s<180?"#d97706":"#dc2626";

  const handleSubmit = async () => {
    if (!input.trim()||checking) return;
    setChecking(true);
    const r = await callClaude(`Word: "${cur.word}"\nCorrect definition: "${cur.def}"\nStudent answer: "${input.trim()}"\nIs it close enough? Reply ONLY: CORRECT - [Korean reason] or INCORRECT - [Korean reason]`);
    const ok = r.trim().toUpperCase().startsWith("CORRECT");
    const msg = r.includes("-")?r.split("-").slice(1).join("-").trim():"";
    setResult({ok,msg});
    if (!ok&&phase==="main"){setWrong(w=>w+1);setWrongQ(q=>[...q,vIdx]);}
    if (ok&&phase==="main") setKnown(k=>k+1);
    setChecking(false);
  };

  const handleNext = () => {
    const wasOk=result?.ok; setResult(null); setInput("");
    if (phase==="main") {
      if (vIdx+1>=VOCAB.length) setPhase(wrongQ.length>0?"retry":"done");
      else setVIdx(i=>i+1);
    } else {
      if (wasOk) { const n=wrongQ.slice(1); if(n.length===0)setPhase("done"); else{setWrongQ(n);setMcMode(false);} }
      else { const others=VOCAB.filter((_,i)=>i!==wrongQ[0]).sort(()=>Math.random()-0.5).slice(0,3); setMcOpts([...others.map(w=>w.def),cur.def].sort(()=>Math.random()-0.5)); setMcMode(true);setMcSel(null);setMcChecked(false); }
    }
    setTimeout(()=>inputRef.current?.focus(),50);
  };

  const reset=()=>{setVIdx(0);setInput("");setResult(null);setWrongQ([]);setMcMode(false);setKnown(0);setWrong(0);setPhase("main");setChecking(false);setTotalSecs(0);setWordSecs(0);};

  if (phase==="done") return (
    <Card style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48}}>🎉</div>
      <h2 style={{color:"#1e3a8a"}}>완료!</h2>
      <p style={{color:"#64748b"}}>정답 <b>{known}</b> / 오답 <b>{wrong}</b> ({VOCAB.length}개)</p>
      <p style={{color:"#94a3b8",fontSize:13}}>총 소요 시간: <b>{fmtT(totalSecs)}</b></p>
      <BTN onClick={reset} style={{marginTop:12}}>다시 시작</BTN>
    </Card>
  );

  return (
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:13,color:"#64748b"}}>{phase==="retry"?`오답 복습 (${wrongQ.length}개)`:`${vIdx+1} / ${VOCAB.length}`} ✅{known} ❌{wrong}</span>
        <div style={{display:"flex",gap:6}}>
          {[{s:wordSecs,l:"이 문제"},{s:totalSecs,l:"전체"}].map(({s,l})=>(
            <div key={l} style={{display:"inline-flex",alignItems:"center",gap:4,background:"#f8fafc",border:`1.5px solid ${color(s)}`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700,color:color(s)}}>⏱{fmtT(s)} <span style={{fontWeight:400,color:"#94a3b8",fontSize:11}}>{l}</span></div>
          ))}
        </div>
      </div>
      <div style={{background:"#e2e8f0",borderRadius:6,height:5,marginBottom:18}}><div style={{background:phase==="retry"?"#f59e0b":"#1e3a8a",height:5,borderRadius:6,width:`${phase==="retry"?100:(vIdx/VOCAB.length)*100}%`,transition:"width 0.3s"}}/></div>
      {phase==="retry"&&<div style={{background:"#fef3c7",border:"1px solid #fbbf24",borderRadius:8,padding:"6px 12px",marginBottom:12,fontSize:13,color:"#92400e",textAlign:"center"}}>🔄 오답 복습</div>}
      <div style={{background:"#1e3a8a",borderRadius:14,padding:"28px 20px",textAlign:"center",marginBottom:18}}>
        <p style={{fontSize:13,color:"#93c5fd",margin:"0 0 6px"}}>뜻을 입력하세요</p>
        <p style={{fontSize:32,fontWeight:700,color:"#fff",margin:"0 0 8px"}}>{cur.word}</p>
        <p style={{fontSize:13,color:"#bfdbfe",margin:0,fontStyle:"italic"}}>"{cur.ex}"</p>
      </div>
      {mcMode ? (
        <div>
          <p style={{fontWeight:600,color:"#dc2626",fontSize:14,marginBottom:10}}>❌ 객관식으로 도전하세요</p>
          {mcOpts.map((opt,i)=>{
            const isC=opt===cur.def; let bg="#f8fafc",border="#e2e8f0",col="#334155";
            if(mcChecked){if(isC){bg="#f0fdf4";border="#86efac";col="#15803d";}else if(opt===mcSel){bg="#fff5f5";border="#fca5a5";col="#dc2626";}}
            else if(opt===mcSel){bg="#eff6ff";border="#93c5fd";col="#1d4ed8";}
            return <div key={i} onClick={()=>!mcChecked&&setMcSel(opt)} style={{padding:"10px 12px",borderRadius:8,border:`2px solid ${border}`,background:bg,color:col,marginBottom:7,cursor:mcChecked?"default":"pointer",fontSize:14}}>{String.fromCharCode(65+i)}. {opt}</div>;
          })}
          <div style={{marginTop:12}}>{!mcChecked?<BTN onClick={()=>setMcChecked(true)} disabled={!mcSel} style={{width:"100%"}}>확인</BTN>:<BTN onClick={()=>{const n=wrongQ.slice(1);setMcMode(false);setMcSel(null);setMcChecked(false);if(n.length===0)setPhase("done");else setWrongQ(n);}} style={{width:"100%"}}>다음 →</BTN>}</div>
        </div>
      ) : (
        <div>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!result)handleSubmit();}} disabled={!!result||checking} placeholder="영어 또는 한국어로 뜻을 입력하세요..."
            style={{width:"100%",padding:"12px 14px",border:`2px solid ${result?(result.ok?"#86efac":"#fca5a5"):"#e2e8f0"}`,borderRadius:10,fontSize:14,outline:"none",boxSizing:"border-box",background:result?(result.ok?"#f0fdf4":"#fff5f5"):"#fff"}}/>
          {result&&<div style={{marginTop:8,padding:10,borderRadius:8,background:result.ok?"#f0fdf4":"#fff5f5",border:`1px solid ${result.ok?"#86efac":"#fca5a5"}`,fontSize:14}}><b style={{color:result.ok?"#15803d":"#dc2626"}}>{result.ok?"✅ 정답!":"❌ 오답"}</b>{result.msg&&<span style={{marginLeft:6,color:"#475569",fontWeight:400}}>— {result.msg}</span>}{!result.ok&&<p style={{margin:"4px 0 0",color:"#475569",fontSize:13}}>정답: <b>{cur.def}</b></p>}</div>}
          <div style={{marginTop:12}}>{!result?<BTN onClick={handleSubmit} disabled={!input.trim()||checking} style={{width:"100%"}}>{checking?"채점 중...":"제출"}</BTN>:<BTN onClick={handleNext} style={{width:"100%"}}>다음 →</BTN>}</div>
        </div>
      )}
    </Card>
  );
}

// ══════════════════════════════════════════════
// CTW COMPONENT
// ══════════════════════════════════════════════
function CTWQuestion({ cIdx, setCIdx }) {
  const item = CTW_ITEMS[cIdx];
  const blanks = item.passage.filter(p => p.b);
  const [inputs, setInputs] = useState(Array(blanks.length).fill(""));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setInputs(Array(CTW_ITEMS[cIdx].passage.filter(p => p.b).length).fill(""));
    setChecked(false); setScore(0);
  }, [cIdx]);

  const check = () => {
    let s = 0;
    inputs.forEach((v, i) => {
      if (v.trim().toLowerCase() === blanks[i].fill.toLowerCase()) s++;
    });
    setScore(s); setChecked(true);
  };

  let bCount = 0;
  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:13, color:"#64748b" }}>문항 {cIdx+1}/{CTW_ITEMS.length} — {item.title}</span>
        {checked && <span style={{ fontWeight:700, color:"#1e3a8a" }}>정답 {score}/{blanks.length}</span>}
      </div>
      <CountdownTimer totalSecs={180} onExpire={() => { if (!checked) check(); }} />
      <p style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>
        색칠된 부분을 보고 <b>빠진 철자</b>만 입력하세요
      </p>
      <div style={{ background:"#f8fafc", borderLeft:"4px solid #1e3a8a", borderRadius:10, padding:"16px 20px", marginBottom:16, fontSize:15, lineHeight:3.4, color:"#1e293b" }}>
        {item.passage.map((part, pi) => {
          if (!part.b) return <span key={pi}>{part.t}</span>;
          const bi = bCount++;
          const correct = checked && inputs[bi]?.trim().toLowerCase() === blanks[bi].fill.toLowerCase();
          const wrong = checked && !correct;
          return (
            <span key={pi} style={{ display:"inline-flex", alignItems:"baseline", verticalAlign:"middle", margin:"0 2px" }}>
              {/* 보이는 앞부분 */}
              <span style={{ background:"#dbeafe", color:"#1e40af", fontWeight:700, padding:"2px 4px", borderRadius:"4px 0 0 4px", fontSize:14, whiteSpace:"nowrap" }}>
                {part.shown}
              </span>
              {/* 입력칸 */}
              <span style={{ display:"inline-flex", flexDirection:"column", alignItems:"center" }}>
                <input
                  value={inputs[bi] || ""}
                  onChange={e => { const n=[...inputs]; n[bi]=e.target.value; setInputs(n); }}
                  disabled={checked}
                  placeholder={"_ ".repeat(part.blank.length).trim()}
                  style={{
                    width: Math.max(part.blank.length * 11, 50),
                    padding:"3px 6px",
                    border:`2px solid ${wrong?"#fca5a5":correct?"#86efac":"#93c5fd"}`,
                    borderLeft:"none",
                    borderRadius:"0 4px 4px 0",
                    fontSize:14,
                    background: wrong?"#fff5f5":correct?"#f0fdf4":"#fff",
                    outline:"none",
                  }}
                />
                {checked && (
                  <span style={{ fontSize:11, color:correct?"#15803d":"#dc2626", marginTop:2, lineHeight:1 }}>
                    {correct ? "✓" : blanks[bi].fill}
                  </span>
                )}
              </span>
            </span>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        {!checked
          ? <BTN onClick={check} disabled={inputs.some(v=>!v.trim())} style={{flex:1}}>확인</BTN>
          : <BTN onClick={()=>setCIdx(c=>c+1)} disabled={cIdx+1>=CTW_ITEMS.length} style={{flex:1}}>
              {cIdx+1<CTW_ITEMS.length ? "다음 →" : "완료 ✓"}
            </BTN>}
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════
// READING
// ══════════════════════════════════════════════
function ReadingSection() {
  const [rTask, setRTask] = useState(null);
  const [cIdx, setCIdx] = useState(0);
  const [dIdx, setDIdx] = useState(0);
  const [dSel, setDSel] = useState({});
  const [dChecked, setDChecked] = useState(false);
  const [dScore, setDScore] = useState(0);
  const [showKo, setShowKo] = useState(false);
  const [aSel, setASel] = useState({});
  const [aChecked, setAChecked] = useState(false);
  const [aScore, setAScore] = useState(0);
  const [aShowKo, setAShowKo] = useState(false);

  const TASK_TABS=[
    {id:"ctw",icon:"🔤",label:"Complete the Words",desc:"빈칸 단어 완성 (3분)"},
    {id:"daily",icon:"📋",label:"Read in Daily Life",desc:"실생활 지문 (3분)"},
    {id:"academic",icon:"🏛",label:"Academic Passage",desc:"학술 지문 (12분)"},
  ];

  if(!rTask) return <SubMenu items={TASK_TABS} onSelect={setRTask}/>;

  const checkDaily=()=>{ let s=0; DAILY_PASSAGES[dIdx].questions.forEach((q,i)=>{if(dSel[i]===q.ans)s++;}); setDScore(s); setDChecked(true); };
  const nextDaily=()=>{ const n=dIdx+1<DAILY_PASSAGES.length?dIdx+1:dIdx; setDIdx(n); setDSel({}); setDChecked(false); setDScore(0); setShowKo(false); };
  const checkAcademic=()=>{ let s=0; ACADEMIC_PASSAGE.questions.forEach((q,i)=>{if(aSel[i]===q.ans)s++;}); setAScore(s); setAChecked(true); };

  return (
    <div>
      <SubBackBtn onClick={()=>setRTask(null)}/>
      <div style={{display:"flex",gap:5,marginBottom:16,background:"#fff",padding:5,borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        {TASK_TABS.map(t=>(
          <button key={t.id} onClick={()=>setRTask(t.id)}
            style={{flex:1,padding:"8px 4px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:12,background:rTask===t.id?"#1e3a8a":"transparent",color:rTask===t.id?"#fff":"#64748b"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {rTask==="ctw"&&<CTWQuestion cIdx={cIdx} setCIdx={setCIdx} onBack={()=>setRTask(null)}/>}

      {rTask==="daily"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:13,color:"#64748b"}}>지문 {dIdx+1}/{DAILY_PASSAGES.length}</span>
            {dChecked&&<span style={{fontWeight:700,color:"#1e3a8a"}}>정답 {dScore}/{DAILY_PASSAGES[dIdx].questions.length}</span>}
          </div>
          <Card>
            <CountdownTimer totalSecs={180} onExpire={()=>{ if(!dChecked) checkDaily(); }}/>
            <div style={{background:"#f8fafc",borderLeft:"4px solid #0ea5e9",borderRadius:8,padding:14,marginBottom:8,fontSize:14,lineHeight:1.8,whiteSpace:"pre-line",color:"#334155"}}>{DAILY_PASSAGES[dIdx].text}</div>
            {dChecked && showKo && <div style={{background:"#eff6ff",borderLeft:"4px solid #6366f1",borderRadius:8,padding:14,marginBottom:8,fontSize:13,lineHeight:1.8,whiteSpace:"pre-line",color:"#4338ca"}}>{DAILY_PASSAGES[dIdx].ko}</div>}
            {dChecked && <button onClick={()=>setShowKo(s=>!s)} style={{fontSize:12,color:"#6366f1",background:"none",border:"1px solid #c7d2fe",borderRadius:6,padding:"4px 10px",cursor:"pointer",marginBottom:14}}>{showKo?"한국어 숨기기":"🇰🇷 한국어 해석 보기"}</button>}
            {DAILY_PASSAGES[dIdx].questions.map((q,qi)=>(
              <div key={qi} style={{marginBottom:16}}>
                <p style={{fontWeight:600,fontSize:14,color:"#1e293b",marginBottom:4}}>{qi+1}. {q.q}</p>
                {q.opts.map((opt,oi)=><MCOpt key={oi} label={opt} i={oi} sel={dSel[qi]} checked={dChecked} correct={q.ans} onSelect={v=>setDSel(s=>({...s,[qi]:v}))}/>)}
                {dChecked && <p style={{fontSize:12,color:"#6366f1",margin:"4px 0 0"}}>({q.ko})</p>}
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              {!dChecked?<BTN onClick={checkDaily} disabled={Object.keys(dSel).length<DAILY_PASSAGES[dIdx].questions.length} style={{flex:1}}>채점</BTN>
                :<BTN onClick={nextDaily} style={{flex:1}}>{dIdx+1<DAILY_PASSAGES.length?"다음 지문 →":"완료"}</BTN>}
            </div>
          </Card>
        </div>
      )}

      {rTask==="academic"&&(
        <div>
          {aChecked&&<div style={{background:"#1e3a8a",color:"#fff",borderRadius:10,padding:"10px 16px",marginBottom:12,textAlign:"center",fontWeight:700,fontSize:16}}>점수: {aScore}/{ACADEMIC_PASSAGE.questions.length}</div>}
          <Card>
            <CountdownTimer totalSecs={720} onExpire={()=>{ if(!aChecked) checkAcademic(); }}/>
            <div style={{background:"#f8fafc",borderLeft:"4px solid #7c3aed",borderRadius:8,padding:14,marginBottom:8,fontSize:14,lineHeight:1.8,color:"#334155"}}>{ACADEMIC_PASSAGE.text}</div>
            {aChecked && aShowKo && <div style={{background:"#eff6ff",borderLeft:"4px solid #6366f1",borderRadius:8,padding:14,marginBottom:8,fontSize:13,lineHeight:1.8,color:"#4338ca"}}>{ACADEMIC_PASSAGE.ko}</div>}
            {aChecked && <button onClick={()=>setAShowKo(s=>!s)} style={{fontSize:12,color:"#6366f1",background:"none",border:"1px solid #c7d2fe",borderRadius:6,padding:"4px 10px",cursor:"pointer",marginBottom:14}}>{aShowKo?"한국어 숨기기":"🇰🇷 한국어 해석 보기"}</button>}
            {ACADEMIC_PASSAGE.questions.map((q,qi)=>(
              <div key={qi} style={{marginBottom:16}}>
                <p style={{fontWeight:600,fontSize:14,color:"#1e293b",marginBottom:8}}>{qi+1}. {q.q}</p>
                {q.opts.map((opt,oi)=><MCOpt key={oi} label={opt} i={oi} sel={aSel[qi]} checked={aChecked} correct={q.ans} onSelect={v=>setASel(s=>({...s,[qi]:v}))}/>)}
                {aChecked && <p style={{fontSize:12,color:"#6366f1",margin:"4px 0 0"}}>({q.ko})</p>}
              </div>
            ))}
            {!aChecked?<BTN onClick={checkAcademic} disabled={Object.keys(aSel).length<ACADEMIC_PASSAGE.questions.length} style={{width:"100%"}}>채점</BTN>
              :<BTN onClick={()=>{setASel({});setAChecked(false);setAScore(0);setAShowKo(false);}} color="#059669" style={{width:"100%"}}>다시 풀기</BTN>}
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// SPEAKING — LISTEN & REPEAT
// ══════════════════════════════════════════════
function RepeatTask({ onFinish }) {
  const [rIdx, setRIdx] = useState(0);
  const [step, setStep] = useState("ready");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const recogRef = useRef(null);
  const hasSpeech = typeof window!=="undefined"&&("SpeechRecognition" in window||"webkitSpeechRecognition" in window);
  const hasTTS = typeof window!=="undefined"&&"speechSynthesis" in window;

  const playSentence = () => {
    if(!hasTTS) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(REPEAT_SENTENCES[rIdx].text);
    utt.lang="en-US"; utt.rate=0.85;
    utt.onstart=()=>setStep("playing");
    utt.onend=()=>{ setStep("recording"); startRec(); };
    utt.onerror=()=>setStep("ready");
    window.speechSynthesis.speak(utt);
  };

  const startRec = () => {
    if(!hasSpeech){ setStep("done"); return; }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const r=new SR();
    r.lang="en-US"; r.interimResults=false; r.maxAlternatives=1;
    r.onresult=e=>{ setTranscript(e.results[0][0].transcript); };
    r.onend=()=>setStep("done");
    r.onerror=()=>setStep("done");
    recogRef.current=r;
    try{ r.start(); }catch(e){ setStep("done"); }
  };

  const stopRec=()=>{ try{recogRef.current?.stop();}catch{} };

  const grade=async()=>{
    if(!transcript||loading) return;
    setLoading(true);
    const res=await callClaude(
      `Original: "${REPEAT_SENTENCES[rIdx].text}"\nStudent: "${transcript}"\nReply ONLY in JSON no markdown: {"score":4,"feedback":"Korean 1-2 sentences","missing":"wrong or missing words or empty string"}`,
      "You are a TOEFL Speaking evaluator. Score 0-5."
    );
    try{ setResult(JSON.parse(res.replace(/```json|```/g,"").trim())); }
    catch{ setResult({score:0,feedback:"채점 오류",missing:""}); }
    setLoading(false);
  };

  const next=()=>{
    window.speechSynthesis?.cancel();
    stopRec();
    setStep("ready"); setTranscript(""); setResult(null);
    if(rIdx+1<REPEAT_SENTENCES.length) setRIdx(i=>i+1);
    else onFinish();
  };

  const sent=REPEAT_SENTENCES[rIdx];
  return (
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#64748b",marginBottom:10}}>
        <span>문장 {rIdx+1}/{REPEAT_SENTENCES.length}</span>
        <span style={{background:"#dbeafe",color:"#1e3a8a",borderRadius:12,padding:"2px 8px",fontSize:12,fontWeight:600}}>Level {sent.level}</span>
      </div>
      <div style={{background:"#e2e8f0",borderRadius:6,height:4,marginBottom:18}}><div style={{background:"#1e3a8a",height:4,borderRadius:6,width:`${(rIdx/REPEAT_SENTENCES.length)*100}%`,transition:"width 0.3s"}}/></div>

      <div style={{background:"#1e3a8a",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:16}}>
        {step==="ready"&&<><p style={{fontSize:14,color:"#93c5fd",margin:"0 0 8px"}}>🔊 아래 버튼을 눌러 문장을 들으세요</p><p style={{fontSize:28,margin:0}}>🎧</p></>}
        {step==="playing"&&<><p style={{fontSize:14,color:"#93c5fd",margin:"0 0 8px"}}>🔊 듣는 중...</p><p style={{fontSize:16,fontWeight:600,color:"#fff",margin:0,lineHeight:1.6}}>{sent.text}</p></>}
        {step==="recording"&&<><p style={{fontSize:14,color:"#fca5a5",margin:"0 0 6px"}}>🔴 따라 말하세요</p><p style={{fontSize:16,fontWeight:600,color:"#fff",margin:"0 0 8px",lineHeight:1.6}}>{sent.text}</p><p style={{fontSize:12,color:"#bfdbfe",margin:0}}>말을 멈추면 자동 완료</p></>}
        {step==="done"&&<><p style={{fontSize:14,color:"#86efac",margin:"0 0 8px"}}>✅ 녹음 완료</p><p style={{fontSize:16,fontWeight:600,color:"#fff",margin:0,lineHeight:1.6}}>{sent.text}</p></>}
      </div>

      {transcript&&<div style={{background:"#f8fafc",borderRadius:8,padding:10,marginBottom:12,fontSize:14,color:"#334155"}}><b>내 답변:</b> {transcript||"(인식된 음성 없음)"}</div>}

      {result&&(
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <div style={{flex:1,background:"#f8fafc",borderRadius:10,padding:"12px 8px",textAlign:"center",border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:22,fontWeight:700,color:result.score>=4?"#15803d":result.score>=2?"#d97706":"#dc2626"}}>{result.score}/5</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:2}}>정확도</div>
          </div>
          <div style={{flex:3,background:"#f8fafc",borderRadius:10,padding:"10px 14px",border:"1px solid #e2e8f0",fontSize:14,color:"#334155"}}>
            {result.feedback}
            {result.missing&&<p style={{margin:"4px 0 0",color:"#dc2626",fontSize:13}}>빠진/틀린: <b>{result.missing}</b></p>}
          </div>
        </div>
      )}

      {!hasSpeech&&<p style={{fontSize:13,color:"#dc2626",marginBottom:10}}>⚠️ Chrome 또는 Edge에서 사용해주세요.</p>}
      {step==="ready"&&<BTN onClick={playSentence} style={{width:"100%"}}>🔊 문장 듣기</BTN>}
      {step==="playing"&&<BTN color="#64748b" style={{width:"100%"}} disabled>재생 중...</BTN>}
      {step==="recording"&&<BTN onClick={stopRec} color="#dc2626" style={{width:"100%"}}>⏹ 녹음 중지</BTN>}
      {step==="done"&&!result&&(
        <div style={{display:"flex",gap:8}}>
          <BTN onClick={()=>{setStep("ready");setTranscript("");}} color="#64748b" style={{flex:1}}>다시 듣기</BTN>
          <BTN onClick={grade} disabled={loading} style={{flex:2}}>{loading?"채점 중...":"AI 채점"}</BTN>
        </div>
      )}
      {result&&<BTN onClick={next} style={{width:"100%"}}>{rIdx+1>=REPEAT_SENTENCES.length?"인터뷰로 이동 →":"다음 문장 →"}</BTN>}
    </Card>
  );
}

// ══════════════════════════════════════════════
// SPEAKING — INTERVIEW
// ══════════════════════════════════════════════
function InterviewTask() {
  const [topicIdx, setTopicIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [step, setStep] = useState("ready"); // ready | recording | done
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const recogRef = useRef(null);
  const hasSpeech = typeof window!=="undefined"&&("SpeechRecognition" in window||"webkitSpeechRecognition" in window);

  const topic = INTERVIEW_TOPICS[topicIdx];
  const q = topic.questions[qIdx];

  const startRec=()=>{
    if(!hasSpeech) return;
    setTranscript(""); setResult(null); setExpired(false);
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const r=new SR();
    r.lang="en-US"; r.interimResults=false; r.maxAlternatives=1;
    r.onresult=e=>setTranscript(e.results[0][0].transcript);
    r.onend=()=>setStep("done");
    r.onerror=()=>setStep("done");
    recogRef.current=r;
    setStep("recording");
    try{ r.start(); }catch(e){ setStep("done"); }
  };

  const stopRec=()=>{ try{recogRef.current?.stop();}catch{} };

  const grade=async()=>{
    if(loading) return;
    setLoading(true);
    const res=await callClaude(
      `Topic theme: "${topic.theme}"\nQuestion: "${q}"\nStudent response: "${transcript||"(no response)"}"\nEvaluate TOEFL Speaking. Reply ONLY in JSON no markdown: {"fluency":3,"language":3,"content":3,"total":9,"feedback":"Korean 2-3 sentences","improved":"one improved English example sentence"}`,
      "You are a TOEFL Speaking evaluator. Each dimension 0-4, total 0-12."
    );
    try{ setResult(JSON.parse(res.replace(/```json|```/g,"").trim())); }
    catch{ setResult({fluency:0,language:0,content:0,total:0,feedback:"채점 오류",improved:""}); }
    setLoading(false);
  };

  const next=()=>{
    stopRec();
    setStep("ready"); setTranscript(""); setResult(null); setExpired(false);
    if(qIdx+1<topic.questions.length) setQIdx(i=>i+1);
    else { setQIdx(0); setTopicIdx(i=>(i+1)%INTERVIEW_TOPICS.length); }
  };

  return (
    <div>
      {/* Topic selector */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {INTERVIEW_TOPICS.map((t,i)=>(
          <button key={i} onClick={()=>{setTopicIdx(i);setQIdx(0);setStep("ready");setTranscript("");setResult(null);setExpired(false);}}
            style={{flex:1,padding:"8px",border:`2px solid ${topicIdx===i?"#1e3a8a":"#e2e8f0"}`,borderRadius:10,background:topicIdx===i?"#1e3a8a":"#fff",color:topicIdx===i?"#fff":"#64748b",fontWeight:600,fontSize:13,cursor:"pointer"}}>
            {t.theme}
          </button>
        ))}
      </div>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#64748b",marginBottom:12}}>
          <span>Q{qIdx+1} / {topic.questions.length}</span>
          <span style={{background:"#eff6ff",color:"#1e3a8a",borderRadius:12,padding:"2px 8px",fontSize:12,fontWeight:600}}>📋 {topic.theme}</span>
        </div>

        {/* Question */}
        <div style={{background:"#eff6ff",borderLeft:"4px solid #1e3a8a",borderRadius:10,padding:16,marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:600,color:"#1e3a8a",margin:"0 0 4px"}}>💬 Question {qIdx+1}</p>
          <p style={{fontSize:16,color:"#1e293b",margin:0,lineHeight:1.6,fontWeight:500}}>{q}</p>
        </div>

        {/* Countdown — only when recording */}
        {step==="recording"&&!expired&&(
          <CountdownTimer totalSecs={45} onExpire={()=>{setExpired(true);stopRec();}}/>
        )}

        {/* Mic state */}
        <div style={{textAlign:"center",marginBottom:16}}>
          {step==="ready"&&(
            <button onClick={startRec} style={{width:72,height:72,borderRadius:"50%",border:"none",cursor:"pointer",background:"#1e3a8a",color:"#fff",fontSize:30,boxShadow:"0 4px 12px rgba(30,58,138,0.3)"}}>🎤</button>
          )}
          {step==="recording"&&(
            <button onClick={stopRec} style={{width:72,height:72,borderRadius:"50%",border:"none",cursor:"pointer",background:"#dc2626",color:"#fff",fontSize:30,boxShadow:"0 0 0 10px rgba(220,38,38,0.2)"}}>⏹</button>
          )}
          {step==="done"&&(
            <div style={{width:72,height:72,borderRadius:"50%",background:"#f0fdf4",border:"2px solid #86efac",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:30}}>✅</div>
          )}
          <p style={{fontSize:13,color:"#64748b",marginTop:8}}>
            {step==="ready"?"버튼을 눌러 녹음 시작 (45초)":step==="recording"?"🔴 녹음 중... (말을 멈추면 자동 완료)":"녹음 완료"}
          </p>
        </div>

        {!hasSpeech&&<p style={{fontSize:13,color:"#dc2626",marginBottom:10,textAlign:"center"}}>⚠️ Chrome 또는 Edge에서 사용해주세요.</p>}

        {transcript&&<div style={{background:"#f8fafc",borderRadius:8,padding:10,marginBottom:12,fontSize:14,color:"#334155"}}><b>내 답변:</b> {transcript}</div>}

        {result&&(
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {[["유창성",result.fluency,4],["언어",result.language,4],["내용",result.content,4]].map(([l,v,m])=>(
                <div key={l} style={{flex:1,background:"#f8fafc",borderRadius:10,padding:"10px 8px",textAlign:"center",border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:20,fontWeight:700,color:v>=m*0.75?"#15803d":v>=m*0.5?"#d97706":"#dc2626"}}>{v}/{m}</div>
                  <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{l}</div>
                </div>
              ))}
              <div style={{flex:1,background:"#1e3a8a",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>{result.total}/12</div>
                <div style={{fontSize:12,color:"#bfdbfe",marginTop:2}}>총점</div>
              </div>
            </div>
            <div style={{fontSize:14,color:"#334155",lineHeight:1.7,marginBottom:8}}>{result.feedback}</div>
            {result.improved&&<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:10,fontSize:13,color:"#14532d"}}><b>개선 예시:</b> {result.improved}</div>}
          </div>
        )}

        <div style={{display:"flex",gap:8}}>
          {step==="done"&&!result&&(
            <><BTN onClick={()=>{setStep("ready");setTranscript("");}} color="#64748b" style={{flex:1}}>다시 녹음</BTN>
            <BTN onClick={grade} disabled={loading} style={{flex:2}}>{loading?"채점 중...":"🤖 AI 채점"}</BTN></>
          )}
          {result&&<BTN onClick={next} style={{width:"100%"}}>다음 문제 →</BTN>}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════
// SPEAKING SECTION
// ══════════════════════════════════════════════
function SpeakingSection() {
  const [sTask, setSTask] = useState(null);
  const SPK_MENUS=[
    {id:"repeat",icon:"🔁",label:"Listen & Repeat",desc:"7문장 따라 말하기"},
    {id:"interview",icon:"🎤",label:"Take an Interview",desc:"주제별 4문항 인터뷰"},
  ];
  if(!sTask) return <SubMenu items={SPK_MENUS} onSelect={setSTask}/>;
  return (
    <div>
      <SubBackBtn onClick={()=>setSTask(null)}/>
      <div style={{display:"flex",gap:6,marginBottom:16,background:"#fff",padding:5,borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        {SPK_MENUS.map(m=>(
          <button key={m.id} onClick={()=>setSTask(m.id)}
            style={{flex:1,padding:"9px 4px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,background:sTask===m.id?"#1e3a8a":"transparent",color:sTask===m.id?"#fff":"#64748b"}}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      {sTask==="repeat"&&<RepeatTask onFinish={()=>setSTask("interview")}/>}
      {sTask==="interview"&&<InterviewTask/>}
    </div>
  );
}

// ══════════════════════════════════════════════
// WRITING
// ══════════════════════════════════════════════
function WritingSection() {
  const [wTask, setWTask] = useState(null);
  const [bIdx, setBIdx] = useState(0);
  const [bSel, setBSel] = useState([]);
  const [bBank, setBBank] = useState(()=>shuffleArr([...BUILD_SENTENCES[0].words]));
  const [bChecked, setBChecked] = useState(false);
  const [bScore, setBScore] = useState(0);
  const [eIdx, setEIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [eFb, setEFb] = useState("");
  const [eLoad, setELoad] = useState(false);
  const [dIdx, setDIdx] = useState(0);
  const [disc, setDisc] = useState("");
  const [dFb, setDFb] = useState("");
  const [dLoad, setDLoad] = useState(false);

  const WRT_MENUS=[
    {id:"build",icon:"🔀",label:"Build a Sentence",desc:"단어 배열로 문장 완성 (6분 30초)"},
    {id:"email",icon:"📧",label:"Write an Email",desc:"상황별 이메일 작성 (7분)"},
    {id:"discussion",icon:"💬",label:"Academic Discussion",desc:"교수 질문 토론 답변 (10분)"},
  ];

  const initBuild=idx=>{setBBank(shuffleArr([...BUILD_SENTENCES[idx].words]));setBSel([]);setBChecked(false);};
  const handleWord=(w,from)=>{
    if(bChecked)return;
    if(from==="bank"){setBSel(p=>[...p,w]);setBBank(p=>{const i=p.indexOf(w);return[...p.slice(0,i),...p.slice(i+1)];});}
    else{setBBank(p=>[...p,w]);setBSel(p=>{const i=p.indexOf(w);return[...p.slice(0,i),...p.slice(i+1)];});}
  };
  const checkBuild=()=>{
    const ans=bSel.join(" ").toLowerCase().replace(/[^a-z\s']/g,"").trim();
    const correct=BUILD_SENTENCES[bIdx].answer.toLowerCase().trim();
    if(ans===correct)setBScore(s=>s+1);
    setBChecked(ans===correct?"correct":"wrong");
  };

  const gradeFb=async(prompt)=>await callClaude(
    `You are a TOEFL Writing evaluator. Evaluate in Korean.\n${prompt}\nProvide:\n1. **총평** (1-2 sentences)\n2. **내용 완성도** (2-3 bullet points)\n3. **언어 & 문법** (2-3 bullet points)\n4. **개선 제안** (1-2 tips)\n5. **예상 점수**: X/5`
  );

  const handleEmailFb=async()=>{
    if(!email.trim()||eLoad)return;
    setELoad(true);setEFb("");
    const r=await gradeFb(`SCENARIO: "${EMAIL_SCENARIOS[eIdx].scenario}"\nREQUIREMENTS: ${EMAIL_SCENARIOS[eIdx].req.join(", ")}\nSTUDENT EMAIL: "${email}"`);
    setEFb(r);setELoad(false);
  };

  const handleDiscFb=async()=>{
    if(!disc.trim()||dLoad)return;
    setDLoad(true);setDFb("");
    const d=DISC_PROMPTS[dIdx];
    const r=await gradeFb(`PROFESSOR: "${d.prof}"\n${d.students[0].name}: "${d.students[0].text}"\n${d.students[1].name}: "${d.students[1].text}"\nSTUDENT RESPONSE: "${disc}"`);
    setDFb(r);setDLoad(false);
  };

  if(!wTask) return <SubMenu items={WRT_MENUS} onSelect={setWTask}/>;

  return (
    <div>
      <SubBackBtn onClick={()=>setWTask(null)}/>
      <div style={{display:"flex",gap:5,marginBottom:16,background:"#fff",padding:5,borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        {WRT_MENUS.map(t=>(
          <button key={t.id} onClick={()=>setWTask(t.id)}
            style={{flex:1,padding:"8px 4px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:12,background:wTask===t.id?"#1e3a8a":"transparent",color:wTask===t.id?"#fff":"#64748b",lineHeight:1.4}}>
            {t.icon}<br/>{t.label}
          </button>
        ))}
      </div>

      {wTask==="build"&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#64748b",marginBottom:8}}>
            <span>문항 {bIdx+1}/{BUILD_SENTENCES.length}</span>
            <span>정답 {bScore}/{BUILD_SENTENCES.length}</span>
          </div>
          <CountdownTimer totalSecs={390} onExpire={()=>{if(!bChecked)checkBuild();}}/>
          <div style={{background:"#eff6ff",borderLeft:"4px solid #1e3a8a",borderRadius:8,padding:10,marginBottom:14,fontSize:14,color:"#1e3a8a",fontWeight:600}}>{BUILD_SENTENCES[bIdx].prompt}</div>
          <p style={{fontSize:13,color:"#64748b",marginBottom:8}}>단어를 클릭해 문장을 완성하세요 (여분 단어 포함)</p>
          <div style={{minHeight:48,background:"#f8fafc",border:`2px solid ${bChecked?(bChecked==="correct"?"#86efac":"#fca5a5"):"#e2e8f0"}`,borderRadius:10,padding:"10px 12px",marginBottom:10,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
            {bSel.length===0&&<span style={{color:"#94a3b8",fontSize:13}}>여기에 단어를 배치하세요...</span>}
            {bSel.map((w,i)=><span key={i} onClick={()=>handleWord(w,"answer")} style={{background:"#1e3a8a",color:"#fff",borderRadius:6,padding:"4px 10px",fontSize:14,cursor:bChecked?"default":"pointer"}}>{w}</span>)}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,minHeight:36,marginBottom:14}}>
            {bBank.map((w,i)=><span key={i} onClick={()=>handleWord(w,"bank")} style={{background:"#f1f5f9",border:"1px solid #cbd5e1",borderRadius:6,padding:"4px 10px",fontSize:14,cursor:bChecked?"default":"pointer",color:"#334155"}}>{w}</span>)}
          </div>
          {bChecked&&<div style={{background:bChecked==="correct"?"#f0fdf4":"#fff5f5",border:`1px solid ${bChecked==="correct"?"#86efac":"#fca5a5"}`,borderRadius:8,padding:10,marginBottom:12,fontSize:13}}><b style={{color:bChecked==="correct"?"#15803d":"#dc2626"}}>{bChecked==="correct"?"✅ 정답!":"❌ 오답"}</b>{bChecked!=="correct"&&<p style={{margin:"4px 0 0",color:"#475569"}}>정답: <b>{BUILD_SENTENCES[bIdx].answer}</b></p>}</div>}
          <div style={{display:"flex",gap:8}}>
            {!bChecked?<><BTN onClick={()=>initBuild(bIdx)} color="#64748b" style={{flex:1}}>초기화</BTN><BTN onClick={checkBuild} disabled={!bSel.length} style={{flex:2}}>확인</BTN></>
              :bIdx+1<BUILD_SENTENCES.length?<BTN onClick={()=>{setBIdx(i=>i+1);initBuild(bIdx+1);}} style={{flex:1}}>다음 →</BTN>
              :<div style={{flex:1,textAlign:"center",padding:12,background:"#f0fdf4",borderRadius:8,fontWeight:700,color:"#15803d"}}>🎉 완료! {bScore}/{BUILD_SENTENCES.length}</div>}
          </div>
        </Card>
      )}

      {wTask==="email"&&(
        <div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:13,color:"#64748b"}}>시나리오 {eIdx+1}/{EMAIL_SCENARIOS.length}</span>
              <div style={{display:"flex",gap:6}}>{EMAIL_SCENARIOS.map((_,i)=><div key={i} onClick={()=>{setEIdx(i);setEmail("");setEFb("");}} style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i===eIdx?"#1e3a8a":"#e2e8f0",color:i===eIdx?"#fff":"#64748b",fontSize:12,fontWeight:700,cursor:"pointer"}}>{i+1}</div>)}</div>
            </div>
            <CountdownTimer totalSecs={420} onExpire={()=>{if(!eFb&&email.trim())handleEmailFb();}}/>
            <div style={{background:"#eff6ff",borderLeft:"4px solid #1e3a8a",borderRadius:10,padding:14,marginBottom:12}}>
              <p style={{fontSize:13,fontWeight:600,color:"#1e3a8a",margin:"0 0 6px"}}>📧 시나리오</p>
              <p style={{fontSize:14,color:"#334155",margin:"0 0 10px",lineHeight:1.6}}>{EMAIL_SCENARIOS[eIdx].scenario}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{EMAIL_SCENARIOS[eIdx].req.map((r,i)=><span key={i} style={{background:"#dbeafe",color:"#1d4ed8",borderRadius:6,padding:"3px 8px",fontSize:12}}>✓ {r}</span>)}</div>
            </div>
            <textarea value={email} onChange={e=>setEmail(e.target.value)} placeholder={"Dear Professor [Name],\n\n...\n\nBest regards,\n[Your name]"}
              style={{width:"100%",minHeight:160,padding:12,border:"2px solid #e2e8f0",borderRadius:10,fontSize:14,lineHeight:1.7,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
              <span style={{fontSize:13,color:wc(email)>=80&&wc(email)<=120?"#16a34a":wc(email)>120?"#d97706":"#94a3b8"}}>단어 수: {wc(email)} / 80–120</span>
              <BTN onClick={handleEmailFb} disabled={eLoad||email.trim().length<30}>{eLoad?"채점 중...":"🤖 AI 첨삭"}</BTN>
            </div>
          </Card>
          {eLoad&&<Card><p style={{textAlign:"center",color:"#64748b"}}>⏳ 분석 중...</p></Card>}
          {eFb&&!eLoad&&<Card><h3 style={{color:"#1e3a8a",marginTop:0}}>📧 AI 첨삭 결과</h3><FeedbackBlock text={eFb}/></Card>}
        </div>
      )}

      {wTask==="discussion"&&(
        <div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:13,color:"#64748b"}}>토론 {dIdx+1}/{DISC_PROMPTS.length}</span>
              <div style={{display:"flex",gap:6}}>{DISC_PROMPTS.map((_,i)=><div key={i} onClick={()=>{setDIdx(i);setDisc("");setDFb("");}} style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i===dIdx?"#1e3a8a":"#e2e8f0",color:i===dIdx?"#fff":"#64748b",fontSize:12,fontWeight:700,cursor:"pointer"}}>{i+1}</div>)}</div>
            </div>
            <CountdownTimer totalSecs={600} onExpire={()=>{if(!dFb&&disc.trim())handleDiscFb();}}/>
            <div style={{background:"#f8fafc",borderLeft:"4px solid #7c3aed",borderRadius:8,padding:12,marginBottom:8}}>
              <p style={{fontSize:12,fontWeight:600,color:"#7c3aed",margin:"0 0 4px"}}>👨‍🏫 Professor</p>
              <p style={{fontSize:14,color:"#334155",margin:0,lineHeight:1.6}}>{DISC_PROMPTS[dIdx].prof}</p>
            </div>
            {DISC_PROMPTS[dIdx].students.map((s,i)=>(
              <div key={i} style={{background:"#f8fafc",borderLeft:"4px solid #0ea5e9",borderRadius:8,padding:12,marginBottom:8}}>
                <p style={{fontSize:12,fontWeight:600,color:"#0369a1",margin:"0 0 4px"}}>🎓 {s.name}</p>
                <p style={{fontSize:14,color:"#334155",margin:0,lineHeight:1.6}}>{s.text}</p>
              </div>
            ))}
            <div style={{background:"#fefce8",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#713f12"}}>
              💡 입장을 명확히 하고, {DISC_PROMPTS[dIdx].students[0].name} 또는 {DISC_PROMPTS[dIdx].students[1].name}를 언급하세요 (100–150 words)
            </div>
            <textarea value={disc} onChange={e=>setDisc(e.target.value)} placeholder="Write your response here..."
              style={{width:"100%",minHeight:130,padding:12,border:"2px solid #e2e8f0",borderRadius:10,fontSize:14,lineHeight:1.7,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
              <span style={{fontSize:13,color:wc(disc)>=100?"#16a34a":"#94a3b8"}}>단어 수: {wc(disc)} / 100+</span>
              <BTN onClick={handleDiscFb} disabled={dLoad||disc.trim().length<30}>{dLoad?"채점 중...":"🤖 AI 첨삭"}</BTN>
            </div>
          </Card>
          {dLoad&&<Card><p style={{textAlign:"center",color:"#64748b"}}>⏳ 분석 중...</p></Card>}
          {dFb&&!dLoad&&<Card><h3 style={{color:"#1e3a8a",marginTop:0}}>💬 AI 첨삭 결과</h3><FeedbackBlock text={dFb}/></Card>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════
const MAIN_MENU=[
  {id:"vocab",icon:"📚",label:"단어 암기",desc:"TOEFL 고빈출 단어 학습"},
  {id:"reading",icon:"📖",label:"Reading",desc:"Complete Words · Daily Life · Academic"},
  {id:"speaking",icon:"🎙",label:"Speaking",desc:"Listen & Repeat · Interview"},
  {id:"writing",icon:"✍️",label:"Writing",desc:"Build · Email · Discussion"},
];

export default function App() {
  const [tab, setTab] = useState(null);
  return (
    <div style={{fontFamily:"'Segoe UI', sans-serif",background:"#f0f4ff",minHeight:"100vh",padding:"20px"}}>
      <div style={{maxWidth:740,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{flex:1}}/>
          <div style={{textAlign:"center",flex:4}}>
            <h1 style={{fontSize:22,fontWeight:700,color:"#1e3a8a",margin:0}}>🎓 TOEFL 2026 학습 도구</h1>
            <p style={{color:"#64748b",fontSize:12,margin:"4px 0 0"}}>2026 개정 포맷 기준</p>
          </div>
          <div style={{flex:1,display:"flex",justifyContent:"flex-end"}}>
            {tab&&<button onClick={()=>setTab(null)} style={{width:36,height:36,borderRadius:"50%",border:"none",background:"#e2e8f0",color:"#64748b",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>}
          </div>
        </div>

        {!tab&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {MAIN_MENU.map(item=>(
              <button key={item.id} onClick={()=>setTab(item.id)}
                style={{background:"#fff",border:"2px solid #e2e8f0",borderRadius:16,padding:"28px 20px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:32,marginBottom:10}}>{item.icon}</div>
                <div style={{fontWeight:700,fontSize:16,color:"#1e3a8a",marginBottom:6}}>{item.label}</div>
                <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{item.desc}</div>
              </button>
            ))}
          </div>
        )}

        {tab&&(
          <div>
            <button onClick={()=>setTab(null)} style={{border:"none",background:"transparent",color:"#64748b",fontWeight:600,fontSize:14,cursor:"pointer",padding:"4px 0",marginBottom:12,display:"block"}}>← 메인으로</button>
            {tab==="vocab"&&<VocabSection/>}
            {tab==="reading"&&<ReadingSection/>}
            {tab==="speaking"&&<SpeakingSection/>}
            {tab==="writing"&&<WritingSection/>}
          </div>
        )}
      </div>
    </div>
  );
}
