const MATERIAL_TIERS = ["Stone","Bronze","Iron","Silver","Gold","Platinum","Titanium","Carbon Fiber","Ceramic Matrix","Polymer Nano","Semiconductor","Composite Micro-Lattice","Metamaterial","Superconductor","Graphene","Quantum Crystal","Singularity"];
const DIVS = ["IV","III","II","I"];

function rankFromElo(elo){
  if (elo == null) return "Unranked";
  const span = 2200; // 800..3000
  let t = Math.max(0, Math.min(1, (elo-800)/span));
  let tierIndex = Math.floor(t * (MATERIAL_TIERS.length-1));
  let within = (t * (MATERIAL_TIERS.length-1)) % 1;
  let divIndex = Math.min(3, Math.floor(within*4));
  return `${MATERIAL_TIERS[tierIndex]} ${DIVS[divIndex]}`;
}

const PlayerRank = {
  _elo: JSON.parse(localStorage.getItem('pr_topicYearElo')||'{}'),
  save(){ localStorage.setItem('pr_topicYearElo', JSON.stringify(this._elo)); },
  getElo(key){ return (key in this._elo) ? this._elo[key] : null; },
  setElo(key, val){ this._elo[key] = val; this.save(); },
  update(key, score){
    const K = 32;
    const current = this.getElo(key) ?? 1150;
    const expected = 1/(1+Math.pow(10,((1200-current)/400)));
    const next = Math.round(current + K * (score - expected));
    this.setElo(key, next);
    return next;
  }
};
