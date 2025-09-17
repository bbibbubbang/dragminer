// pgs_integration.js — include in your GitHub Pages index.html
window.state = window.state || {};

window.onGameLoaded = function (raw) {
  try { if (raw) Object.assign(window.state, JSON.parse(raw)); } catch(e){}
  if (window.renderAll) try { renderAll(); } catch(e){}
};

window.onSaveResult = function(ok){};

setInterval(function(){
  if (window.Native && Native.saveState) {
    try { Native.saveState(JSON.stringify(window.state)); } catch(e){}
  }
}, 5000);

document.addEventListener('DOMContentLoaded', function(){
  if (window.Native && Native.loadState) { try { Native.loadState(); } catch(e){} }
  if (window.Native && Native.queryPgsStatus) { try { Native.queryPgsStatus(); } catch(e){} }
});

window.__pgsStatus = function (loggedIn, optIn) {
  const statusEl = document.getElementById('pgs-status');
  const actionsEl = document.getElementById('pgs-actions');
  if (!statusEl || !actionsEl) return;

  statusEl.textContent =
    (optIn !== 1) ? "클라우드 저장: 사용 안 함"
    : (loggedIn ? "클라우드 저장: 로그인됨" : "클라우드 저장: 로그인 필요");

  actionsEl.innerHTML = "";
  const toggle = document.createElement('button');
  toggle.textContent = (optIn === 1) ? "클라우드 저장 끄기" : "클라우드 저장 켜기";
  toggle.onclick = () => { if (window.Native && Native.setPgsOptIn) { try { Native.setPgsOptIn(optIn === 1 ? 0 : 1); } catch(e){} } };
  actionsEl.appendChild(toggle);

  if (optIn === 1 && !loggedIn) {
    const btn = document.createElement('button');
    btn.textContent = "Play Games 로그인";
    btn.style.marginLeft = '8px';
    btn.onclick = () => { if (window.Native && Native.signInPgs) { try { Native.signInPgs(); } catch(e){} } };
    actionsEl.appendChild(btn);
  }
};

window.refreshPgsBox = function(){
  if (window.Native && Native.queryPgsStatus) { try { Native.queryPgsStatus(); } catch(e){} }
};
