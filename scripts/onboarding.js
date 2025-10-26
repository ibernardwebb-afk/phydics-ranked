// onboarding.js — UG1 edition: title-only modal + seed UG1 ladders

const Onboarding = (()=>{

  function maybeOpenUG1(){
    const seen = localStorage.getItem('pr_onboarded_ug1') === '1';
    const modal = document.getElementById('onboard');
    if (!modal || seen) return;

    const title = document.getElementById('ob_title');
    document.getElementById('ob_save').onclick = ()=>{
      const ttl = (title.value || '').trim() || 'Undergrad';
      localStorage.setItem('pr_title', ttl);
      localStorage.setItem('pr_onboarded_ug1','1');

      // seed Silver IV (~1150) for all UG1 ladders
      const subs = ['Mechanics','Waves','EM','Thermal','Quantum'];
      subs.forEach(s=>{
        const key = `${s}_UG1`;
        if (PlayerRank.getElo(key) === null) PlayerRank.setElo(key, 1150);
      });

      // default selection stays whatever user last picked; ensure UG1 level saved
      localStorage.setItem('pr_selLvl','UG1');

      modal.style.display = 'none';
      const headTitle = document.getElementById('u_title');
      if (headTitle) headTitle.textContent = ttl;
    };

    modal.style.display = 'flex';
  }

  return { maybeOpenUG1 };
})();
