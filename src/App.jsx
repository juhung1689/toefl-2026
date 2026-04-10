import { useState, useRef, useEffect } from "react";

// ── API ──
async function callClaude(prompt, sys = "") {
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] };
  if (sys) body.system = sys;
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

// ── TIMER HOOK ──
function useTimer() {
  const [secs, setSecs] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    setSecs(0);
    ref.current = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, []);
  const reset = useRef(() => setSecs(0));
  const fmt = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  return { secs, fmt, resetFn: () => setSecs(0) };
}

// ── SHARED UI ──
const BTN = ({ onClick, disabled, color = "#1e3a8a", children, style = {} }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ border: "none", borderRadius: 8, padding: "11px 18px", fontWeight: 700, fontSize: 14,
      cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "#e2e8f0" : color,
      color: disabled ? "#94a3b8" : "#fff", ...style }}>
    {children}
  </button>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 14, ...style }}>
    {children}
  </div>
);

const TimerBadge = ({ secs, label = "" }) => {
  const fmt = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const color = secs < 60 ? "#15803d" : secs < 180 ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f8fafc",
      border: `1.5px solid ${color}`, borderRadius: 20, padding: "3px 10px", fontSize: 13, fontWeight: 700, color }}>
      ⏱ {fmt}{label && <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 11, marginLeft: 2 }}>{label}</span>}
    </div>
  );
};

const SubBackBtn = ({ onClick }) => (
  <button onClick={onClick}
    style={{ border: "none", background: "transparent", color: "#64748b", fontWeight: 600,
      fontSize: 14, cursor: "pointer", padding: "4px 0", marginBottom: 12, display: "block" }}>
    ← 이전으로
  </button>
);

const FeedbackBlock = ({ text }) => (
  <div style={{ fontSize: 14, lineHeight: 1.8, color: "#334155" }}>
    {text.split('\n').map((line, i) => {
      const clean = line.replace(/\*\*/g, '');
      if (line.startsWith('**') && line.endsWith('**'))
        return <p key={i} style={{ fontWeight: 700, color: "#1e3a8a", margin: "10px 0 3px" }}>{clean}</p>;
      return <p key={i} style={{ margin: "2px 0" }}>{line}</p>;
    })}
  </div>
);

const SubMenu = ({ items, onSelect }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
    {items.map(item => (
      <button key={item.id} onClick={() => onSelect(item.id)}
        style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: "22px 16px",
          cursor: "pointer", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a8a", marginBottom: 4 }}>{item.label}</div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.desc}</div>
      </button>
    ))}
  </div>
);

// ── DATA ──
const VOCAB = [
  { word: "Ambiguous", def: "Having more than one possible meaning; unclear", ex: "The results were ambiguous and required further analysis." },
  { word: "Coherent", def: "Logical and consistent; forming a unified whole", ex: "She gave a coherent explanation of the complex theory." },
  { word: "Prevalent", def: "Widespread; existing or occurring frequently", ex: "Obesity is prevalent in many developed countries." },
  { word: "Mitigate", def: "To make less severe or intense; to lessen", ex: "Planting trees can help mitigate the effects of climate change." },
  { word: "Empirical", def: "Based on observation or experience rather than theory", ex: "The scientists sought empirical evidence to support their hypothesis." },
  { word: "Paradigm", def: "A typical example or pattern; a framework of thought", ex: "The discovery led to a paradigm shift in physics." },
  { word: "Transient", def: "Lasting only a short time; temporary", ex: "The pain was transient and disappeared within minutes." },
  { word: "Augment", def: "To make larger; to increase or supplement", ex: "She augmented her income by taking freelance projects." },
  { word: "Scrutinize", def: "To examine carefully and critically", ex: "The committee will scrutinize all submitted proposals." },
  { word: "Inherent", def: "Existing as a natural or basic part of something", ex: "There are inherent risks in every business venture." },
];

const CTW_ITEMS = [
  {
    passage: [
      { text: "Many " }, { blank: true, hint: "uni___sity", fill: "university" },
      { text: " students struggle to balance their " }, { blank: true, hint: "acad___ic", fill: "academic" },
      { text: " workload with part-time jobs. The " }, { blank: true, hint: "dem___d", fill: "demand" },
      { text: " for higher " }, { blank: true, hint: "edu___tion", fill: "education" },
      { text: " has led many " }, { blank: true, hint: "inst___utions", fill: "institutions" },
      { text: " to offer flexible online courses to help students manage their time more effectively." }
    ]
  },
  {
    passage: [
      { text: "Scientists have long " }, { blank: true, hint: "obs___ved", fill: "observed" },
      { text: " that the Earth's " }, { blank: true, hint: "atm___phere", fill: "atmosphere" },
      { text: " is gradually warming. This " }, { blank: true, hint: "phen___enon", fill: "phenomenon" },
      { text: ", known as climate change, is " }, { blank: true, hint: "pri___rily", fill: "primarily" },
      { text: " caused by the burning of " }, { blank: true, hint: "fos___l", fill: "fossil" },
      { text: " fuels, which releases large amounts of carbon dioxide into the air." }
    ]
  },
  {
    passage: [
      { text: "Urban " }, { blank: true, hint: "dev___opment", fill: "development" },
      { text: " has brought significant " }, { blank: true, hint: "econ___ic", fill: "economic" },
      { text: " benefits to many cities. However, rapid " }, { blank: true, hint: "pop___ation", fill: "population" },
      { text: " growth has also created " }, { blank: true, hint: "env___onmental", fill: "environmental" },
      { text: " challenges, including " }, { blank: true, hint: "poll___ion", fill: "pollution" },
      { text: " and a shortage of affordable housing for low-income residents." }
    ]
  },
];

const DAILY_PASSAGES = [
  { text: "To: All Students\nFrom: Library Services\nSubject: Extended Hours During Finals Week\n\nThe main library will be open 24 hours a day from December 10–17. Additional study rooms can be booked through the online portal (max 3 hours per booking). Students must show a valid ID at the entrance after midnight. Food and drinks with lids are permitted in designated areas only. For technical support, visit the IT Help Desk on Floor 2.",
    questions: [
      { q: "What must students bring to enter after midnight?", opts: ["A library card","A valid ID","A booking confirmation","A student receipt"], ans: 1 },
      { q: "Where can students go for technical help?", opts: ["Floor 1","The front desk","The IT Help Desk on Floor 2","The online portal"], ans: 2 },
      { q: "How long can a study room be booked?", opts: ["1 hour","2 hours","3 hours maximum","Unlimited time"], ans: 2 },
    ]
  },
  { text: "Notice from Housing Services\n\nAll residents must complete their room inspection form by Friday, November 8. Please report any maintenance issues using the online portal at housing.edu/report. Failure to submit the form may result in residents being held responsible for pre-existing damage. If you need assistance, visit the Housing Office (Building C, Room 104) during office hours: Mon–Fri, 9 AM–5 PM.",
    questions: [
      { q: "What is the deadline for submitting the inspection form?", opts: ["November 4","November 8","November 12","November 15"], ans: 1 },
      { q: "What could happen if a resident doesn't submit the form?", opts: ["They lose their housing","They are fined immediately","They may be blamed for pre-existing damage","Their room gets inspected twice"], ans: 2 },
      { q: "Where is the Housing Office located?", opts: ["Building A, Room 104","Building B, Room 204","Building C, Room 104","Building D, Room 404"], ans: 2 },
    ]
  },
];

