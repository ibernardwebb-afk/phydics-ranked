// game.js — reading → questions → scoring (subject+year aware)

let DATA = null;
let phase = 'reading';
let idx = 0;
let totalScore = 0;
let timer = null;
let remaining = 60;

const view = document.getElementById('view');
const phaseEl = document.getElementById('phase');
const tbar = document.getElementById('tbar');
const actions = document.getElementById('actions');
const result = document.getElementById('result');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const hintBtn = document.getElementById('hintBtn');
const submitBtn = document.getElementById('submitBtn');

function getParams(){
  const p = new URLSearchParams(location.search);
  const sub = p.get('sub') || localStorage.getItem('pr_selSub') || 'Mechanics';
  const lvl = p.get('lvl') || localStorage.getItem('pr_selLvl') || 'Y10';
  return {sub,lvl};
}
function dataPath(sub,lvl){
  // e.g., data/mechanics/Y10_set1.json
  const s = sub.toLowerCase();
  return `../data/${s}/${lvl}_set1.json`;
}

async function boot(){
  const {sub,lvl} = getParams();
  try{
    const res = await fetch(dataPath(sub,lvl));
    DATA = await res.json();
  }catch(e){
    // fallback to old UG1 mechanics if someone deep-linked
    const res = await fetch('../data/mech_uni_01.json');
    DATA = await res.json();
  }
  remaining = DATA.timers.readSeconds;
  renderReading();
  startTimer();
}

function startTimer(){
  if (timer) clearInterval(timer);
  const total = remaining;
  timer = setInterval(()=>{
    remaining -= 1;
    tbar.style.width = Math.max(0, remaining/total)*100 + '%';
    if (remaining <= 0){
      clearInterval(timer);
      if (phase === 'reading'){ startQuestions(); }
    }
  }, 1000);
}
function renderReading(){
  phase = 'reading';
  phaseEl.textContent = 'Reading';
  actions.style.display = 'none';
  view.innerHTML = `
    <div class="paper">
      <h2 class="calli">Extract</h2>
      <p>${DATA.extract.html}</p>
      ${DATA.extract.image ? `<img src="${DATA.extract.image}" alt="" style="max-width:100%;border-radius:12px;border:1px solid #1b1f33;margin-top:8px">` : ''}
      <div class="mono">${(DATA.extract.constants||[]).join(' • ')}</div>
    </div>`;
}
function startQuestions(){
  phase = 'questions';
  phaseEl.textContent = 'Questions';
  remaining = DATA.timers.solveSeconds;
  startTimer();
  idx = 0; totalScore = 0;
  actions.style.display = 'block';
  renderQuestion();
}
function renderQuestion(){
  const q = DATA.questions[idx];
  view.innerHTML = `
    <div class="paper">
      <div class="row" style="justify-content:space-between;align-items:flex-end">
        <h2 class="calli">Q${idx+1}/${DATA.questions.length}</h2>
        <div class="pill">Type: ${q.type.toUpperCase()}</div>
      </div>
      <p>${q.prompt}</p>
      ${q.type==='numeric'
        ? `<input type="number" id="ans" placeholder="Enter value (${q.units})"/>`
        : `<textarea id="work" placeholder="Explain your reasoning…"></textarea>`}
      ${q.hint? `<div class="mono" style="opacity:.8;margin-top:8px">Hint available</div>`:''}
    </div>`;
}
function scoreCurrent(){
  const q = DATA.questions[idx];
  let s = 0;
  if (q.type==='numeric'){
    const v = parseFloat(document.getElementById('ans').value);
    if (!isNaN(v)){
      const rel = Math.abs(v - q.answer)/Math.max(1e-9, Math.abs(q.answer));
      s = (rel <= q.tol) ? 1 : (rel <= q.tol*2 ? 0.5 : 0);
    }
  } else {
    const text = (document.getElementById('work').value||'').toLowerCase();
    s = q.keywords && q.keywords.some(k=>text.includes(k.toLowerCase())) ? 1 : 0.5;
  }
  totalScore += s; return s;
}

prevBtn.addEventListener('click', ()=>{ if (idx>0){ idx--; renderQuestion(); }});
nextBtn.addEventListener('click', ()=>{ if (idx<DATA.questions.length-1){ idx++; renderQuestion(); }});
hintBtn.addEventListener('click', ()=> alert(DATA.questions[idx].hint || 'No hint.'));
submitBtn.addEventListener('click', ()=>{ 
  scoreCurrent();
  if (idx < DATA.questions.length-1){ idx++; renderQuestion(); } else finishMatch();
});

function finishMatch(){
  phase = 'done';
  actions.style.display = 'none';
  clearInterval(timer);

  const scoreFrac = totalScore / DATA.questions.length;
  const {sub,lvl} = getParams();
  const key = `${sub}_${lvl}`;
  const newElo = PlayerRank.update(key, scoreFrac);

  result.style.display = 'block';
  result.innerHTML = `
    <h2 class="calli">Match Analysis</h2>
    <div class="row" style="flex-wrap:wrap;gap:14px">
      <span class="pill">Score: ${(scoreFrac*100).toFixed(0)}%</span>
      <span class="pill">New Rank (${sub} — ${lvl}): <b>${rankFromElo(newElo)}</b></span>
    </div>
    <div style="margin-top:10px;opacity:.9">
      <a class="btn" href="../index.html">Return Home</a>
    </div>`;
}

boot();
