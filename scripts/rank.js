// rank.js — materials ladder + ELO

const MATERIAL_TIERS = [
  "Stone","Bronze","Iron","Silver","Gold","Platinum",
  "Titanium","Carbon Fiber","Ceramic Matrix",
  "Polymer Nano","Semiconductor","Composite Micro-Lattice",
  "Metamaterial","Superconductor","Graphene",
  "Quantum Crystal","Singularity"
];

function rankFromElo(elo){
  const span = 3000-800;
  let t = Math.max(0, Math.min(1, (elo-800)/span));
  let tierIndex = Math.floor(t * (MATERIAL_TIERS.length-1));
  const divisions = ["IV","III","II","I"];
  let within = (t * (MATERIAL_TIERS.length-1)) % 1;
  let divIndex = Math.min(3, Math.floor(within*4));
  return `${MATERIAL_TIERS[tierIndex]} ${divisions[divIndex]}`;
}

const PlayerRank = {
  topicElo: JSON.parse(localStorage.getItem('pr_topicElo')||'{}'),
  getElo(topic){ return this.topicElo[topic] || 1200; },
  setElo(topic, val){ 
    this.topicElo[topic]=val; 
    localStorage.setItem('pr_topicElo', JSON.stringify(this.topicElo)); 
  },
  update(topic, score){
    const K = 32;
    const current = this.getElo(topic);
    const expected = 1/(1+Math.pow(10,((1200-current)/400)));
    const next = Math.round(current + K * (score - expected));
    this.setElo(topic, next);
    return next;
  }
};