const ACADEMIC_PASSAGE = {
  text: "Urban green spaces — parks, gardens, and tree-lined streets — have long been considered aesthetic additions to city planning. However, recent research reveals their role extends far beyond beauty. Studies conducted in cities across Europe and North America demonstrate that residents living within 300 meters of green space report significantly lower stress levels and better mental health outcomes than those without such access. The mechanism appears to involve both direct exposure to nature, which reduces cortisol levels, and indirect benefits such as increased opportunities for physical activity and social interaction. Critics argue that urban greening initiatives often prioritize wealthy neighborhoods, raising concerns about environmental inequality. Nonetheless, the evidence that green spaces serve as critical public health infrastructure continues to mount, prompting city planners to integrate them more deliberately into development projects.",
  questions: [
    { q: "What is the main argument of the passage?", opts: ["Green spaces are only useful for exercise","Green spaces are primarily an aesthetic feature","Green spaces provide significant health benefits beyond appearance","Green spaces cause environmental inequality"], ans: 2 },
    { q: "How does green space reduce stress according to the passage?", opts: ["By providing places to work outdoors","By lowering cortisol and enabling physical activity and social interaction","By replacing noisy streets with trees","By encouraging residents to move to suburbs"], ans: 1 },
    { q: "What concern do critics raise?", opts: ["It is too expensive","It reduces parking","It often benefits wealthier neighborhoods more","It harms local wildlife"], ans: 2 },
    { q: "The word 'mount' in the final sentence most likely means:", opts: ["climb physically","increase or grow","attach to a wall","decrease steadily"], ans: 1 },
    { q: "What can be inferred about city planners' future approach?", opts: ["They will stop building parks","They will only build in wealthy areas","They will more intentionally include green spaces in development","They will replace parks with community centers"], ans: 2 },
  ]
};

const REPEAT_SENTENCES = [
  { text: "Welcome to the campus library.", level: 1 },
  { text: "Please return your books before the due date.", level: 1 },
  { text: "The science building is located next to the main hall.", level: 2 },
  { text: "Students must register for classes by the end of the week.", level: 2 },
  { text: "The professor asked everyone to submit their assignments online.", level: 3 },
  { text: "All research papers should include at least five peer-reviewed sources.", level: 3 },
  { text: "The university's financial aid office provides support for students with demonstrated need.", level: 4 },
];

const INTERVIEW_QS = [
  { q: "Do you prefer studying in the morning or at night? Why?", type: "personal" },
  { q: "Describe a teacher who had a positive impact on you.", type: "personal" },
  { q: "Do you think gap years before university are a good idea? Why or why not?", type: "opinion" },
  { q: "Some people say technology makes students less focused. Do you agree?", type: "opinion" },
];

const BUILD_SENTENCES = [
  { prompt: "Response to: 'What did she ask you about?'", words: ["she","wanted","to","know","which","colleges","I'm","considering","already"], answer: "she wanted to know which colleges I'm considering", extra: "already" },
  { prompt: "Response to: 'Why was the student late?'", words: ["the","bus","arrived","later","than","usual","very"], answer: "the bus arrived later than usual", extra: "very" },
  { prompt: "Response to: 'What does the professor recommend?'", words: ["students","should","review","their","notes","before","each","lecture","always"], answer: "students should review their notes before each lecture", extra: "always" },
];

const EMAIL_SCENARIOS = [
  { scenario: "Your professor moved the midterm exam to next Friday, but you have a job interview you scheduled months ago. Write a professional email requesting an alternative arrangement.", req: ["Explain the conflict clearly","Be polite and professional","Request a specific alternative","80–120 words"] },
  { scenario: "You missed last week's lab session due to illness and need materials and notes. Write an email to your TA asking for help.", req: ["State reason for absence","Ask for what you need specifically","Offer to make up missed work","80–120 words"] },
];

const DISC_PROMPTS = [
  { prof: "Does social media do more good than harm, or more harm than good? Support your view with specific reasoning.",
    students: [{ name: "Maria", text: "I think social media is mostly positive — it connects people globally and gives a platform to voices that might otherwise go unheard." }, { name: "James", text: "I believe the negatives outweigh the positives. Misinformation spreads rapidly, and studies link social media to rising anxiety and depression." }] },
  { prof: "Should employees always be reachable after work via phone or email, or should there be a clear boundary?",
    students: [{ name: "Sofia", text: "Staying reachable shows dedication, especially in global companies across time zones. It can really help career advancement." }, { name: "Daniel", text: "Constant availability leads to burnout. Research shows well-rested employees perform better, and companies should respect personal time." }] },
];

