// rank.js — materials ladder + ELO per Subject+Year

const MATERIAL_TIERS = [
  "Stone","Bronze","Iron","Silver","Gold","Platinum",
  "Titanium","Carbon Fiber","Ceramic Matrix",
  "Polymer Nano","Semiconductor","Composite Micro-Lattice",
  "Metamaterial","Superconductor","Graphene",
  "Quantum Crystal","Singularity"
];
const DIVS = ["IV","III","II","I"];

function rankFromElo(elo){
  if (elo === null || elo === undefined) return "Unranked";
  const span = 3000-800;
  let t = Math.max(0, Math.min(1, (elo-800)/span));
  let tierIndex = Math.floor(t * (MATERIAL_TIERS.length-1));
  let within = (t * (MATERIAL_TIERS.length-1)) % 1;
  let divIndex = Math.min(3, Math.floor(within*4));
  return `${MATERIAL_TIERS[tierIndex]} ${DIVS[divIndex]}`;
}

const PlayerRank = {
  _elo: JSON.parse(localStorage.getItem('pr_topicYearElo')||'{}'),
  save(){ localStorage.setItem('pr_topicYearElo', JSON.stringify(this._elo)); },
  key(topicYear){ return topicYear; },
  getElo(topicYear){
    const k = this.key(topicYear);
    return (k in this._elo) ? this._elo[k] : null;
  },
  setElo(topicYear, val){
    this._elo[this.key(topicYear)] = val;
    this.save();
  },
  update(topicYear, score){
    const K = 32;
    const current = this.getElo(topicYear) ?? 1150; // default Silver IV
    const expected = 1/(1+Math.pow(10,((1200-current)/400))); // vs 1200 pool
    const next = Math.round(current + K * (score - expected));
    this.setElo(topicYear, next);
    return next;
  },
  unlockedMaxLevel(){
    // returns max level tag the player has unlocked via onboarding
    return localStorage.getItem('pr_year') || 'Y10';
  },
  state(){
    return {
      year: localStorage.getItem('pr_year') || 'Y10',
      title: localStorage.getItem('pr_title') || 'Undergrad',
    };
  }
};
