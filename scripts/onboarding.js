// onboarding.js — first-run year group + custom title, unlock ladders, seed ELO

const Onboarding = (()=>{

  const YEARS = ['Y9','Y10','Y11','Y12','Y13','UG1','UG2','UG3'];

  function maybeOpen(){
    const seen = localStorage.getItem('pr_onboarded') === '1';
    const modal = document.getElementById('onboard');
    if (seen || !modal) return;

    // year chips
    const wrap = document.getElementById('ob_years');
    const title = document.getElementById('ob_title');
    YEARS.forEach(y=>{
      const d = document.createElement('div');
      d.className = 'chip';
      d.textContent = y;
      d.onclick = ()=> {
        Array.from(wrap.children).forEach(c=>c.classList.remove('active'));
        d.classList.add('active');
        d.setAttribute('data-active','1');
      };
      wrap.appendChild(d);
    });
    document.getElementById('ob_cancel').onclick = ()=> modal.style.display = 'none';
    document.getElementById('ob_save').onclick = ()=>{
      const chosen = Array.from(wrap.children).find(c=>c.classList.contains('active'));
      const yr = chosen ? chosen.textContent : 'Y10';
      const ttl = title.value.trim() || 'Undergrad';
      localStorage.setItem('pr_year', yr);
      localStorage.setItem('pr_title', ttl);
      localStorage.setItem('pr_onboarded','1');
      // seed ELO for all ladders up to selected year for enabled subjects
      const subjects = ['Mechanics','Waves']; // currently live subjects
      const maxIdx = YEARS.indexOf(yr);
      for (const sub of subjects){
        for (let i=0;i<=maxIdx;i++){
          const key = `${sub}_${YEARS[i]}`;
          if (PlayerRank.getElo(key) === null) PlayerRank.setElo(key, 1150); // Silver IV seed
        }
      }
      // default selection: Mechanics Y10 (per your choice)
      localStorage.setItem('pr_selSub','Mechanics');
      localStorage.setItem('pr_selLvl','Y10');
      modal.style.display = 'none';
      // update header title if present
      const headTitle = document.getElementById('u_title');
      if (headTitle) headTitle.textContent = ttl;
    };

    modal.style.display = 'flex';
  }

  return { maybeOpen };
})();