function wc(t) { return t.trim().split(/\s+/).filter(Boolean).length; }
function shuffleArr(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── CTW 컴포넌트 ──
function CTWQuestion({ cIdx, setCIdx }) {
  const item = CTW_ITEMS[cIdx];
  const blanks = item.passage.filter(p => p.blank);
  const [inputs, setInputs] = useState(Array(blanks.length).fill(""));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const check = () => {
    let s = 0;
    inputs.forEach((v, i) => { if (v.trim().toLowerCase() === blanks[i].fill.toLowerCase()) s++; });
    setScore(s); setChecked(true);
  };

  const next = () => {
    const n = cIdx + 1 < CTW_ITEMS.length ? cIdx + 1 : cIdx;
    setCIdx(n); setChecked(false); setScore(0);
    setInputs(Array(CTW_ITEMS[n].passage.filter(p => p.blank).length).fill(""));
  };

  let bCount = 0;
  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#64748b", marginBottom:12 }}>
        <span>문항 {cIdx+1} / {CTW_ITEMS.length}</span>
        {checked && <span style={{ fontWeight:700, color:"#1e3a8a" }}>정답 {score}/{blanks.length}</span>}
      </div>
      <p style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>빈칸에 알맞은 단어를 완성하세요 (일부 철자가 주어집니다)</p>
      <div style={{ background:"#f8fafc", borderLeft:"4px solid #1e3a8a", borderRadius:10, padding:"16px 20px", marginBottom:16, fontSize:15, lineHeight:2.8, color:"#1e293b" }}>
        {item.passage.map((part, pi) => {
          if (!part.blank) return <span key={pi}>{part.text}</span>;
          const bi = bCount++;
          const correct = checked && inputs[bi]?.trim().toLowerCase() === blanks[bi].fill.toLowerCase();
          const wrong = checked && !correct;
          return (
            <span key={pi} style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", verticalAlign:"middle", margin:"0 4px" }}>
              <span style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic", lineHeight:1, marginBottom:2 }}>{part.hint}</span>
              <input value={inputs[bi] || ""} onChange={e => { const n=[...inputs]; n[bi]=e.target.value; setInputs(n); }} disabled={checked}
                style={{ width:110, padding:"3px 8px", border:`2px solid ${wrong?"#fca5a5":correct?"#86efac":"#cbd5e1"}`,
                  borderRadius:6, fontSize:14, textAlign:"center",
                  background:wrong?"#fff5f5":correct?"#f0fdf4":"#fff", outline:"none" }} />
              {checked && <span style={{ fontSize:11, color:correct?"#15803d":"#dc2626", lineHeight:1, marginTop:2 }}>{correct?"✓":blanks[bi].fill}</span>}
            </span>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        {!checked
          ? <BTN onClick={check} disabled={inputs.some(v=>!v.trim())} style={{flex:1}}>확인</BTN>
          : <BTN onClick={next} style={{flex:1}}>{cIdx+1<CTW_ITEMS.length?"다음 →":"완료"}</BTN>}
      </div>
    </Card>
  );
}
const MCOpt = ({ label, i, sel, checked, correct, onSelect }) => {
  let bg = "#f8fafc", border = "#e2e8f0", col = "#334155";
  if (checked) {
    if (i === correct) { bg = "#f0fdf4"; border = "#86efac"; col = "#15803d"; }
    else if (i === sel) { bg = "#fff5f5"; border = "#fca5a5"; col = "#dc2626"; }
  } else if (i === sel) { bg = "#eff6ff"; border = "#93c5fd"; col = "#1d4ed8"; }
  return (
    <div onClick={() => !checked && onSelect(i)}
      style={{ padding: "9px 12px", borderRadius: 8, border: `2px solid ${border}`, background: bg, color: col,
        marginBottom: 7, cursor: checked ? "default" : "pointer", fontSize: 14 }}>
      {String.fromCharCode(65 + i)}. {label}
    </div>
  );
};

// ══ VOCAB ══
function VocabSection() {
  const [vIdx, setVIdx] = useState(0);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [wrongQ, setWrongQ] = useState([]);
  const [mcMode, setMcMode] = useState(false);
  const [mcOpts, setMcOpts] = useState([]);
  const [mcSel, setMcSel] = useState(null);
  const [mcChecked, setMcChecked] = useState(false);
  const [known, setKnown] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState("main");
  const [totalSecs, setTotalSecs] = useState(0);
  const [wordSecs, setWordSecs] = useState(0);
  const inputRef = useRef();

  useEffect(() => {
    const t = setInterval(() => setTotalSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    setWordSecs(0);
    const t = setInterval(() => setWordSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [vIdx, wrongQ.length, mcMode]);

  const cur = phase === "retry" ? VOCAB[wrongQ[0]] : VOCAB[vIdx];
  const fmtT = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const handleSubmit = async () => {
    if (!input.trim() || checking) return;
    setChecking(true);
    const r = await callClaude(`Word: "${cur.word}"\nCorrect definition: "${cur.def}"\nStudent answer: "${input.trim()}"\nIs close enough in meaning? Reply ONLY: CORRECT - [Korean reason] or INCORRECT - [Korean reason]`);
    const ok = r.trim().toUpperCase().startsWith("CORRECT");
    const msg = r.includes("-") ? r.split("-").slice(1).join("-").trim() : "";
    setResult({ ok, msg });
    if (!ok && phase === "main") { setWrong(w => w+1); setWrongQ(q => [...q, vIdx]); }
    if (ok && phase === "main") setKnown(k => k+1);
    setChecking(false);
  };

  const handleNext = () => {
    const wasOk = result?.ok;
    setResult(null); setInput("");
    if (phase === "main") {
      if (vIdx + 1 >= VOCAB.length) setPhase(wrongQ.length > 0 ? "retry" : "done");
      else setVIdx(i => i+1);
    } else {
      if (wasOk) {
        const next = wrongQ.slice(1);
        if (next.length === 0) setPhase("done"); else { setWrongQ(next); setMcMode(false); }
      } else {
        const others = VOCAB.filter((_,i) => i !== wrongQ[0]).sort(()=>Math.random()-0.5).slice(0,3);
        setMcOpts([...others.map(w=>w.def), cur.def].sort(()=>Math.random()-0.5));
        setMcMode(true); setMcSel(null); setMcChecked(false);
      }
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const reset = () => { setVIdx(0); setInput(""); setResult(null); setWrongQ([]); setMcMode(false); setKnown(0); setWrong(0); setPhase("main"); setChecking(false); setTotalSecs(0); setWordSecs(0); };

  if (phase === "done") return (
    <Card style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 48 }}>🎉</div>
      <h2 style={{ color: "#1e3a8a" }}>완료!</h2>
      <p style={{ color: "#64748b" }}>정답 <b>{known}</b> / 오답 <b>{wrong}</b> ({VOCAB.length}개)</p>
      <p style={{ color: "#94a3b8", fontSize: 13 }}>총 소요 시간: <b>{fmtT(totalSecs)}</b></p>
      <BTN onClick={reset} style={{ marginTop: 12 }}>다시 시작</BTN>
    </Card>
  );

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>
          {phase === "retry" ? `오답 복습 (${wrongQ.length}개)` : `${vIdx+1} / ${VOCAB.length}`}
          &nbsp; ✅ {known} ❌ {wrong}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <TimerBadge secs={wordSecs} label="이 문제" />
          <TimerBadge secs={totalSecs} label="전체" />
        </div>
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 6, height: 5, marginBottom: 18 }}>
        <div style={{ background: phase==="retry"?"#f59e0b":"#1e3a8a", height: 5, borderRadius: 6, width: `${phase==="retry"?100:(vIdx/VOCAB.length)*100}%`, transition: "width 0.3s" }} />
      </div>
      {phase === "retry" && <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 8, padding: "6px 12px", marginBottom: 12, fontSize: 13, color: "#92400e", textAlign: "center" }}>🔄 오답 복습</div>}
      <div style={{ background: "#1e3a8a", borderRadius: 14, padding: "28px 20px", textAlign: "center", marginBottom: 18 }}>
        <p style={{ fontSize: 13, color: "#93c5fd", margin: "0 0 6px" }}>뜻을 입력하세요</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{cur.word}</p>
        <p style={{ fontSize: 13, color: "#bfdbfe", margin: 0, fontStyle: "italic" }}>"{cur.ex}"</p>
      </div>
      {mcMode ? (
        <div>
          <p style={{ fontWeight: 600, color: "#dc2626", fontSize: 14, marginBottom: 10 }}>❌ 객관식으로 도전하세요</p>
          {mcOpts.map((opt, i) => {
            const isC = opt === cur.def;
            let bg="#f8fafc",border="#e2e8f0",col="#334155";
            if (mcChecked) { if(isC){bg="#f0fdf4";border="#86efac";col="#15803d";} else if(opt===mcSel){bg="#fff5f5";border="#fca5a5";col="#dc2626";} }
            else if (opt===mcSel) { bg="#eff6ff";border="#93c5fd";col="#1d4ed8"; }
            return <div key={i} onClick={()=>!mcChecked&&setMcSel(opt)} style={{ padding:"10px 12px",borderRadius:8,border:`2px solid ${border}`,background:bg,color:col,marginBottom:7,cursor:mcChecked?"default":"pointer",fontSize:14 }}>{String.fromCharCode(65+i)}. {opt}</div>;
          })}
          <div style={{ marginTop: 12 }}>
            {!mcChecked ? <BTN onClick={()=>setMcChecked(true)} disabled={!mcSel} style={{width:"100%"}}>확인</BTN>
              : <BTN onClick={()=>{const n=wrongQ.slice(1);setMcMode(false);setMcSel(null);setMcChecked(false);if(n.length===0)setPhase("done");else setWrongQ(n);}} style={{width:"100%"}}>다음 →</BTN>}
          </div>
        </div>
      ) : (
        <div>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!result)handleSubmit();}}
            disabled={!!result||checking}
            placeholder="영어 또는 한국어로 뜻을 입력하세요..."
            style={{ width:"100%", padding:"12px 14px", border:`2px solid ${result?(result.ok?"#86efac":"#fca5a5"):"#e2e8f0"}`,
              borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box",
              background:result?(result.ok?"#f0fdf4":"#fff5f5"):"#fff" }} />
          {result && (
            <div style={{ marginTop:8,padding:10,borderRadius:8,background:result.ok?"#f0fdf4":"#fff5f5",border:`1px solid ${result.ok?"#86efac":"#fca5a5"}`,fontSize:14 }}>
              <b style={{ color:result.ok?"#15803d":"#dc2626" }}>{result.ok?"✅ 정답!":"❌ 오답"}</b>
              {result.msg && <span style={{ marginLeft:6,color:"#475569",fontWeight:400 }}>— {result.msg}</span>}
              {!result.ok && <p style={{ margin:"4px 0 0",color:"#475569",fontSize:13 }}>정답: <b>{cur.def}</b></p>}
            </div>
          )}
          <div style={{ marginTop:12 }}>
            {!result ? <BTN onClick={handleSubmit} disabled={!input.trim()||checking} style={{width:"100%"}}>{checking?"채점 중...":"제출"}</BTN>
              : <BTN onClick={handleNext} style={{width:"100%"}}>다음 →</BTN>}
          </div>
        </div>
      )}
    </Card>
  );
}

// ══ READING ══
function ReadingSection() {
  const [rTask, setRTask] = useState(null);
  const [taskSecs, setTaskSecs] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const [dIdx, setDIdx] = useState(0);
  const [dSel, setDSel] = useState({});
  const [dChecked, setDChecked] = useState(false);
  const [dScore, setDScore] = useState(0);
  const [aSel, setASel] = useState({});
  const [aChecked, setAChecked] = useState(false);
  const [aScore, setAScore] = useState(0);

  useEffect(() => {
    if (!rTask) return;
    setTaskSecs(0);
    const t = setInterval(() => setTaskSecs(s => s+1), 1000);
    return () => clearInterval(t);
  }, [rTask]);

  const TASK_TABS = [
    { id:"ctw", icon:"🔤", label:"Complete the Words", desc:"빈칸 철자 채우기" },
    { id:"daily", icon:"📋", label:"Read in Daily Life", desc:"실생활 지문 독해" },
    { id:"academic", icon:"🏛", label:"Academic Passage", desc:"학술 지문 + 5문항" },
  ];

  if (!rTask) return <SubMenu items={TASK_TABS} onSelect={setRTask} />;

  const checkCTW = () => { let s=0; cInputs.forEach((v,i)=>{if(v.trim().toLowerCase()===CTW_ITEMS[cIdx].fills[i].toLowerCase())s++;}); setCScore(s); setCChecked(true); };
  const nextCTW = () => { const n=cIdx+1<CTW_ITEMS.length?cIdx+1:cIdx; setCIdx(n); setCInputs(Array(CTW_ITEMS[n].fills.length).fill("")); setCChecked(false); setCScore(0); };
  const checkDaily = () => { let s=0; DAILY_PASSAGES[dIdx].questions.forEach((q,i)=>{if(dSel[i]===q.ans)s++;}); setDScore(s); setDChecked(true); };
  const nextDaily = () => { const n=dIdx+1<DAILY_PASSAGES.length?dIdx+1:dIdx; setDIdx(n); setDSel({}); setDChecked(false); setDScore(0); };
  const checkAcademic = () => { let s=0; ACADEMIC_PASSAGE.questions.forEach((q,i)=>{if(aSel[i]===q.ans)s++;}); setAScore(s); setAChecked(true); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <SubBackBtn onClick={()=>setRTask(null)} />
        <TimerBadge secs={taskSecs} />
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:16, background:"#fff", padding:5, borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
        {TASK_TABS.map(t => (
          <button key={t.id} onClick={()=>setRTask(t.id)}
            style={{ flex:1, padding:"8px 4px", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:12,
              background:rTask===t.id?"#1e3a8a":"transparent", color:rTask===t.id?"#fff":"#64748b" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {rTask === "ctw" && <CTWQuestion cIdx={cIdx} setCIdx={setCIdx} />}

      {rTask === "daily" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontSize:13, color:"#64748b" }}>지문 {dIdx+1} / {DAILY_PASSAGES.length}</span>
            {dChecked && <span style={{ fontWeight:700, color:"#1e3a8a" }}>정답 {dScore}/{DAILY_PASSAGES[dIdx].questions.length}</span>}
          </div>
          <Card>
            <div style={{ background:"#f8fafc", borderLeft:"4px solid #0ea5e9", borderRadius:8, padding:14, marginBottom:16, fontSize:14, lineHeight:1.8, whiteSpace:"pre-line", color:"#334155" }}>
              {DAILY_PASSAGES[dIdx].text}
            </div>
            {DAILY_PASSAGES[dIdx].questions.map((q,qi) => (
              <div key={qi} style={{ marginBottom:16 }}>
                <p style={{ fontWeight:600, fontSize:14, color:"#1e293b", marginBottom:8 }}>{qi+1}. {q.q}</p>
                {q.opts.map((opt,oi) => <MCOpt key={oi} label={opt} i={oi} sel={dSel[qi]} checked={dChecked} correct={q.ans} onSelect={v=>setDSel(s=>({...s,[qi]:v}))} />)}
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              {!dChecked ? <BTN onClick={checkDaily} disabled={Object.keys(dSel).length<DAILY_PASSAGES[dIdx].questions.length} style={{flex:1}}>채점</BTN>
                : <BTN onClick={nextDaily} style={{flex:1}}>{dIdx+1<DAILY_PASSAGES.length?"다음 지문 →":"완료"}</BTN>}
            </div>
          </Card>
        </div>
      )}

      {rTask === "academic" && (
        <div>
          {aChecked && <div style={{ background:"#1e3a8a", color:"#fff", borderRadius:10, padding:"10px 16px", marginBottom:12, textAlign:"center", fontWeight:700, fontSize:16 }}>점수: {aScore} / {ACADEMIC_PASSAGE.questions.length}</div>}
          <Card>
            <div style={{ background:"#f8fafc", borderLeft:"4px solid #7c3aed", borderRadius:8, padding:14, marginBottom:16, fontSize:14, lineHeight:1.8, color:"#334155" }}>
              {ACADEMIC_PASSAGE.text}
            </div>
            {ACADEMIC_PASSAGE.questions.map((q,qi) => (
              <div key={qi} style={{ marginBottom:16 }}>
                <p style={{ fontWeight:600, fontSize:14, color:"#1e293b", marginBottom:8 }}>{qi+1}. {q.q}</p>
                {q.opts.map((opt,oi) => <MCOpt key={oi} label={opt} i={oi} sel={aSel[qi]} checked={aChecked} correct={q.ans} onSelect={v=>setASel(s=>({...s,[qi]:v}))} />)}
              </div>
            ))}
            {!aChecked ? <BTN onClick={checkAcademic} disabled={Object.keys(aSel).length<ACADEMIC_PASSAGE.questions.length} style={{width:"100%"}}>채점</BTN>
              : <BTN onClick={()=>{setASel({});setAChecked(false);setAScore(0);}} color="#059669" style={{width:"100%"}}>다시 풀기</BTN>}
          </Card>
        </div>
      )}
    </div>
  );
}

// ══ SPEAKING ══
function SpeakingSection() {
  const [sTask, setSTask] = useState(null);
  const [rIdx, setRIdx] = useState(0);
  const [rTranscript, setRTranscript] = useState("");
  const [rListening, setRListening] = useState(false);
  const [rResult, setRResult] = useState(null);
  const [rLoading, setRLoading] = useState(false);
  const [iIdx, setIIdx] = useState(0);
  const [iTranscript, setITranscript] = useState("");
  const [iListening, setIListening] = useState(false);
  const [iResult, setIResult] = useState(null);
  const [iLoading, setILoading] = useState(false);
  const [totalSecs, setTotalSecs] = useState(0);
  const [qSecs, setQSecs] = useState(0);
  const recogRef = useRef(null);

  useEffect(() => {
    if (!sTask) return;
    setTotalSecs(0); setQSecs(0);
    const t1 = setInterval(() => setTotalSecs(s=>s+1), 1000);
    return () => clearInterval(t1);
  }, [sTask]);

  useEffect(() => {
    if (!sTask) return;
    setQSecs(0);
    const t = setInterval(() => setQSecs(s=>s+1), 1000);
    return () => clearInterval(t);
  }, [rIdx, iIdx]);

  const hasSpeech = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  function startListening(onResult, onEnd) {
    if (!hasSpeech) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = e => onResult(e.results[0][0].transcript);
    r.onend = onEnd; r.onerror = onEnd;
    recogRef.current = r; r.start();
  }
  function stopListening() { try { recogRef.current?.stop(); } catch {} }

  const MicBtn = ({ listening, onStart, onStop }) => (
    <button onClick={listening ? onStop : onStart}
      style={{ width:64, height:64, borderRadius:"50%", border:"none", cursor:"pointer",
        background:listening?"#dc2626":"#1e3a8a", color:"#fff", fontSize:26,
        boxShadow:listening?"0 0 0 8px rgba(220,38,38,0.2)":"0 4px 12px rgba(30,58,138,0.3)" }}>
      {listening ? "⏹" : "🎤"}
    </button>
  );

  const ScoreBadge = ({ label, val, max=5 }) => (
    <div style={{ flex:1, background:"#f8fafc", borderRadius:10, padding:"10px 8px", textAlign:"center", border:"1px solid #e2e8f0" }}>
      <div style={{ fontSize:20, fontWeight:700, color:val>=max*0.7?"#15803d":val>=max*0.4?"#d97706":"#dc2626" }}>{val}/{max}</div>
      <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{label}</div>
    </div>
  );

  const SPK_MENUS = [
    { id:"repeat", icon:"🔁", label:"Listen & Repeat", desc:"7문장 따라 말하기" },
    { id:"interview", icon:"🎤", label:"Take an Interview", desc:"4문항 즉흥 인터뷰" },
  ];

  if (!sTask) return <SubMenu items={SPK_MENUS} onSelect={setSTask} />;

  return (
    <div>
      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 8px rgba(220,38,38,0.2)}50%{box-shadow:0 0 0 16px rgba(220,38,38,0.05)}}`}</style>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <SubBackBtn onClick={()=>setSTask(null)} />
        <div style={{ display:"flex", gap:6 }}>
          <TimerBadge secs={qSecs} label="이 문제" />
          <TimerBadge secs={totalSecs} label="전체" />
        </div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:16, background:"#fff", padding:5, borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
        {SPK_MENUS.map(m => (
          <button key={m.id} onClick={()=>setSTask(m.id)}
            style={{ flex:1, padding:"9px 4px", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13,
              background:sTask===m.id?"#1e3a8a":"transparent", color:sTask===m.id?"#fff":"#64748b" }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {!hasSpeech && <div style={{ background:"#fef3c7", border:"1px solid #fbbf24", borderRadius:10, padding:12, marginBottom:14, fontSize:13, color:"#92400e" }}>⚠️ Chrome 또는 Edge에서 음성 인식이 지원됩니다.</div>}

      {sTask === "repeat" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#64748b", marginBottom:12 }}>
            <span>문장 {rIdx+1} / {REPEAT_SENTENCES.length}</span>
            <span style={{ background:"#dbeafe", color:"#1e3a8a", borderRadius:12, padding:"2px 10px", fontSize:12, fontWeight:600 }}>Level {REPEAT_SENTENCES[rIdx].level}</span>
          </div>
          <div style={{ background:"#e2e8f0", borderRadius:6, height:4, marginBottom:20 }}>
            <div style={{ background:"#1e3a8a", height:4, borderRadius:6, width:`${(rIdx/REPEAT_SENTENCES.length)*100}%`, transition:"width 0.3s" }} />
          </div>
          <div style={{ background:"#1e3a8a", borderRadius:14, padding:"28px 24px", textAlign:"center", marginBottom:20 }}>
            <p style={{ fontSize:13, color:"#93c5fd", margin:"0 0 8px" }}>{rTranscript?"들은 문장:":"🎤 마이크를 누르고 문장을 따라 말하세요"}</p>
            <p style={{ fontSize:18, fontWeight:600, color:"#fff", margin:0, lineHeight:1.5 }}>{rTranscript?REPEAT_SENTENCES[rIdx].text:"???"}</p>
          </div>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <MicBtn listening={rListening} onStart={()=>{setRTranscript("");setRResult(null);setRListening(true);startListening(t=>setRTranscript(t),()=>setRListening(false));}} onStop={stopListening} />
            <p style={{ fontSize:13, color:"#64748b", marginTop:8 }}>{rListening?"🔴 녹음 중...":rTranscript?"녹음 완료":"버튼을 눌러 시작"}</p>
          </div>
          {rTranscript && !rResult && <div style={{ background:"#f8fafc", borderRadius:8, padding:10, marginBottom:12, fontSize:14, color:"#334155" }}><b>내 답변:</b> {rTranscript}</div>}
          {rResult && (
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <ScoreBadge label="정확도" val={rResult.score} max={5} />
              <div style={{ flex:3, background:"#f8fafc", borderRadius:10, padding:"10px 14px", border:"1px solid #e2e8f0", fontSize:14, color:"#334155" }}>
                {rResult.feedback}
                {rResult.missing && <p style={{ margin:"4px 0 0", color:"#dc2626", fontSize:13 }}>빠진/틀린 부분: <b>{rResult.missing}</b></p>}
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:8 }}>
            {!rResult
              ? <BTN onClick={async()=>{if(!rTranscript||rLoading)return;setRLoading(true);const res=await callClaude(`Original: "${REPEAT_SENTENCES[rIdx].text}"\nStudent: "${rTranscript}"\nEvaluate repetition accuracy. Reply ONLY in JSON (no markdown): {"score":3,"feedback":"Korean 1-2 sentences","missing":"wrong words or empty string"}`,`You are a TOEFL Speaking evaluator. Score 0-5.`);try{setRResult(JSON.parse(res.replace(/```json|```/g,"").trim()));}catch{setRResult({score:0,feedback:"채점 오류",missing:""});}setRLoading(false);}} disabled={!rTranscript||rLoading} style={{flex:1}}>{rLoading?"채점 중...":"AI 채점"}</BTN>
              : <BTN onClick={()=>{setRTranscript("");setRResult(null);if(rIdx+1<REPEAT_SENTENCES.length)setRIdx(i=>i+1);else setSTask("interview");}} style={{flex:1}}>{rIdx+1>=REPEAT_SENTENCES.length?"인터뷰로 이동 →":"다음 문장 →"}</BTN>}
          </div>
        </Card>
      )}

      {sTask === "interview" && (
        <div>
          <div style={{ display:"flex", gap:6, marginBottom:12 }}>
            {INTERVIEW_QS.map((_,i) => (
              <div key={i} onClick={()=>{setIIdx(i);setITranscript("");setIResult(null);}}
                style={{ flex:1, padding:"7px 4px", borderRadius:8, textAlign:"center", cursor:"pointer", fontWeight:700, fontSize:13,
                  background:i===iIdx?"#1e3a8a":"#e2e8f0", color:i===iIdx?"#fff":"#64748b" }}>Q{i+1}</div>
            ))}
          </div>
          <Card>
            <div style={{ background:"#eff6ff", borderLeft:"4px solid #1e3a8a", borderRadius:10, padding:14, marginBottom:18 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#1e3a8a", margin:"0 0 4px" }}>{INTERVIEW_QS[iIdx].type==="personal"?"👤 Personal Experience":"💬 Opinion"}</p>
              <p style={{ fontSize:16, color:"#1e293b", margin:0, lineHeight:1.6, fontWeight:500 }}>{INTERVIEW_QS[iIdx].q}</p>
            </div>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <MicBtn listening={iListening} onStart={()=>{setITranscript("");setIResult(null);setIListening(true);startListening(t=>setITranscript(t),()=>setIListening(false));}} onStop={stopListening} />
              <p style={{ fontSize:13, color:"#64748b", marginTop:8 }}>{iListening?"🔴 녹음 중 (45초 목표)...":iTranscript?"녹음 완료":"버튼을 눌러 시작"}</p>
            </div>
            {iTranscript && <div style={{ background:"#f8fafc", borderRadius:8, padding:10, marginBottom:12, fontSize:14, color:"#334155" }}><b>내 답변:</b> {iTranscript}</div>}
            {iResult && (
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <ScoreBadge label="유창성" val={iResult.fluency} max={4} />
                  <ScoreBadge label="언어" val={iResult.language} max={4} />
                  <ScoreBadge label="내용" val={iResult.content} max={4} />
                  <div style={{ flex:1, background:"#1e3a8a", borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:700, color:"#fff" }}>{iResult.total}/12</div>
                    <div style={{ fontSize:12, color:"#bfdbfe" }}>총점</div>
                  </div>
                </div>
                <div style={{ fontSize:14, color:"#334155", lineHeight:1.7, marginBottom:8 }}>{iResult.feedback}</div>
                {iResult.improved && <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:10, fontSize:13, color:"#14532d" }}><b>개선 예시:</b> {iResult.improved}</div>}
              </div>
            )}
            <div style={{ display:"flex", gap:8 }}>
              {!iResult
                ? <BTN onClick={async()=>{if(!iTranscript||iLoading)return;setILoading(true);const res=await callClaude(`Question: "${INTERVIEW_QS[iIdx].q}"\nStudent: "${iTranscript}"\nEvaluate TOEFL Interview. Reply ONLY in JSON (no markdown): {"fluency":3,"language":3,"content":3,"total":9,"feedback":"Korean 2-3 sentences","improved":"one improved example sentence in English"}`,`You are a TOEFL Speaking evaluator. Each dimension 0-4.`);try{setIResult(JSON.parse(res.replace(/```json|```/g,"").trim()));}catch{setIResult({fluency:0,language:0,content:0,total:0,feedback:"채점 오류",improved:""});}setILoading(false);}} disabled={!iTranscript||iLoading} style={{flex:1}}>{iLoading?"채점 중...":"AI 채점"}</BTN>
                : <BTN onClick={()=>{setITranscript("");setIResult(null);setIIdx(i=>(i+1)%INTERVIEW_QS.length);}} color="#059669" style={{flex:1}}>다음 문제 →</BTN>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══ WRITING ══
function WritingSection() {
  const [wTask, setWTask] = useState(null);
  const [taskSecs, setTaskSecs] = useState(0);
  const [bIdx, setBIdx] = useState(0);
  const [bSel, setBSel] = useState([]);
  const [bBank, setBBank] = useState(()=>shuffleArr([...BUILD_SENTENCES[0].words]));
  const [bChecked, setBChecked] = useState(false);
  const [bScore, setBScore] = useState(0);
  const [eIdx, setEIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [eFb, setEFb] = useState(""); const [eLoad, setELoad] = useState(false);
  const [dIdx, setDIdx] = useState(0);
  const [disc, setDisc] = useState("");
  const [dFb, setDFb] = useState(""); const [dLoad, setDLoad] = useState(false);

  useEffect(() => {
    if (!wTask) return;
    setTaskSecs(0);
    const t = setInterval(() => setTaskSecs(s=>s+1), 1000);
    return () => clearInterval(t);
  }, [wTask]);

  const initBuild = idx => { setBBank(shuffleArr([...BUILD_SENTENCES[idx].words])); setBSel([]); setBChecked(false); };
  const handleWord = (w, from) => {
    if (bChecked) return;
    if (from==="bank") { setBSel(p=>[...p,w]); setBBank(p=>{const i=p.indexOf(w);return[...p.slice(0,i),...p.slice(i+1)];}); }
    else { setBBank(p=>[...p,w]); setBSel(p=>{const i=p.indexOf(w);return[...p.slice(0,i),...p.slice(i+1)];}); }
  };
  const checkBuild = () => {
    const ans = bSel.join(" ").toLowerCase().replace(/[^a-z\s']/g,"").trim();
    const correct = BUILD_SENTENCES[bIdx].answer.toLowerCase().trim();
    if (ans===correct) setBScore(s=>s+1);
    setBChecked(ans===correct?"correct":"wrong");
  };

  const WRT_MENUS = [
    { id:"build", icon:"🔀", label:"Build a Sentence", desc:"단어 배열로 문장 완성" },
    { id:"email", icon:"📧", label:"Write an Email", desc:"상황별 이메일 작성 (7분)" },
    { id:"discussion", icon:"💬", label:"Academic Discussion", desc:"교수 질문 토론 답변 (10분)" },
  ];

  if (!wTask) return <SubMenu items={WRT_MENUS} onSelect={setWTask} />;

  const gradeFb = async (prompt) => await callClaude(`You are a TOEFL Writing evaluator. Evaluate in Korean.\n${prompt}\nProvide:\n1. **총평** (1-2 sentences)\n2. **내용 완성도** (2-3 bullet points)\n3. **언어 & 문법** (2-3 bullet points)\n4. **개선 제안** (1-2 tips)\n5. **예상 점수**: X/5`);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <SubBackBtn onClick={()=>setWTask(null)} />
        <TimerBadge secs={taskSecs} />
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:16, background:"#fff", padding:5, borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
        {WRT_MENUS.map(t => (
          <button key={t.id} onClick={()=>setWTask(t.id)}
            style={{ flex:1, padding:"8px 4px", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:12,
              background:wTask===t.id?"#1e3a8a":"transparent", color:wTask===t.id?"#fff":"#64748b", lineHeight:1.4 }}>
            {t.icon}<br />{t.label}
          </button>
        ))}
      </div>

      {wTask === "build" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#64748b", marginBottom:10 }}>
            <span>문항 {bIdx+1} / {BUILD_SENTENCES.length}</span>
            <span>정답 {bScore}/{BUILD_SENTENCES.length}</span>
          </div>
          <div style={{ background:"#eff6ff", borderLeft:"4px solid #1e3a8a", borderRadius:8, padding:10, marginBottom:14, fontSize:14, color:"#1e3a8a", fontWeight:600 }}>{BUILD_SENTENCES[bIdx].prompt}</div>
          <p style={{ fontSize:13, color:"#64748b", marginBottom:8 }}>단어를 클릭해 문장을 완성하세요 (여분 단어 포함)</p>
          <div style={{ minHeight:48, background:"#f8fafc", border:`2px solid ${bChecked?(bChecked==="correct"?"#86efac":"#fca5a5"):"#e2e8f0"}`, borderRadius:10, padding:"10px 12px", marginBottom:10, display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
            {bSel.length===0 && <span style={{ color:"#94a3b8", fontSize:13 }}>여기에 단어를 배치하세요...</span>}
            {bSel.map((w,i) => <span key={i} onClick={()=>handleWord(w,"answer")} style={{ background:"#1e3a8a", color:"#fff", borderRadius:6, padding:"4px 10px", fontSize:14, cursor:bChecked?"default":"pointer" }}>{w}</span>)}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:36, marginBottom:14 }}>
            {bBank.map((w,i) => <span key={i} onClick={()=>handleWord(w,"bank")} style={{ background:"#f1f5f9", border:"1px solid #cbd5e1", borderRadius:6, padding:"4px 10px", fontSize:14, cursor:bChecked?"default":"pointer", color:"#334155" }}>{w}</span>)}
          </div>
          {bChecked && (
            <div style={{ background:bChecked==="correct"?"#f0fdf4":"#fff5f5", border:`1px solid ${bChecked==="correct"?"#86efac":"#fca5a5"}`, borderRadius:8, padding:10, marginBottom:12, fontSize:13 }}>
              <b style={{ color:bChecked==="correct"?"#15803d":"#dc2626" }}>{bChecked==="correct"?"✅ 정답!":"❌ 오답"}</b>
              {bChecked!=="correct" && <p style={{ margin:"4px 0 0", color:"#475569" }}>정답: <b>{BUILD_SENTENCES[bIdx].answer}</b></p>}
            </div>
          )}
          <div style={{ display:"flex", gap:8 }}>
            {!bChecked
              ? <><BTN onClick={()=>initBuild(bIdx)} color="#64748b" style={{flex:1}}>초기화</BTN><BTN onClick={checkBuild} disabled={!bSel.length} style={{flex:2}}>확인</BTN></>
              : bIdx+1<BUILD_SENTENCES.length
                ? <BTN onClick={()=>{setBIdx(i=>i+1);initBuild(bIdx+1);}} style={{flex:1}}>다음 →</BTN>
                : <div style={{ flex:1, textAlign:"center", padding:12, background:"#f0fdf4", borderRadius:8, fontWeight:700, color:"#15803d" }}>🎉 완료! {bScore}/{BUILD_SENTENCES.length}</div>}
          </div>
        </Card>
      )}

      {wTask === "email" && (
        <div>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, color:"#64748b" }}>시나리오 {eIdx+1} / {EMAIL_SCENARIOS.length}</span>
              <div style={{ display:"flex", gap:6 }}>
                {EMAIL_SCENARIOS.map((_,i) => <div key={i} onClick={()=>{setEIdx(i);setEmail("");setEFb("");}} style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:i===eIdx?"#1e3a8a":"#e2e8f0", color:i===eIdx?"#fff":"#64748b", fontSize:12, fontWeight:700, cursor:"pointer" }}>{i+1}</div>)}
              </div>
            </div>
            <div style={{ background:"#eff6ff", borderLeft:"4px solid #1e3a8a", borderRadius:10, padding:14, marginBottom:12 }}>
              <p style={{ fontSize:13, fontWeight:600, color:"#1e3a8a", margin:"0 0 6px" }}>📧 시나리오</p>
              <p style={{ fontSize:14, color:"#334155", margin:"0 0 10px", lineHeight:1.6 }}>{EMAIL_SCENARIOS[eIdx].scenario}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{EMAIL_SCENARIOS[eIdx].req.map((r,i) => <span key={i} style={{ background:"#dbeafe", color:"#1d4ed8", borderRadius:6, padding:"3px 8px", fontSize:12 }}>✓ {r}</span>)}</div>
            </div>
            <textarea value={email} onChange={e=>setEmail(e.target.value)} placeholder={"Dear Professor [Name],\n\n...\n\nBest regards,\n[Your name]"}
              style={{ width:"100%", minHeight:160, padding:12, border:"2px solid #e2e8f0", borderRadius:10, fontSize:14, lineHeight:1.7, resize:"vertical", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
              <span style={{ fontSize:13, color:wc(email)>=80&&wc(email)<=120?"#16a34a":wc(email)>120?"#d97706":"#94a3b8" }}>단어 수: {wc(email)} / 80–120</span>
              <BTN onClick={async()=>{if(!email.trim()||eLoad)return;setELoad(true);setEFb("");const r=await gradeFb(`SCENARIO: "${EMAIL_SCENARIOS[eIdx].scenario}"\nREQUIREMENTS: ${EMAIL_SCENARIOS[eIdx].req.join(", ")}\nSTUDENT EMAIL: "${email}"`);setEFb(r);setELoad(false);}} disabled={eLoad||email.trim().length<30}>{eLoad?"채점 중...":"🤖 AI 첨삭"}</BTN>
            </div>
          </Card>
          {eLoad && <Card><p style={{ textAlign:"center", color:"#64748b" }}>⏳ 분석 중...</p></Card>}
          {eFb && !eLoad && <Card><h3 style={{ color:"#1e3a8a", marginTop:0 }}>📧 AI 첨삭 결과</h3><FeedbackBlock text={eFb} /></Card>}
        </div>
      )}

      {wTask === "discussion" && (
        <div>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, color:"#64748b" }}>토론 {dIdx+1} / {DISC_PROMPTS.length}</span>
              <div style={{ display:"flex", gap:6 }}>
                {DISC_PROMPTS.map((_,i) => <div key={i} onClick={()=>{setDIdx(i);setDisc("");setDFb("");}} style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:i===dIdx?"#1e3a8a":"#e2e8f0", color:i===dIdx?"#fff":"#64748b", fontSize:12, fontWeight:700, cursor:"pointer" }}>{i+1}</div>)}
              </div>
            </div>
            <div style={{ background:"#f8fafc", borderLeft:"4px solid #7c3aed", borderRadius:8, padding:12, marginBottom:8 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#7c3aed", margin:"0 0 4px" }}>👨‍🏫 Professor</p>
              <p style={{ fontSize:14, color:"#334155", margin:0, lineHeight:1.6 }}>{DISC_PROMPTS[dIdx].prof}</p>
            </div>
            {DISC_PROMPTS[dIdx].students.map((s,i) => (
              <div key={i} style={{ background:"#f8fafc", borderLeft:"4px solid #0ea5e9", borderRadius:8, padding:12, marginBottom:8 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#0369a1", margin:"0 0 4px" }}>🎓 {s.name}</p>
                <p style={{ fontSize:14, color:"#334155", margin:0, lineHeight:1.6 }}>{s.text}</p>
              </div>
            ))}
            <div style={{ background:"#fefce8", borderRadius:8, padding:"8px 12px", marginBottom:10, fontSize:12, color:"#713f12" }}>
              💡 입장을 명확히 하고, {DISC_PROMPTS[dIdx].students[0].name} 또는 {DISC_PROMPTS[dIdx].students[1].name}를 구체적으로 언급하세요 (100–150 words)
            </div>
            <textarea value={disc} onChange={e=>setDisc(e.target.value)} placeholder="Write your response here..."
              style={{ width:"100%", minHeight:130, padding:12, border:"2px solid #e2e8f0", borderRadius:10, fontSize:14, lineHeight:1.7, resize:"vertical", outline:"none", boxSizing:"border-box" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
              <span style={{ fontSize:13, color:wc(disc)>=100?"#16a34a":"#94a3b8" }}>단어 수: {wc(disc)} / 100+</span>
              <BTN onClick={async()=>{if(!disc.trim()||dLoad)return;setDLoad(true);setDFb("");const d=DISC_PROMPTS[dIdx];const r=await gradeFb(`PROFESSOR: "${d.prof}"\n${d.students[0].name}: "${d.students[0].text}"\n${d.students[1].name}: "${d.students[1].text}"\nSTUDENT RESPONSE: "${disc}"`);setDFb(r);setDLoad(false);}} disabled={dLoad||disc.trim().length<30}>{dLoad?"채점 중...":"🤖 AI 첨삭"}</BTN>
            </div>
          </Card>
          {dLoad && <Card><p style={{ textAlign:"center", color:"#64748b" }}>⏳ 분석 중...</p></Card>}
          {dFb && !dLoad && <Card><h3 style={{ color:"#1e3a8a", marginTop:0 }}>💬 AI 첨삭 결과</h3><FeedbackBlock text={dFb} /></Card>}
        </div>
      )}
    </div>
  );
}

// ══ MAIN APP ══
const MAIN_MENU = [
  { id:"vocab", icon:"📚", label:"단어 암기", desc:"TOEFL 고빈출 단어 학습" },
  { id:"reading", icon:"📖", label:"Reading", desc:"Complete Words · Daily Life · Academic" },
  { id:"speaking", icon:"🎙", label:"Speaking", desc:"Listen & Repeat · Interview" },
  { id:"writing", icon:"✍️", label:"Writing", desc:"Build · Email · Discussion" },
];

export default function App() {
  const [tab, setTab] = useState(null);
  return (
    <div style={{ fontFamily:"'Segoe UI', sans-serif", background:"#f0f4ff", minHeight:"100vh", padding:"20px" }}>
      <div style={{ maxWidth:740, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ flex:1 }} />
          <div style={{ textAlign:"center", flex:4 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1e3a8a", margin:0 }}>🎓 TOEFL 2026 학습 도구</h1>
            <p style={{ color:"#64748b", fontSize:12, margin:"4px 0 0" }}>2026 개정 포맷 기준</p>
          </div>
          <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
            <button onClick={()=>window.close()}
              style={{ width:36, height:36, borderRadius:"50%", border:"none", background:"#e2e8f0",
                color:"#64748b", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
              ✕
            </button>
          </div>
        </div>

        {!tab && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {MAIN_MENU.map(item => (
              <button key={item.id} onClick={()=>setTab(item.id)}
                style={{ background:"#fff", border:"2px solid #e2e8f0", borderRadius:16, padding:"28px 20px",
                  cursor:"pointer", textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{item.icon}</div>
                <div style={{ fontWeight:700, fontSize:16, color:"#1e3a8a", marginBottom:6 }}>{item.label}</div>
                <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>{item.desc}</div>
              </button>
            ))}
          </div>
        )}

        {tab && (
          <div>
            <button onClick={()=>setTab(null)}
              style={{ border:"none", background:"transparent", color:"#64748b", fontWeight:600,
                fontSize:14, cursor:"pointer", padding:"4px 0", marginBottom:12, display:"block" }}>
              ← 메인으로
            </button>
            {tab === "vocab" && <VocabSection />}
            {tab === "reading" && <ReadingSection />}
            {tab === "speaking" && <SpeakingSection />}
            {tab === "writing" && <WritingSection />}
          </div>
        )}
      </div>
    </div>
  );
}
